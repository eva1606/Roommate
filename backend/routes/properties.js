const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary');
const { addProperty, getProperties, deleteProperty, getPropertyById, updateProperty, getPropertiesForRoommate, getAvailableProperties, getRentedProperties, uploadDocument, getDocumentsForProperty, getRoommatesForProperty} = require('../controllers/propertyController');

router.get('/roommates/:propertyId', getRoommatesForProperty);
router.get('/documents/:propertyId', getDocumentsForProperty);
router.get('/available/:user_id', getAvailableProperties);
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
router.post('/upload', upload.single('file'), uploadDocument);


module.exports = router;