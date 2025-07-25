const express = require("express");
const router = express.Router();
const { getPotentialRoommates } = require("../controllers/potentialRoommatesController");

router.get("/:userId", getPotentialRoommates);

module.exports = router;
