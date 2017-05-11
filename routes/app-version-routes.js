/**
 * app版本管理路由
 * @module app-version-routes
 */

const express = require('express');

const router = express.Router();
const controller = require('../controllers/app-version-controller');
const utils = require('../middleware/utils');

// 查询列表
router.get('/', utils.refsFull, controller.find);

// 查询总数
router.get('/count', utils.refsFull, controller.count);

// 通过id查询指定记录
router.get('/:id', controller.findById);


module.exports = router;
