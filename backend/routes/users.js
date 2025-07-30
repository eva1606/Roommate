const express = require('express');
const router = express.Router();
const upload = require('../middleware/cloudinary'); 
const { loginUser, registerUser } = require('../controllers/userController');

router.post('/login', loginUser);

router.post('/register', upload.single('photo'), registerUser);

module.exports = router;
