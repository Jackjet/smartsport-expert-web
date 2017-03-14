const express = require('express');
const utils = require('../../middleware/utils');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/knowledge-point-controller');

router.use('/',  passport.authenticate('permission'));
// 查询分类
router.get('/', utils.refsFull, controller.find);

module.exports = router;
