const express = require('express');
const router = express.Router();
const { updateUserProfile } = require('../controllers/profil_users.controller');
const upload = require('../middleware/cloudinary');

router.put('/profil_users/:id', upload.single('photo'), updateUserProfile);

module.exports = router;