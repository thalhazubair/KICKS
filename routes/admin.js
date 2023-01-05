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
router.post('/posteditcategory/:id',adminController.postupdateCategory)

router.get('/product',adminController.getProduct)
router.get('/addproduct',adminController.addProduct)
router.post('/addproduct',adminController.postProduct)
router.get('/edit/:id',adminController.editProduct)
router.post('/edit/:id',adminController.postupdateProduct)

router.get('/coupon',adminController.getCoupon)
router.get('/addcoupon',adminController.getAddCoupon)
router.post('/addcoupon',adminController.postCoupon)
router.post('/salesFilter',adminController.getSalesFilter)

router.get("/deleteproduct/:id",adminController.deleteProduct);

router.get('/orderDetails',adminController.getorderDetails)
router.post( "/changeStatus/:id",adminController.postchangeStatus)

router.get('/download',adminController.getDownload)

router.get('/logout',adminController.getLogout)
module.exports = router