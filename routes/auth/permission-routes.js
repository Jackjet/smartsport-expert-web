const express = require('express');
const depend = require('../../configs/permission-depend.json');

const router = express.Router();

// 获取角色权限依赖关系
router.get('/depend', (req, res) => {
  res.api(depend);
});

module.exports = router;
