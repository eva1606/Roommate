const express = require('express');
const router = express.Router();
const { getFilteredApartments, saveAvailableApartments,addToFavorites,deleteValidApartment } = require('../controllers/propertiesavailableController');

router.get('/filtered/:id', getFilteredApartments);
router.put('/save/:id', saveAvailableApartments); // 👈 Nouvelle route PUT
router.post('/favorites', addToFavorites);
router.delete('/apartment-valid/:id', deleteValidApartment);

module.exports = router;
