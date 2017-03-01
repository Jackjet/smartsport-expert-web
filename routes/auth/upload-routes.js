const express = require('express');
const uploaderController = require('../../controllers/uploader-controller');

const router = express.Router();

router.get('/knowledge', uploaderController.getExpertKnowledgePolicy);

module.exports = router;
