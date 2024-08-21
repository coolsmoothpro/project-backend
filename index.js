const express= require("express");
const Connection=require("./config/db");
const fs = require('fs');
const path = require('path');

const app=express();

const AuthRoute = require("./routes/Auth");
const UserRoute = require("./routes/User");
const ProjectRoute = require("./routes/Project");
const TeamRoute = require("./routes/Team");

const PORT=process.env.PORT || 8000;

Connection();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    next();
});

if (!fs.existsSync(path.join(__dirname, "uploads"))) {
    fs.mkdirSync(path.join(__dirname, "uploads"));
}

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/project", ProjectRoute);
app.use("/api/v1/team", TeamRoute);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle all other routes and return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
     console.log(`server is running at port ${PORT}`);
});