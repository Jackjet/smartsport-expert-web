const express = require('express');
const passport = require('passport');

const router = express.Router();
const knowledgeController = require('../../controllers/knowledge-controller');
const utils = require('../../middleware/utils');

// 查询知识类型列表
router.get('/', utils.refsFull, knowledgeController.getType);

module.exports = router;