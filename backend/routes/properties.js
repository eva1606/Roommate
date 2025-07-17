const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary');
const { addProperty, getProperties, deleteProperty, getPropertyById, updateProperty } = require('../controllers/propertyController');

router.get('/:id', getPropertyById);
router.get('/', getProperties); 
router.delete('/:id', deleteProperty);
router.post('/add', upload.single('photo'), addProperty);
router.put('/:id', updateProperty);

module.exports = router;
