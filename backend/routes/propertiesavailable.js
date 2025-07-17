const express = require('express');
const router = express.Router();
const propertiesAvailableController = require('../controllers/propertiesavailableController');

router.get('/', propertiesAvailableController.getAvailableProperties);

module.exports = router;
