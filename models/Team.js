const mongoose = require("mongoose");

const Team = mongoose.model(
    "Team",
    new mongoose.Schema({
        clientId: String,
        teamName: String,
        teamDescription: String,
        members: Array,
    })
);

module.exports = Team;