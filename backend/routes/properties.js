const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary');
const { addProperty, getProperties, deleteProperty, getPropertyById, updateProperty, getPropertiesForRoommate, getAvailableProperties, getRentedProperties} = require('../controllers/propertyController');

router.get('/available/:ownerId', getAvailableProperties);
router.get('/rented/:ownerId', getRentedProperties);
router.get('/:id', getPropertyById);
router.get('/', getProperties); 
router.delete('/:id', deleteProperty);
router.post(
    '/add',
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'photos', maxCount: 5 }
    ]),
    addProperty
  );
router.put('/:id', updateProperty);
router.post('/card', getPropertiesForRoommate);


module.exports = router;