const express = require('express');

const router = express.Router();
const schoolController = require('../../controllers/school-class-controller');
const utils = require('../../middleware/utils');

// 查询班级列表
router.get('/', utils.refsFull, schoolController.find);
// 查询班级数量
router.get('/count', utils.refsFull, schoolController.count);
// 根据id查询班级
router.get('/:id', schoolController.findById);

module.exports = router;

