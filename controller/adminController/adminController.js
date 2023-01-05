const User = require("../../model/user/signUpModel");
const category = require("../../model/admin/category");
const product = require("../../model/admin/products");
const moment = require('moment')
const Excel = require('exceljs');
const admin = { email: "admin@gmail.com", password: "1100" };
const mongoose = require("mongoose");
const cart = require("../../model/user/cart");
const order = require("../../model/user/orderdetails");
const coupon = require("../../model/admin/coupon")
const Session = require('../../model/user/session')

module.exports = {
  getLogin: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin/login");
    } else {
      res.render("admin/login");
    }
  },

  getTable: async (req, res) => {
    const usersData = await User.find({ is_admin: 0 });
    res.render("admin/table", { users: usersData });
  },

  postHome: (req, res) => {
    if (req.body.email === admin.email && req.body.password == admin.password) {
      req.session.admin = req.body.email;
      res.redirect("/admin/login");
    } else {
      res.render("admin/login", { err_message: "invalid Email or Password" });
    }
  },

  getSalesFilter:async(req,res)=>{

    if (req.session.admin) {
      const from = req.body.from
      const datefrom = new Date(from);
      const to = req.body.to
      const dateto = new Date(to);

      const options = { year: 'numeric', month: 'short', day: 'numeric' };

      const formattedDatefrom = datefrom.toLocaleDateString('en-US', options);
      const formattedDateto = dateto.toLocaleDateString('en-US', options);

      

      const data = await order.find({
        orderDate: {
          $gte: formattedDatefrom,
          $lte: formattedDateto
        }
      })


      const totalAmount = data.reduce((accumulator, object) => {
        return (accumulator += object.totalAmount);
      }, 0);

      const amountToday = await order.find({
        orderDate: moment().format("MMM Do YY"),
      });

      const totalAmountToday = amountToday.reduce((accumulator, object) => {
        return (accumulator += object.totalAmount);
      }, 0);

      const OrderToday = await order.find({
        orderDate: moment().format("MMM Do YY"),
      });

      const allOrders = data.length;
      const todayOrder = OrderToday.length;

      const Cod = await order.find({ paymentMethod : "COD" })
      const cashOnDelivery = Cod.length

      const Online = await order.find({ paymentMethod : "Online" })
      const onlinePayment = Online.length

      const pendingOrder = await order.find({ orderStatus: "pending" });
      const pending = pendingOrder.length;
  

      const cancelledOrder = await order.find({ orderStatus: "Cancelled" });
      const cancelled = cancelledOrder.length;
      

      const deliveredOrder = await order.find({ orderStatus: "delivered" });
      const delivered = deliveredOrder.length;
      
      const shippedOrder = await order.find({ orderStatus: "shipped" });
      const shipped = shippedOrder.length;


      res.render("admin/dashboard", {
        data,
        totalAmount,
        todayOrder,
        allOrders,
        totalAmountToday,
        cashOnDelivery,
        onlinePayment,
        shipped,delivered,cancelled,pending
      });
    } else {
      res.redirect("/admin");
    }

  },

  getHome: async (req, res) => {
    if (req.session.admin) {
      const data = await order.find();

      const totalAmount = data.reduce((accumulator, object) => {
        return (accumulator += object.totalAmount);
      }, 0);

      const amountToday = await order.find({
        orderDate: moment().format("MMM Do YY"),
      });

      const totalAmountToday = amountToday.reduce((accumulator, object) => {
        return (accumulator += object.totalAmount);
      }, 0);

      const OrderToday = await order.find({
        orderDate: moment().format("MMM Do YY"),
      });

      const allOrders = data.length;
      const todayOrder = OrderToday.length;

      const Cod = await order.find({ paymentMethod : "COD" })
      const cashOnDelivery = Cod.length

      const Online = await order.find({ paymentMethod : "Online" })
      const onlinePayment = Online.length

      const pendingOrder = await order.find({ orderStatus: "pending" });
      const pending = pendingOrder.length;
  

      const cancelledOrder = await order.find({ orderStatus: "Cancelled" });
      const cancelled = cancelledOrder.length;
      

      const deliveredOrder = await order.find({ orderStatus: "delivered" });
      const delivered = deliveredOrder.length;
      
      const shippedOrder = await order.find({ orderStatus: "shipped" });
      const shipped = shippedOrder.length;


      res.render("admin/dashboard", {
        data,
        totalAmount,
        todayOrder,
        allOrders,
        totalAmountToday,
        cashOnDelivery,
        onlinePayment,
        shipped,delivered,cancelled,pending
      });
    } else {
      res.redirect("/admin");
    }
  },

  blockuser: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      User.updateOne({ _id: id }, { $set: { isBlocked: true } }).then((data) => {
        if(data){
            const findBlocked = Session.find({userId :mongoose.Types.ObjectId(id)})
            console.log(findBlocked);
            if(findBlocked){
              Session.deleteMany({ userId: mongoose.Types.ObjectId(id)}).then((data)=>{
                console.log(data);
              })
              res.redirect("/admin/table");
            }
          }
      });
    } catch {
      console.error();
    }
  },

  unblockuser: (req, res) => {
    try {
      const id = req.params.id;
      User.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
        res.redirect("/admin/table");
      });
    } catch {
      console.error();
    }
  },

  getCategory: async (req, res) => {
    try {
      const categories = await category.find();
      if (categories) {
        res.render("admin/category", { categories });
      } else {
        res.send("No categories found");
      }
    } catch {
      console.error();
    }
  },

  addCategory: (req, res) => {
    const categoryExist = req.session.categoryExist;
    req.session.categoryExist = "";

    const fieldEmpty = req.session.fieldEmpty;
    req.session.fieldEmpty = "";

    res.render("admin/addcategory", { categoryExist, fieldEmpty });
  },

  postCategory: async (req, res) => {
    if (req.body.categories) {
      let categories = req.body.categories;
      const exist = await category.find({ categories: { $regex: new RegExp(`^${categories}$`, 'i') }});
      if (exist.length === 1) {
        req.session.categoryExist = "Category already exist";
        res.redirect("/admin/addcategory");
      } else {
        const newcategory = new category({
          categories: categories,
        });
        const data = await newcategory.save();
        if (data) {
          res.redirect("/admin/category");
        }
      }
    } else {
      req.session.fieldEmpty = "Field cannot be empty";
      res.redirect("/admin/addcategory");
    }
  },

  editCategory: async (req, res) => {
    const id = req.params.id;
    const data = await category.find({ _id: id });
    res.render("admin/editcategory", { data });
  },

  postupdateCategory: async (req, res) => {
    try {
      const id = req.params.id;
      await category.updateOne(
        { _id: id },
        { $set: { categories: req.body.categories } }
      );
      res.redirect("/admin/category");
    } catch {
      console.error();
    }
  },

  getProduct: async (req, res) => {
    const productData = await product.find();
    res.render("admin/product", { productData });
  },

  addProduct: (req, res) => {
    try {
      category.find().then((categories) => {
        res.render("admin/addproduct", { categories });
      });
    } catch {
      console.err();
    }
  },

  postProduct: async (req, res) => {
    try {
      const image = req.files.image;
      const newproduct = new product({
        name: req.body.name,
        brand: req.body.brand,
        description: req.body.description,
        stock: req.body.stock,
        category: req.body.category,
        price: req.body.price,
        size: req.body.size,
      });
      const productData = await newproduct.save();
      if (productData) {
        let imagename = productData.name;
        image.mv("./public/admin/products/" + imagename + ".jpg", (err) => {
          if (!err) {
            res.redirect("/admin/product");
          } else {
            console.log(err);
          }
        });
      } else {
        console.error();
      }
    } catch {
      console.error();
    }
  },

  editProduct: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const categoriesData = await category.find();
      const productData = await product.findOne({ _id: id });
      console.log(productData);
      if (productData) {
        
        res.render("admin/editProduct", { productData, categoriesData });
      } else {
       
        res.redirect("/admin");
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  deleteProduct: (req, res) => {
    try {
      const id = req.params.id;
      const objId = mongoose.Types.ObjectId(id);
      console.log(objId);
      product.updateOne({ _id: id }, { $set: { isDeleted: true } }).then(() => {
        cart
          .updateMany(
            { "cart.productId": objId },
            { $pull: { cart: { productId: objId } } },
            { multi: true }
          )
          .then((data) => {
            console.log(data);
            res.redirect("/admin/product");
          });
      });
    } catch {
      console.error();
    }
  },

  postupdateProduct: async (req, res) => {
    try {
      const id = req.params.id;
      await product
        .updateOne(
          { _id: id },
          {
            $set: {
              name: req.body.name,
              brand: req.body.brand,
              description: req.body.description,
              stock:req.body.stock,
              category: req.body.category,
              price: req.body.price,
              size: req.body.size,
            },
          }
        )
        .then((data) => {
          console.log(data);
        });

        if (req && req.files && req.files.image) {
        const image = req.files.image;
        image.mv("./public/admin/products/" + id + ".jpg");
        
        res.redirect("/admin/product");
      } else {
        
        res.redirect("/admin/product");
      }
    } catch (error) {
      console.log(error.message);
    }
  },

  getCoupon: async (req, res) => {
    const coupons = await coupon.find();
    res.render("admin/coupon", { coupons });
  },

  getAddCoupon: (req, res) => {
    res.render("admin/addcoupon");
  },

  postCoupon: (req, res) => {
    try {
      const data = req.body;
      const dis = data.discount;
      const max = data.max;
      const discount = dis / 100;
    

      coupon
        .create({
          couponName: data.coupon,
          discount: discount,
          maxLimit: max,
          startDate: data.startDate,
          expiryDate:data.expiryDate,

        })
        .then(() => {
          res.redirect("/admin/coupon");
        });
    } catch {
      console.error();
      res.render("user/error");
    }
  },

  getorderDetails: async (req, res) => {
    let page = req.query.page || 1;
    let limit = 5;
    let skip = (page - 1) * limit;
    try {
      order
        .aggregate([
          {
            $lookup: {
              from: "products",
              localField: "orderItems.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .then((data) => {
          order.countDocuments().then((totalOrders)=>{
          res.render("admin/orderdetails", { data, page, totalOrders, limit });
          });
        });
    } catch {
      console.error();
    }
  },

  postchangeStatus: (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;

      order
        .updateOne(
          { _id: id, orderStatus: { $ne: "Cancelled" } },
          {
            $set: {
              orderStatus: data.orderStatus,
              paymentStatus: data.paymentStatus,
            },
          }
        )
        .then(() => {
          res.redirect("/admin/orderDetails");
        });
    } catch {
      console.error();
    }
  },

  getDownload: async (req, res) => {
  
    
    const data = await order.find();

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
  
    worksheet.columns = [
      { header: "Orderdate", key: "Orderdate", width: 30 },
      { header: "Name", key: "Name", width: 15 },
      { header: "PaymentMethod", key: "PaymentMethod", width: 15 },
      { header: "PaymentStatus", key: "PaymentStatus", width: 15 },
      { header: "OrderStatus", key: "OrderStatus", width: 15 },
      { header: "Amount", key: "Amount", width: 15 },
    ]
    
    data.forEach((orderData)=>{
      worksheet.addRow({
        Orderdate : orderData.orderDate,
        Name : orderData.name,
        PaymentMethod : orderData.paymentMethod,
        PaymentStatus : orderData.paymentStatus,
        OrderStatus : orderData.orderStatus,
        Amount : orderData.totalAmount,
      })
     })
     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
     res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
     workbook.xlsx.write(res)  .then(() => {
      res.json({ status: true });
    });
        
  },

  getLogout: (req, res) => {
    req.session.destroy();
    res.render("admin/login");
  },
};
