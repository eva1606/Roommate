const express = require('express');
const router = express.Router();
const { getProfileById, updateProfileById } = require('../controllers/profilController');

router.get('/:id', getProfileById);
router.put('/:id', upload.single('photo'), updateProfileById); // ✅ upload photo


module.exports = router;
