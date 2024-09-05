const mongoose = require("mongoose");

const Project = mongoose.model(
    "Project",
    new mongoose.Schema({
        projectLogo: String,
        projectName: String,
        projectDescription: String,
        clientId: String,
        client: String,
        startDate: String,
        dueDate: String,
        attachedFiles: Array,
        terms: String,
        expectedValue: Number,
        milestone: String,
        members: Array,
        status: String,
        tasks: Array
    })
);

module.exports = Project;