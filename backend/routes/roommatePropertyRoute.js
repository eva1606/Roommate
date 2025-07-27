const express = require("express");
const router = express.Router();

// ⚠️ Vérifie bien que le chemin est correct
const { getMyRoommateProperty } = require("../controllers/myRoommateController");

// ✅ Route GET pour récupérer la propriété + colocataires + documents
router.get("/:userId", getMyRoommateProperty);

module.exports = router;
