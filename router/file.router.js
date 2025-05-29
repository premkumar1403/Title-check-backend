const express = require("express");
const fileController = require("../controller/file.controller");
const router = express.Router();
const upload = require("../middleware/multer");

//file uploading route
router.post("/file-upload", upload.single("file"), fileController.createFile);

//file getting rpute
router.get("/file-get", fileController.getFile);

//specific Title checking route
router.get("/file-title", fileController.searchTitle);

module.exports = router;
