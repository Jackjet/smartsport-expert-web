const express = require('express');
const passport = require('passport');


const router = express.Router();
const expertPermissionCtrl = require('../../controllers/expert-permission-controller');

// 获取所有专家权限
router.get('/', passport.authenticate('permission'), expertPermissionCtrl.getAll);

// 通过id获取特定角色的所有权限
router.get('/:id', passport.authenticate('permission'), expertPermissionCtrl.getRolePermission);

exports = module.exports = router;

