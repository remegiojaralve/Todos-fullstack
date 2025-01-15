const API_URL = process.env.REACT_APP_API_URL;

//Get all task
export const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if(!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json();
  } catch(error) {
    console.error('Failed to fetch tasks: ', error);
  }
}

//Add task
export const addTask = async (title) => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({title}),
    })

    if(!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return await response.json();
  } catch(error) {
    console.error("Failed to add task: ", error);
  }
}

//Update task
export const updateTask = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updates)
    });

    if(!response.ok) {
      throw new Error(`Error ${response.statusText}`);
    }
    
    return await response.json();
  } catch(error) {
    console.error("Failed to update task: ", error);
  }
}

export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"}
    });

    if(!response.ok) {
      throw new Error(`Error ${response.statusText}`);
    }

    return {message: `Task with an ID of ${id} was successfully deleted.`};

  } catch(error) {
    console.error("Failed to delete task: ", error);
  }
}