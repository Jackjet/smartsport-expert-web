const express = require('express');
const passport = require('passport');
const connect = require('connect-multiparty');

const router = express.Router();
const medicalController = require('../../controllers/medical-controller');
const utils = require('../../middleware/utils');

// 创建体检报告
router.post('/', passport.authenticate('permission'), medicalController.createOrUpdate);

// 编辑体检报告
router.put('/:id', passport.authenticate('permission'), medicalController.createOrUpdate);

// 查询体检报告条数
router.get('/count', passport.authenticate('permission'), utils.refsFull, medicalController.count);

// 查询体检报告列表
router.get('/', passport.authenticate('permission'), utils.refsFull, medicalController.get);

// 根据id查询体检报告详情
router.get('/:id', passport.authenticate('permission'), utils.refsFull, medicalController.getById);

// 删除体检报告
router.delete('/:id', passport.authenticate('permission'), medicalController.delete);

// 导入体检报告
router.post('/import', connect(), medicalController.import);

module.exports = router;
