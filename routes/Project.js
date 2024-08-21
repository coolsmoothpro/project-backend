const express = require("express");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ProjectController = require("../controllers/ProjectController");

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {            
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now().toString() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

router.post("/create", upload.array('files', 10), ProjectController.createProject);
router.get("/list", ProjectController.projectList);
router.post("/getById", ProjectController.getProject);
router.post("/update-project-status", ProjectController.updateProjectStatus);
router.post("/update-project", ProjectController.updateProject);
router.post("/send-invite", ProjectController.sendInvite);
router.post("/accept-invite", ProjectController.acceptInvite);
router.post("/task-create", ProjectController.createTask);
router.post("/task-list", ProjectController.taskList);
router.post("/task-update", ProjectController.updateTaskStatus);

module.exports = router;