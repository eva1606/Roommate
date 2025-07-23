const express = require('express');
const router = express.Router();
const { getCompatibleRoommates } = require('../controllers/potentialRoomatesController');

// 👇 Nouvelle route : GET /api/potential-roommates/:id
router.get('/:id', getCompatibleRoommates);

module.exports = router;
