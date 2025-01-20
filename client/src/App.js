import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { fetchTasks, addTask, updateTask, deleteTask } from "./services/api";
import './App.css';

const Overlay = lazy(() => import("./components/Overlay"));

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskToUpdate, setTaskToUpdate] = useState({});
  const [overlayActive, setOverlayActive] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Debounce function to reduce loadTasks frequency
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedLoadTasks = useCallback(debounce(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, 500), []);

  // Load tasks on mount
  useEffect(() => {
    debouncedLoadTasks();
  }, [debouncedLoadTasks]);

  // Optimistic Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setIsAdding(true);
      const temporaryTask = { _id: Date.now(), title: newTask.trim(), completed: false }; // Temporary ID
      setTasks((prev) => [...prev, temporaryTask]);

      try {
        const savedTask = await addTask(newTask.trim());
        setTasks((prev) =>
          prev.map((task) => (task._id === temporaryTask._id ? savedTask : task))
        );
      } catch (error) {
        console.error("Failed to add task:", error);
        setTasks((prev) => prev.filter((task) => task._id !== temporaryTask._id));
      } finally {
        setNewTask("");
        setIsAdding(false);
      }
    }
  };

  // Optimistic Update Task
  const handleTaskUpdates = async (id, updates) => {
    setIsUpdating(true);
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, ...updates } : task
      )
    );

    try {
      await updateTask(id, updates);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Optimistic Delete Task
  const handleDeleteTask = async (id) => {
    setDeletingTaskId(id);
    setTasks((prev) => prev.filter((task) => task._id !== id));

    try {
      await deleteTask(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleEdit = (taskItem) => {
    setTaskToUpdate(taskItem);
    setOverlayActive(true);
  };

  const closeOverlay = () => {
    setOverlayActive(false);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      {isLoading && (
        <div className="loading-screen">
          <div className="loading"></div>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && (
        <div className="task">
          <h2 className="task-heading">Make it happen!</h2>
          <form onSubmit={handleAddTask}>
            <input
              className="task-input"
              type="text"
              name="addTask"
              value={newTask}
              placeholder="Enter new todo ..."
              maxLength={20}
              onChange={(e) => setNewTask(e.target.value)}
              required
            />
            <button className="button" type="submit" disabled={isAdding}>
              {isAdding ? "Adding..." : "Add"}
            </button>
          </form>
          {tasks && tasks.length > 0 ? (
            <>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li
                    className={`task-item${task.completed ? " is-done" : ""}${deletingTaskId === task._id ? " is-deleted" : ""}`}
                    key={task._id}
                  >
                    <div className="task-item-left">
                      <button
                        className="task-check"
                        disabled={isUpdating}
                        onClick={() => handleTaskUpdates(task._id, { completed: !task.completed })}
                      ></button>
                      <span>{task.title}</span>
                    </div>
                    <div className="task-item-right">
                      <button className="task-edit" onClick={() => handleEdit(task)}></button>
                      <button
                        className="task-delete"
                        onClick={() => handleDeleteTask(task._id)}
                      ></button>
                    </div>
                  </li>
                ))}
              </ul>
              <Suspense fallback={<div>Loading...</div>}>
                <div className={overlayActive ? "overlay is-active" : "overlay"}>
                  {overlayActive && (
                    <Overlay
                      taskItem={taskToUpdate}
                      updateFunction={handleTaskUpdates}
                      closeFunction={closeOverlay}
                    />
                  )}
                </div>
              </Suspense>
            </>
          ) : (
            <p>No data available</p>
          )}
        </div>
      )}
    </>
  );
};

export default App;