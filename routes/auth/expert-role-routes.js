const express = require('express');
const passport = require('passport');

const router = express.Router();
const expertRoleCtrl = require('../../controllers/expert-role-controller');
const expertPCtrl = require('../../controllers/expert-permission-controller');
const utils = require('../../middleware/utils');


// 查询所有专家角色
router.get('/', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertRoleCtrl.find);

router.get('/permission', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertPCtrl.getAll);

router.get('/permission/:id', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertPCtrl.getRolePermission);

// 通过id查询指定专家角色
router.get('/:id', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertRoleCtrl.findById);

// 创建专家角色
router.post('/', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertRoleCtrl.create);

// 更新专家角色
router.put('/:id', passport.authenticate('permission'),
  utils.getUserInfo('expert-user'), expertRoleCtrl.update);

// 删除专家角色
router.delete('/:id', passport.authenticate('permission'), expertRoleCtrl.delete);

exports = module.exports = router;

