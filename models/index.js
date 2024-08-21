const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./User");
db.role = require("./Role");
db.team = require("./Team");
db.project = require("./Project");
db.task = require("./Task");

module.exports = db;