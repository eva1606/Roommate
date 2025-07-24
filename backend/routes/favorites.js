// routes/favorites.js
const express = require('express');
const router = express.Router();
const { getUserFavorites } = require('../controllers/favoritesController');

router.get('/:userId', getUserFavorites);
module.exports = router;
