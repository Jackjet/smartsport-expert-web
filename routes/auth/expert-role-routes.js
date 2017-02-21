const express = require('express');

const router = express.Router();
const expertRoleCtrl = require('../../controllers/expert-role-controller');

// 查询所有专家角色
router.get('/', expertRoleCtrl.find);

// 通过id查询指定专家角色
router.get('/:id', expertRoleCtrl.findById);

// 创建专家角色
router.post('/', expertRoleCtrl.create);

// 更新专家角色
router.put('/:id', expertRoleCtrl.update);

// 删除专家角色
router.delete('/:id', expertRoleCtrl.delete);

exports = module.exports = router;

