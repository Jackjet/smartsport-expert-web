const express = require('express');
// const passport = require('passport');

const router = express.Router();
const Controller = require('../controllers/physique-subject-controller');

const controller = new Controller();


// 查询所有
router.get('/', controller.find.bind(controller));

// 通过id查询指定
router.get('/:id', controller.findById.bind(controller));

module.exports = router;
