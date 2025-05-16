const express = require("express")
const fileController = require("../controller/file.controller")
const router = express.Router();
const upload = require("../middleware/multer")

//file uploading route
router.post("/file-upload",upload.single("file"),fileController.createFile);

//paper title_name uploading route
router.post('/file-title', fileController.searchTitle);

//paper author_mail uploading route 
router.post("/author-mail", fileController.searchEmail);

//conference name uploading route
router.post('/conference-name', fileController.searchConference);

module.exports = router;