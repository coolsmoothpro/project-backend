const express = require("express");

const TeamController = require("../controllers/TeamController");

const router = express.Router();

router.post("/create", TeamController.createTeam);
router.post("/list", TeamController.teamList);
router.post("/delete", TeamController.deleteTeam);

module.exports = router;