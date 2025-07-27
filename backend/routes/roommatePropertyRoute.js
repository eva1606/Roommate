const express = require('express');
const router = express.Router();
const { getRoommatePropertyAndColocs } = require('../controllers/myRoomateController');

// Endpoint principal
router.get('/:userId', getRoommatePropertyAndColocs);

module.exports = router;
