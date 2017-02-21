const express = require('express');

const router = express.Router();
const expertPermissionCtrl = require('../../controllers/expert-permission-controller');

// 获取所有专家权限
router.get('/', expertPermissionCtrl.getAll);

// 通过id获取特定角色的所有权限
router.get('/:id', expertPermissionCtrl.getRolePermission);

exports = module.exports = router;

