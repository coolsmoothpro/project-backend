const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    avatar: String,
    clientId: String,
    organization: String,
    address: String,
    website: String,
    clientPhone: String,
    firstname: String,
    lastname: String,
    email: String,
    adminPhone: String,
    status: String,
    location: {
        country: String,
        city: String,
        state: String,
    },
    address1: String,
    address2: String,
    zipcode: String,
    password: String,
    role: String,
}, { timestamps: true });

const Client = mongoose.model('Client', ClientSchema);

module.exports = Client;
