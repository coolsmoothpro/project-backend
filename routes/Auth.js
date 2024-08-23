const express = require("express");

const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/signin", AuthController.signin);
router.post("/current-user", AuthController.getCurrentUser);
router.post("/update-user", AuthController.updateUser);
router.post("/delete-user", AuthController.deleteUser);
router.post("/update-password", AuthController.updatePassword);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password-action", AuthController.resetPasswordAction);
router.post("/set-status", AuthController.setStatus);

module.exports = router;