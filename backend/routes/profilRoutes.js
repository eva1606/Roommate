const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary');
const { getProfileById, updateProfileById } = require('../controllers/profileController');

router.get('/:id', getProfileById);

router.put('/:id', upload.single('photo'), updateProfileById); 

module.exports = router;
