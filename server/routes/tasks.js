const express = require('express');
const Task = require('../models/Tasks');
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    console.log("tasks", tasks);
    res.json(tasks);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

//Add new task
router.post("/", async (req, res) => {
  try {
    const newTask = new Task({title: req.body.title});
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch(err) {
    res.status(400).json({error: err.message});
  }
});

//Update task status
router.patch("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if(!deletedTask) return res.status(404).json({error: "Task not found."});
    res.json(deletedTask);
  } catch(err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;