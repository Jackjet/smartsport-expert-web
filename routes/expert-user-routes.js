const express = require('express');

const router = express.Router();
const userController = require('../controllers/expert-user-controller');

router.post('/login', userController.login);

exports = module.exports = router;

