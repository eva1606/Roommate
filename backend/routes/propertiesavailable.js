const express = require('express');
const router = express.Router();

const { getFilteredApartments } = require('../controllers/propertiesavailableController');

// Route pour récupérer les appartements filtrés selon le profil utilisateur
router.get('/filtered/:id', getFilteredApartments);

module.exports = router;
