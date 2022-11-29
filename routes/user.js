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
router.get("/otpsignup",userSignup.getOtpsignup)
router.post("/otpsignup",userSignup.getOtpsignup)

router.get('/logout',userLogin.getLogout)

module.exports = router