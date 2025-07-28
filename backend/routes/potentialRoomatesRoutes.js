const express = require("express");
const router = express.Router();
const {
  getPotentialRoommates,
  addFavoriteRoommate,
  removeFavoriteRoommate,
  getUserFavoriteRoommates,
  getRoommateDetail
} = require("../controllers/potentialRoomatesController"); // ✅ Vérifie le nom

// Route existante
router.get("/:userId", getPotentialRoommates);

// Nouvelles routes pour favoris
router.post("/add-favorite", addFavoriteRoommate);
router.delete("/remove-favorite", removeFavoriteRoommate);
router.get("/favorites/:userId", getUserFavoriteRoommates);
router.get("/profil/:id", getRoommateDetail);

module.exports = router;
