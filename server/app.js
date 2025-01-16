const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRouter = require('./routes/tasks');
require('dotenv').config();

mongoose
.connect(process.env.DB_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error", err));

const app = express();
app.use(express.json());

// CORS config
// const allowedOrigins = ['http://localhost:3000/'];
// const corsOptions = {
//   origin: process.env.CORS_ORIGIN || 'https://todos-fe.onrender.com/',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
// };
app.use(cors());

app.use("/tasks", taskRouter);

module.exports = app;