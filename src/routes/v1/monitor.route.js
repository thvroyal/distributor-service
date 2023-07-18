const express = require('express');
const auth = require('../../middlewares/auth');
const monitorController = require('../../controllers/monitor.controller');

const router = express.Router();

router.route('/').get(monitorController.getProjectStatus);

module.exports = router;
