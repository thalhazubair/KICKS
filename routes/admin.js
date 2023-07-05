const express = require("express")
const router = express.Router()
const adminController = require('../controller/adminController/adminController')
const adminsession = require('../middleware/session')

router.get('/',adminController.getLogin)
router.post('/login',adminController.postHome)
router.get('/login',adminController.getHome)

router.get('/table',adminsession.verifyLoginAdmin,adminController.getTable)
router.get("/blockuser/:id",adminsession.verifyLoginAdmin,adminController.blockuser);
router.get("/unblockuser/:id",adminsession.verifyLoginAdmin,adminController.unblockuser);

router.get('/category',adminsession.verifyLoginAdmin,adminController.getCategory)
router.get('/addcategory',adminsession.verifyLoginAdmin,adminController.addCategory)
router.post('/addcategory',adminsession.verifyLoginAdmin,adminController.postCategory)
router.get('/editcategory/:id',adminsession.verifyLoginAdmin,adminController.editCategory)
router.post('/posteditcategory/:id',adminsession.verifyLoginAdmin,adminController.postupdateCategory)

router.get('/product',adminsession.verifyLoginAdmin,adminController.getProduct)
router.get('/addproduct',adminsession.verifyLoginAdmin,adminController.addProduct)
router.post('/addproduct',adminsession.verifyLoginAdmin,adminController.postProduct)
router.get('/edit/:id',adminsession.verifyLoginAdmin,adminController.editProduct)
router.post('/edit/:id',adminsession.verifyLoginAdmin,adminController.postupdateProduct)

router.get('/coupon',adminsession.verifyLoginAdmin,adminController.getCoupon)
router.get('/addcoupon',adminsession.verifyLoginAdmin,adminController.getAddCoupon)
router.post('/addcoupon',adminsession.verifyLoginAdmin,adminController.postCoupon)
router.post('/salesFilter',adminsession.verifyLoginAdmin,adminController.getSalesFilter)

router.get("/deleteproduct/:id",adminsession.verifyLoginAdmin,adminController.deleteProduct);

router.get('/orderDetails',adminsession.verifyLoginAdmin,adminController.getorderDetails)
router.post( "/changeStatus/:id",adminsession.verifyLoginAdmin,adminController.postchangeStatus)

router.get('/download',adminsession.verifyLoginAdmin,adminController.getDownload)

router.get('/logout',adminController.getLogout)
module.exports = router