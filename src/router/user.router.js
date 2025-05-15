const express = require("express")
const userController=require("../controller/user.controller")
const router = express.Router()


//signup route
router.post('/signup', userController.Signup)

//signin route
router.post('/signin', userController.Signin)

module.exports = router;