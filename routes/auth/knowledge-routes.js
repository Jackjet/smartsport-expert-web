const express = require('express');
const passport = require('passport');

const router = express.Router();
const knowledgeController = require('../../controllers/knowledge-controller');
const utils = require('../../middleware/utils');

// 创建知识
router.post('/', passport.authenticate('permission'), knowledgeController.createOrUpdate);

// 编辑知识
router.put('/:id', passport.authenticate('permission'), knowledgeController.createOrUpdate);

// 查询知识条数
router.get('/count', passport.authenticate('permission'), utils.refsFull, knowledgeController.count);

// 查询知识列表
router.get('/', passport.authenticate('permission'), utils.refsFull, knowledgeController.get);

// 根据id查询知识详情
router.get('/:id', passport.authenticate('permission'), utils.refsFull, knowledgeController.getById);

// 审核知识
router.post('/audit/:id', passport.authenticate('permission', { type: 'audit' }), knowledgeController.audit);

// 查询当前用户是否有审核权限
router.get('/audit/own', knowledgeController.getOwnAudit);

module.exports = router;
