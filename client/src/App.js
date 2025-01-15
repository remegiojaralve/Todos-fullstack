import React, { useState, useEffect } from "react";
import { fetchTasks, addTask, updateTask, deleteTask } from "./services/api";
import './App.css'
import Overlay from "./components/Overlay";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToUpdate, setTaskToUpdate] = useState({});
  const [overlayActive, setOverlayActive] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const loadTasks = async () => {
    const data = await fetchTasks();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks()
    .then(() => {
      if(tasks && tasks.length > 0) {
        setIsLoading(false);
      }
    })
    .catch((error) => {
      setError('Failed to load tasks');
      console.error('Error Adding tasks: ', error)
    })
  }, [tasks]);
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    if(newTask.trim()) {
      setIsAdding(true);
      let task;
      try {
        task = await addTask(newTask.trim());
      } catch(error) {
        console.error('Failed to add task:', error);
      } finally {
        setTimeout(function() {
          loadTasks();
          setNewTask("");
          setIsAdding(false);
        }, 500)
      }
    }
  }

  const handleTaskUpdates = async (id, updates) => {
    await updateTask(id, updates);
    loadTasks();
  }

  const handleEdit = (taskItem) => {
    setTaskToUpdate(taskItem);
    setOverlayActive(true);
  }

  const closeOverlay = () => {
    setOverlayActive(false);
  }

  // const handleDeleteTask = async (id) => {
  //   await deleteTask(id);
  //   loadTasks();
  // }

  const handleDeleteTask = async (id) => {
    setDeletingTaskId(id); // Mark the task as being deleted
    setTimeout(async () => {
      await deleteTask(id); // Wait for the animation duration
      loadTasks();
      setDeletingTaskId(null); // Reset the state
    }, 500); // Match the duration of the CSS animation
  };

  if (error) {
    return <div>{error}</div>; // Displaying error if any
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
            <button className="button" type="submit" required>
              {isAdding ? "Adding..." : "Add"}
            </button>
          </form>
          {tasks && tasks.length > 0 ? (
            <>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li className={`task-item${task.completed ? " is-done" : ''}${deletingTaskId === task._id ? " is-deleted" : ""}`} key={task._id}>
                    <div className="task-item-left">
                      <button className="task-check" onClick={() => handleTaskUpdates(task._id, { completed: !task.completed })}></button>
                      <span>{task.title}</span> 
                    </div>
                    <div className="task-item-right">
                      <button className="task-edit" onClick={() => handleEdit(task)}></button>
                      <button className="task-delete" onClick={() => handleDeleteTask(task._id)}></button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={Object.keys(taskToUpdate).length > 0 && overlayActive ? "overlay is-active" : "overlay"}>
                <Overlay taskItem={taskToUpdate} updateFunction={handleTaskUpdates} closeFunction={closeOverlay}  />
              </div>
            </>
          ) : (
            <><p>No data available</p></>
          )
        }
          
        </div>
      )}
    </>
  )
}

export default App;
