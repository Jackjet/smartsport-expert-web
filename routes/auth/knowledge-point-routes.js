const express = require('express');
const utils = require('../../middleware/utils');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/knowledge-point-controller');

// 查询分类
router.get('/', passport.authenticate('permission'), utils.refsFull, controller.find);

module.exports = router;
