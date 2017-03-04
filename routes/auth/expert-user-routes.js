const express = require('express');
const passport = require('passport');

const router = express.Router();
const userController = require('../../controllers/expert-user-controller');
const utils = require('../../middleware/utils');

// 查询专家账号
router.get('/', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), utils.refsFull, userController.find);

// 创建专家账号
router.post('/', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), userController.create);

// 更新专家账号
router.put('/:id', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), userController.update);

// 查询专家账号数量
router.get('/count', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), utils.refsFull, userController.count);

// 专家账号修改密码
router.post('/change_password', userController.updatePwd);

exports = module.exports = router;

