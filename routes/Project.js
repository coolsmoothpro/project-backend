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
router.post("/list", ProjectController.projectList);
router.post("/getById", ProjectController.getProject);
router.post("/update-project-status", ProjectController.updateProjectStatus);
router.post("/update-project", ProjectController.updateProject);
router.post("/send-invite", ProjectController.sendInvite);
router.post("/accept-invite", ProjectController.acceptInvite);
router.post("/task-create", ProjectController.createTask);
router.post("/task-list", ProjectController.taskList);
router.post("/task-update", ProjectController.updateTaskStatus);
router.post("/delete-project", ProjectController.deleteProject);
router.post("/upload-project-file", upload.array('files', 10), ProjectController.uploadProjectFile);
router.post("/delete-file", ProjectController.deleteFile);
router.post("/delete-member", ProjectController.deleteMember);
router.post("/delete-task", ProjectController.deleteTask);
router.post("/edit-task", ProjectController.editTask);

module.exports = router;