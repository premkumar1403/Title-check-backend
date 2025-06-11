const express = require("express");
const fileController = require("../controller/file.controller");
const router = express.Router();
const upload = require("../middleware/multer");
const { authenticateToken } = require("../middleware/auth");

//file uploading route
router.post("/file-upload", upload.single("file"), fileController.createFile);

//file getting rpute
router.get("/file-get", fileController.getFile);

//specific Title checking route
router.get("/file-title", fileController.searchTitle);

//getting conference name route
router.get("/conf-name",fileController.confNameFilter);

//conference name uploaded route
router.post("/confname-upload",fileController.confNameUpload);

//Deision comment uploaded route
router.post("/conf-cmd",fileController.confCmdUpload);

module.exports = router;
