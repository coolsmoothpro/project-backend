const mongoose = require("mongoose");
const env = require("dotenv");
const UserController = require("../controllers/UserController");

env.config();
const dbconnection = async () => {
    mongoose
        .connect(`mongodb://${process.env.MONGODB_URL}`)
        .then(async () =>  {
            await UserController.createSuperAdmin();
            console.log("Database connected")
        })
        .catch((err) => console.error(err));
};
module.exports = dbconnection;