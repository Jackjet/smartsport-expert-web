const express = require('express');
const utils = require('../../middleware/utils');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/competitive-ability-controller');

// 查询
router.get('/', passport.authenticate('permission'), utils.refsFull, controller.find);

module.exports = router;
