const express = require('express');

const router = express.Router();
const constitutionController = require('../controllers/constitution-controller');
const medicalController = require('../controllers/medical-controller');

// 下载体质报告模版
router.get('/constitution/download', constitutionController.template);

// 下载体检报告模版
router.get('/medical/download', medicalController.template);

module.exports = router;
