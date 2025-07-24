const express = require('express');
const router = express.Router();
const controller = require('../controllers/propertiesavailableController');

// Route pour récupérer les propriétés filtrées selon le profil utilisateur
router.get('/filtered/:userId', controller.getFilteredApartments);

module.exports = router;
