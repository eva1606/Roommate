const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary'); // ✅ AJOUT OBLIGATOIRE
const { getProfileById, updateProfileById } = require('../controllers/profileController');

// Route GET pour récupérer le profil
router.get('/:id', getProfileById);

// Route PUT avec upload de photo
router.put('/:id', upload.single('photo'), updateProfileById); // ✅ Correctement défini

module.exports = router;
