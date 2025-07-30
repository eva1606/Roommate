const express = require('express');
const router = express.Router();
const controller = require('../controllers/propertiesavailableController');

router.get('/filtered/:userId', controller.getFilteredApartments);
router.post('/favorites', controller.addToFavorites);
router.get('/favorites/:userId', controller.getFavoriteApartments);
router.delete('/favorites/remove', controller.removeFromFavorites);
router.delete('/hidden', controller.hideApartment);



module.exports = router;
