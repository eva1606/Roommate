const express = require("express");
const router = express.Router();
const { getPotentialRoommates } = require("../controllers/potentialRoomatesController");

router.get("/:userId", getPotentialRoommates);

module.exports = router;
