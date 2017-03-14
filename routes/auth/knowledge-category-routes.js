const express = require('express');
const utils = require('../../middleware/utils');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/knowledge-category-controller');

router.use('/',  passport.authenticate('permission'));
// 查询分类
router.get('/:id', controller.read);

// 创建分类
router.post('/', controller.create);

// 更新分类
router.put('/:id', controller.update);

// 删除
router.put('/:id', controller.delete);

module.exports = router;
