const express = require('express');
const ClientController = require('../controllers/ClientController');

const router = express.Router();

router.post('/create', ClientController.createClient);
router.get('/list', ClientController.getClients);
router.post('/signin', ClientController.signin);
router.post('/reset-password-action', ClientController.resetPasswordAction);
router.post('/getById', ClientController.getById);

module.exports = router;
