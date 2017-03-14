const express = require('express');

const router = express.Router();
const GradeDictController = require('../controllers/grade-dict-controller');
const utils = require('../middleware/utils');
// 查询年级字典
router.get('/', utils.refsFull, GradeDictController.find);

module.exports = router;

