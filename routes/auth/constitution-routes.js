const express = require('express');
const passport = require('passport');

const router = express.Router();
const constitutionController = require('../../controllers/constitution-controller');
const utils = require('../../middleware/utils');

// 创建体质报告
router.post('/', passport.authenticate('permission'), constitutionController.createOrUpdate);

// 编辑体质报告
router.put('/:id', passport.authenticate('permission'), constitutionController.createOrUpdate);

// 查询体质报告条数
router.get('/count', passport.authenticate('permission'), utils.refsFull, constitutionController.count);

// 查询体质报告列表
router.get('/', passport.authenticate('permission'), utils.refsFull, constitutionController.get);

// 根据id查询体质报告详情
router.get('/:id', passport.authenticate('permission'), utils.refsFull, constitutionController.getById);

module.exports = router;
