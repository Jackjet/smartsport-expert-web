const schoolController = require('../../controllers/school-controller');
const utils = require('../../middleware/utils');
const express = require('express');
const passport = require('passport');

const router = express.Router();

// router.post('/', schoolController.createSchool);

// router.put('/:id', schoolController.updateSchool);

// router.get('/:id', utils.refsFull, schoolController.getSchool);

router.get('/', utils.refsFull, schoolController.getSchools);

router.get('/count', utils.refsFull, schoolController.getTotal);

module.exports = router;
