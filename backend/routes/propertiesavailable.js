const express = require('express');
const router = express.Router();
const { getFilteredApartments, saveAvailableApartments } = require('../controllers/propertiesavailableController');

router.get('/filtered/:id', getFilteredApartments);
router.put('/save/:id', saveAvailableApartments); // 👈 Nouvelle route PUT

module.exports = router;
