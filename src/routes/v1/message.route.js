const express = require('express');
const auth = require('../../middlewares/auth');
const messageController = require('../../controllers/message.controller');

const router = express.Router();

router.route('/').get(messageController.getProjectStatus);

module.exports = router;
