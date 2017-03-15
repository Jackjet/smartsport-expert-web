/**
 * 处方管理路由
 * @module exercise-prescription-routes
 */

const express = require('express');
const passport = require('passport');

const router = express.Router();
const controller = require('../../controllers/exercise-prescription-controller');
const utils = require('../../middleware/utils');

router.use('/',  passport.authenticate('permission'));
// 查询列表
router.get('/', utils.refsFull, controller.find);

// 查询总数
router.get('/count', utils.refsFull, controller.count);

// 通过id查询指定记录
router.get('/:id', controller.findById);

// 创建
router.post('/', controller.create);

// 更新
router.put('/:id', controller.update);

// 删除
router.delete('/:id', controller.delete);

exports = module.exports = router;
