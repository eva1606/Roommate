const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// 📁 Contrôleur principal
const {
  getMyRoommateProperty,
  uploadDocument
} = require("../controllers/myRoomateController");

// 🔧 Configuration Multer pour les uploads locaux
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // ✅ Le dossier "uploads" doit exister
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Route GET → récupère propriété, colocataires et documents
router.get("/:userId", getMyRoommateProperty);

// ✅ Route POST → upload d’un document
router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;
