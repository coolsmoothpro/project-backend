const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        avatar: String,
        firstname: String,
        lastname: String,
        email: String,
        password: String,
        phone: String,
        organization: String,
        department: String,
        accountType: String,
        location: {
            country: String,
            city: String,
            state: String,
        },
        address1: String,
        address2: String,
        zipcode: String,
        role: {
            type: String,
            enum: ["ADMIN", "ACCOUNT ADMIN", "PROJECT MANAGER", "USER"],
        }
    })
);

module.exports = User;