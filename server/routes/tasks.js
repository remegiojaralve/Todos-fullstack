const express = require('express');
const Task = require('../models/Tasks');
const router = express.Router();

// In-memory cache
let taskCache = null;
let cacheLastUpdated = null;
const CACHE_TTL = 60000; // 60 seconds

// Helper to refresh cache
const refreshCache = async () => {
  taskCache = await Task.find();
  cacheLastUpdated = Date.now();
};

// Middleware to ensure cache is up-to-date
const ensureCache = async () => {
  if (!taskCache || Date.now() - cacheLastUpdated > CACHE_TTL) {
    await refreshCache();
  }
};

// Get all tasks
router.get("/", async (req, res) => {
  try {
    await ensureCache();
    res.json(taskCache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new task
router.post("/", async (req, res) => {
  try {
    const newTask = new Task({ title: req.body.title });
    const savedTask = await newTask.save();

    // Update cache
    await refreshCache();

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task status
router.patch("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (req.body.title !== undefined) {
      task.title = req.body.title;
    }

    if (req.body.completed !== undefined) {
      task.completed = req.body.completed;
    }

    const updatedTask = await task.save();

    // Update cache
    await refreshCache();

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ error: "Task not found." });

    // Update cache
    await refreshCache();

    res.json(deletedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
