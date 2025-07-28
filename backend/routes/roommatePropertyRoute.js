const express = require("express");
const router = express.Router();

// 📁 Contrôleur principal
const {
  getMyRoommateProperty,
  uploadDocument
} = require("../controllers/myRoomateController");

// 📤 Multer avec Cloudinary
const upload = require("../middleware/cloudinary");

// ✅ Route GET → récupère propriété, colocataires et documents
router.get("/:userId", getMyRoommateProperty);

// ✅ Route POST → upload d’un document
router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;
