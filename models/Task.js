const mongoose = require("mongoose");

const Task = mongoose.model(
    "Task",
    new mongoose.Schema({
        taskName: String,
        members: Array,
        status: String
    })
);

module.exports = Task;