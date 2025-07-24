const express = require('express');
const router = express.Router();
const controller = require('../controllers/propertiesavailableController');

router.get('/filtered/:id', controller.getFilteredApartments);
router.post('/save/:id', controller.saveAvailableApartments);
router.post('/favorites', controller.addToFavorites);
router.post('/available/remove', controller.removeAvailableApartment);
router.get('/favorites/:userId', controller.getFavorites);

module.exports = router;
