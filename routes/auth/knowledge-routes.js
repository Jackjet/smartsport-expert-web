const express = require('express');

const router = express.Router();
const knowledgeController = require('../../controllers/knowledge-controller');
const utils = require('../../middleware/utils');

// 创建知识
router.post('/', knowledgeController.createOrUpdate);

// 编辑知识
router.put('/:id', knowledgeController.createOrUpdate);

// 查询知识条数
router.get('/count', utils.refsFull, knowledgeController.count);

// 查询知识列表
router.get('/', utils.refsFull, knowledgeController.get);

// 根据id查询知识详情
router.get('/:id', utils.refsFull, knowledgeController.getById);

// 审核知识
router.post('/audit/:id', knowledgeController.audit);

// 查询当前用户是否有审核权限
router.get('/audit/own', knowledgeController.getOwnAudit);

module.exports = router;
