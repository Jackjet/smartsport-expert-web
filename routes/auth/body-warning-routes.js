const express = require('express');
const passport = require('passport');

const router = express.Router();
const utils = require('../../middleware/utils');
const Controller = require('../../controllers/body-warning-controller');

const controller = new Controller('body-warning-controller.js', 'bodyTestManagement', 'warning');

router.use(passport.authenticate('permission'));

// 查询所有
router.get('/', utils.refsFull, controller.find.bind(controller));

// 通过id查询指定
router.get('/:id', controller.findById.bind(controller));

// 创建
router.post('/', controller.create.bind(controller));

// 更新
router.put('/:id', controller.update.bind(controller));

// 删除
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;
