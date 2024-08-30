const mongoose = require('mongoose');

const connections = {}; // Store connections based on tenant identifiers

const MultiConnection = async (tenant) => {
    if (connections[tenant]) {
        return connections[tenant];
    }

    const dbName = `tenant_${tenant}`;
    const dbURI = `mongodb://localhost/${dbName}`;

    const connection = await mongoose.createConnection(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    connections[tenant] = connection;

    return connection;
};

module.exports = MultiConnection;
