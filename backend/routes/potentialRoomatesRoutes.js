const express = require('express');
const router = express.Router();
const { getPotentialRoommates } = require('../controllers/potentialRoommatesController');

// 📥 GET /api/potential-roommates/:id
router.get('/:id', getPotentialRoommates);

module.exports = router;
