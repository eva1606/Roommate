const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/profilController');

// GET /api/profil_users/:id
router.get('/:id', getUserProfile);

module.exports = router;
