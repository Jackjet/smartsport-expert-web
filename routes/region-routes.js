const express = require('express');

const router = express.Router();
const regionController = require('../controllers/region-controller');
// 省市区三级联动
router.get('/', regionController.geRegion);
exports = module.exports = router;

