const express = require('express');
const utils = require('../../middleware/utils');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/knowledge-category-controller');

// 查询分类
router.get('/:id', passport.authenticate('permission'), utils.refsFull, controller.read);

// 创建分类
router.post('/', passport.authenticate('permission'), controller.create);

// 更新分类
router.put('/:id', passport.authenticate('permission'), controller.update);

// 删除
router.put('/:id', passport.authenticate('permission'), controller.delete);

module.exports = router;
