const express = require('express');


const router = express.Router();
const studentController = require('../../controllers/student-controller');
const utils = require('../../middleware/utils');

// 查询学生列表
router.get('/', utils.refsFull, studentController.find);
// 查询学生数量
router.get('/count', utils.refsFull, studentController.count);
// 根据id查询学生信息
router.get('/:id',  studentController.findById);
// 根据id删除学生信息


module.exports = router;
