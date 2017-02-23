const express = require('express');

const router = express.Router();
const userController = require('../controllers/expert-user-controller');

// 专家账号登录
router.post('/login', userController.login);

// 专家账号获取短信验证码
router.post('/verify_code', userController.getVerifyCode);

// 专家正好短信验证码校验
router.post('/verify', userController.verifyCode);

// 专家账号短信验证后重置密码
router.post('/set_password', userController.setPwd);

exports = module.exports = router;

