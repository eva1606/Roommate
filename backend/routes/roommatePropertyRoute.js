const express = require("express");
const router = express.Router();

const {
  getMyRoommateProperty,
  uploadDocument
} = require("../controllers/myRoomateController");

const upload = require("../middleware/cloudinary");

router.get("/:userId", getMyRoommateProperty);

router.post("/upload", upload.single("file"), uploadDocument);

module.exports = router;
