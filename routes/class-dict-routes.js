const express = require('express');

const router = express.Router();
const classDictController = require('../controllers/class-dict-controller');

// 查询班级字典
router.get('/', classDictController.find);

module.exports = router;
