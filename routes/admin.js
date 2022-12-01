const express = require("express")
const router = express.Router()
const adminController = require('../controller/adminController/adminController')

router.get('/',adminController.getLogin)
router.post('/login',adminController.postHome)
router.get('/login',adminController.getHome)

router.get('/table',adminController.getTable)
router.get("/blockuser/:id",adminController.blockuser);
router.get("/unblockuser/:id",adminController.unblockuser);

router.get('/category',adminController.getCategory)
router.get('/addcategory',adminController.addCategory)
router.post('/addcategory',adminController.postCategory)
router.get('/editcategory/:id',adminController.editCategory)
router.post('/posteditcategory/:id',adminController.updateCategory)

router.get('/product',adminController.getProduct)
router.get('/addproduct',adminController.addProduct)
router.post('/addproduct',adminController.postProduct)

router.get('/edit',adminController.editProduct)
router.post('/edit/:name',adminController.updateProduct)

router.get('/logout',adminController.getLogout)
module.exports = router