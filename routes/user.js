const express = require("express")
const router = express.Router()
const userLogin = require('../controller/userController/userLogin')
const userSignup = require('../controller/userController/userSignup')

router.get("/",userLogin.getPage)
router.get("/home",userLogin.getHome)
router.get("/login",userLogin.getLogin)
router.post("/login",userLogin.postLogin)
router.get("/signup",userSignup.getSignup)


router.post("/signup",userSignup.postSignup)
router.post("/otpsignup",userSignup.postOtpsignup)

router.get('/logout',userLogin.getLogout)

module.exports = router