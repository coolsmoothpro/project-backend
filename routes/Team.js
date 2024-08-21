const express = require("express");

const TeamController = require("../controllers/TeamController");

const router = express.Router();

router.post("/create", TeamController.createTeam);
router.get("/list", TeamController.teamList);

module.exports = router;