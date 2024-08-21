const mongoose = require("mongoose");

const Team = mongoose.model(
    "Team",
    new mongoose.Schema({
        teamName: String,
        teamDescription: String,
        industry: String,
        members: Array,
    })
);

module.exports = Team;