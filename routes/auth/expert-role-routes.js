const express = require('express');

const router = express.Router();
const expertRoleCtrl = require('../../controllers/expert-role-controller');
const utils = require('../../middleware/utils');


// 查询所有专家角色
router.get('/', utils.getUserInfo('expert-user'), expertRoleCtrl.find);

// 通过id查询指定专家角色
router.get('/:id', utils.getUserInfo('expert-user'), expertRoleCtrl.findById);

// 创建专家角色
router.post('/', utils.getUserInfo('expert-user'), expertRoleCtrl.create);

// 更新专家角色
router.put('/:id', utils.getUserInfo('expert-user'), expertRoleCtrl.update);

// 删除专家角色
router.delete('/:id', expertRoleCtrl.delete);

exports = module.exports = router;

