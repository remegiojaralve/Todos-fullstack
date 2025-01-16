const express = require('express');
const fs = require('fs');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 4000;
const {v4: uuidv4} = require('uuid');
const mongoose = require('mongoose');
const Task = require('./models/Tasks');
require('dotenv').config();

mongoose
.connect(process.env.DB_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error", err));

//Middleware for parsing JSON
app.use(express.json());

// CORS config
// const allowedOrigins = ['http://localhost:3000/'];
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://todos-fe.onrender.com/',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
};

app.use(cors(corsOptions));

//API Endpoints
//Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log("tasks", tasks);
    res.json(tasks);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

//Add new task
app.post("/tasks", async (req, res) => {
  try {
    const newTask = new Task({title: req.body.title});
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch(err) {
    res.status(400).json({error: err.message});
  }
});

//Update task status
app.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({error: "Task not found"});

    if(req.body.title !== undefined) {
      task.title = req.body.title;
    }

    if(req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if(!deletedTask) return res.status(404).json({error: "Task not found."});
    res.json(deletedTask);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

// app.use(express.static("public"));
// const path = require("path");
// app.use(express.static(path.join(__dirname, "../client/build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
