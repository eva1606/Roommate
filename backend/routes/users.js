const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary'); // Middleware multer ou cloudinary
const { loginUser, registerUser } = require('../controllers/userController');

// ✅ Connexion
router.post('/login', loginUser);

// ✅ Inscription avec upload de photo
router.post('/register', upload.single('photo'), registerUser);

module.exports = router;
