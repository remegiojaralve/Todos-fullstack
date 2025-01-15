const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const taskSchema = new mongoose.Schema({
    _id: {type: String, default: uuidv4},
    title: {type: String, required: true},
    completed: {type: Boolean, default: false},
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Todo", taskSchema);