const User = require("../../model/user/signUpModel");
const bcrypt = require("bcrypt");
const moment = require("moment");
const category = require("../../model/admin/category");
const product = require("../../model/admin/products");
const mongoose = require("mongoose");
const cart = require("../../model/user/cart");
const orderdetails = require("../../model/user/orderdetails");
const wishlist = require("../../model/user/wishlist");
const instance = require("../../middleware/razorpay");
const crypto = require("crypto");
const coupon = require("../../model/admin/coupon");
const mailer = require("../../middleware/otp");
const Session = require("../../model/user/session");
// const session = require("express-session");
// const slider = require('../../model/admin/slider')

let message;
let count;
let user;

module.exports = {
  getPage: async (req, res) => {
    try {
      const allCategory = await category.find();
      const allProduct = await product.find();
      await Session.find({ data: req.session.user }).then((data) => {
        if (!data.length == 0) {
          res.redirect("/home");
        } else {
          res.render("user/landingpage", { allProduct, allCategory });
        }
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getHome: async (req, res) => {
    try {
      user = req.session.user;
      const allCategory = await category.find();
      const userData = await User.findOne({ email: user });
      const allProduct = await product.find();
      if (user) {
        const productCount = await cart.find({ userId: userData._id });
        if (productCount.length) {
          count = productCount[0].cart.length;
        } else {
          count = 0;
        }
        res.render("user/homepage", { allCategory, allProduct, count });
      } else {
        res.render("user/landingpage", { allCategory, allProduct, count });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getLogin: async (req, res) => {
    try {
      await Session.find({ data: req.session.user }).then((data) => {
        if (!data.length == 0) {
          res.redirect("/home");
        } else {
          res.render("user/login");
        }
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postLogin: async (req, res) => {
    try {
      const email = req.body.email;
      const userDetails = await User.findOne({ email: email });
      if (userDetails) {
        const blocked = userDetails.isBlocked;
        if (blocked === false) {
          if (userDetails) {
            const value = await bcrypt.compare(
              req.body.password,
              userDetails.password
            );

            if (value == true) {
              req.session.user = req.body.email;
              if (req.session.user) {
                const session = new Session({
                  userId: userDetails._id,
                  data: req.session.user,
                });

                session.save().then(() => {
                  res.redirect("/home");
                });
              } else {
                res.render("user/login");
              }
            } else {
              res.render("user/login", {
                message,
                err_message: "Password Incorrect",
              });
            }
          } else {
            res.render("user/login", {
              message,
              err_message: "email not registered",
            });
          }
        } else {
          res.render("user/login", { message, err_message: "Blocked" });
        }
      } else {
        res.render("user/login", {
          message,
          err_message: "email or password incorrect",
        });
      }
    } catch {
      console.error();
      res.render("user/404");
    }
  },

  getShop: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const perpage = 9;
      let docCount;
      user = req.session.user;
      const allCategory = await category.find();
      const userData = await User.findOne({ email: user });
      const allProducts = await product.find();

      const brand = await product.aggregate([{ $group: { _id: "$brand" } }]);

      if (user) {
        const productCount = await cart.find({ userId: userData._id });
        if (productCount.length) {
          count = productCount[0].cart.length;
        } else {
          count = 0;
        }

        await product
          .find()
          .countDocuments()
          .then((docs) => {
            docCount = docs;

            return product
              .find()
              .skip((pageNum - 1) * perpage)
              .limit(perpage);
          })
          .then((allProduct) => {
            res.render("user/user_shop", {
              allCategory,
              allProduct,
              count,
              brand,
              docCount,
              pageNum,
              pages: Math.ceil(docCount / perpage),
            });
          });
      } else {
        res.render("user/guest_shop", { allCategory, allProducts, brand });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getCategory: async (req, res) => {
    try {
      const id = req.params.categories;
      const allCategory = await category.find();

      const allProduct = await product.find({ category: id });
      res.render("user/homepage", { allProduct, allCategory, count });
    } catch (error) {
      res.render("user/404");
    }
  },

  getShopCategory: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const perpage = 9;
      let docCount;
      const id = req.params.categories;
      const allCategory = await category.find();
      const brand = await product.aggregate([{ $group: { _id: "$brand" } }]);

      await product
        .find({ category: id })
        .countDocuments()
        .then((docs) => {
          docCount = docs;

          return product
            .find({ category: id })
            .skip((pageNum - 1) * perpage)
            .limit(perpage);
        })
        .then((allProduct) => {
          res.render("user/user_shop", {
            allProduct,
            allCategory,
            count,
            brand,
            docCount,
            pageNum,
            pages: Math.ceil(docCount / perpage),
          });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  getShopBrand: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const perpage = 9;
      let docCount;
      const id = req.params.brand;

      const allCategory = await category.find();
      const brand = await product.aggregate([{ $group: { _id: "$brand" } }]);

      await product
        .find({ brand: id })
        .countDocuments()
        .then((docs) => {
          docCount = docs;

          return product
            .find({ brand: id })
            .skip((pageNum - 1) * perpage)
            .limit(perpage);
        })
        .then((allProduct) => {
          res.render("user/user_shop", {
            allProduct,
            allCategory,
            count,
            brand,
            docCount,
            pageNum,
            pages: Math.ceil(docCount / perpage),
          });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  getShopPrice: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const perpage = 9;
      let docCount;

      const priceRange = req.query.option;

      const [minPrice, maxPrice] = priceRange.split("-").map(Number);

      const allCategory = await category.find();
      const brand = await product.aggregate([{ $group: { _id: "$brand" } }]);

      await product
        .find({
          price: {
            $gte: minPrice,
            $lte: maxPrice,
          },
        })
        .sort({ price: 1 })
        .countDocuments()
        .then((docs) => {
          docCount = docs;

          return product
            .find({
              price: {
                $gte: minPrice,
                $lte: maxPrice,
              },
            })
            .sort({ price: 1 })
            .skip((pageNum - 1) * perpage)
            .limit(perpage);
        })
        .then((allProduct) => {
          res.render("user/user_shop", {
            allProduct,
            allCategory,
            count,
            brand,
            docCount,
            pageNum,
            pages: Math.ceil(docCount / perpage),
          });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  Search: async (req, res) => {
    try {
      const pageNum = req.query.page;
      const perpage = 8;
      let docCount;
      let user = req.session.user;
      let key = req.body.search;
      const allCategory = await category.find();
      const brand = await product.aggregate([{ $group: { _id: "$brand" } }]);
      if (user) {
        await product
          .find({
            $or: [
              { name: new RegExp(key, "i") },
              { category: new RegExp(key, "i") },
            ],
          })
          .countDocuments()
          .then((docs) => {
            docCount = docs;

            return product
              .find({
                $or: [
                  { name: new RegExp(key, "i") },
                  { category: new RegExp(key, "i") },
                ],
              })
              .skip((pageNum - 1) * perpage)
              .limit(perpage);
          })
          .then((allProduct) => {
            if (allProduct.length) {
              res.render("user/user_shop", {
                user,
                allProduct,
                brand,
                allCategory,
                count,
                pageNum,
                docCount,
                pages: Math.ceil(docCount / perpage),
              });
            } else {
              res.render("user/user_shop", {
                user,
                allProduct,
                brand,
                allCategory,
                count,
                pageNum,
                docCount,
                pages: Math.ceil(docCount / perpage),
                err_msg: "Ooops ...! No Match",
              });
            }
          });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  addCart: async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user;
    const data = await product.findOne({ _id:id })
    const userData = await User.findOne({ email: userId });
    const objId = mongoose.Types.ObjectId(id);
    let proObj = {
      productId: objId,
      quantity: 1,
    };
    if (data.stock >= 1) {
    const userCart = await cart.findOne({ userId: userData._id });
    if (userCart) {
      let proExist = userCart.cart.findIndex((cart) => cart.productId == id);
      if (proExist != -1) {
        res.json({ productExist: true });
      } else {
        cart
          .updateOne({ userId: userData._id }, { $push: { cart: proObj } })
          .then(() => {
            res.json({ status: true });
          });
      }
    } else {
      const newCart = new cart({
        userId: userData._id,
        cart: [
          {
            productId: objId,
            quantity: 1,
          },
        ],
      });
      newCart.save().then(() => {
        res.json({ status: true });
      })
    }
  }else{
    res.json({stock : true})
  }
  } catch (error) {
    res.render('user/404')
  } 
  },

  getCart: async (req, res) => {
    try {
      const userId = req.session.user;
      const allCategory = await category.find();
      const userData = await User.findOne({ email: userId });
      const allProduct = await cart.aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$cart",
        },
        {
          $project: {
            productItem: "$cart.productId",
            productQuantity: "$cart.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
            },
          },
        },
      ]);
      const sum = allProduct.reduce((accumulator, object) => {
        return accumulator + object.productPrice;
      }, 0);
      count = allProduct.length;
      res.render("user/cart", {
        allProduct,
        count,
        sum,
        allCategory,
        userData,
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postchangeQuantity: async (req, res) => {
    try {
      const data = req.body;
      

      console.log(data);
      
      const objId = mongoose.Types.ObjectId(data.product);
      const productDetail = await product.findOne({ _id : objId })
    console.log(productDetail.stock);
      if (data.count == 1 && data.quantity == productDetail.stock){
        res.json({stock: true})
      }else{
      await cart
        .aggregate([
          {
            $unwind: "$cart",
          },
        ])
        .then(() => {});
      await cart
        .updateOne(
          { _id: data.cart, "cart.productId": objId },
          { $inc: { "cart.$.quantity": data.count } }
        )
        .then(() => {
          res.json({ status: true });
        });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  postremoveProduct: async (req, res) => {
    try {
      const data = req.body;
      const objId = mongoose.Types.ObjectId(data.product);
      await cart.aggregate([
        {
          $unwind: "$cart",
        },
      ]);
      await cart
        .updateOne(
          { _id: data.cart, "cart.productId": objId },
          { $pull: { cart: { productId: objId } } }
        )
        .then(() => {
          res.json({ status: true });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  postremovewishlistProduct: async (req, res) => {
    try {
      const data = req.body;
      const objId = mongoose.Types.ObjectId(data.product);
      await wishlist.aggregate([
        {
          $unwind: "$product",
        },
      ]);
      await wishlist
        .updateOne(
          { _id: data.wishlist, "product.productId": objId },
          { $pull: { product: { productId: objId } } }
        )
        .then(() => {
          res.json({ status: true });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  checkCoupon: async (req, res) => {
    try {
      const data = req.body;
      const total = data.total;
      var number = parseInt(total);
      const session = req.session.user;
      const userData = await User.findOne({ email: session });
      const objId = mongoose.Types.ObjectId(userData._id);
      var date = new Date();
      var isoString = date.toISOString();
      var dateString = isoString.slice(0, 10);

      const expired = await coupon.find({
        $and: [
          { couponName: data.coupon },
          { expiryDate: { $lt: dateString } },
        ],
      });

      if (data.coupon) {
        coupon
          .find(
            { couponName: data.coupon },
            { users: { $elemMatch: { userId: objId } } }
          )
          .then((exist) => {
            if (!exist.length && !expired.length) {
              res.json({ invalid: true });
            } else if (exist[0].users.length) {
              res.json({ user: true });
            } else {
              coupon.find({ couponName: data.coupon }).then((discount) => {
                let dis = number * discount[0].discount;
                if (total < 100) {
                  res.json({ purchase: true });
                } else if (dis > 100 && !expired.length) {
                  let discountAmount = 100;
                  res.json({
                    coupon: true,
                    discountAmount,
                    number,
                    couponName: discount[0].couponName,
                  });
                } else if (total > 100 && dis < 100 && !expired.length) {
                  let discountAmount = dis;
                  res.json({
                    coupons: true,
                    discountAmount,
                    number,
                    couponName: discount[0].couponName,
                  });
                } else {
                  res.json({ expiry: true });
                }
              });
            }
          });
      } else {
        res.json({ exist: true });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getProduct: async (req, res) => {
    try {
      const id = req.params.id;
      const allCategory = await category.find();
      product.findOne({ _id: id }).then((data) => {
        res.render("user/productview", { data, count, allCategory });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getWishlist: async (req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findOne({ email: userId });
      const allCategory = await category.find();

      const allProduct = await cart.aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$cart",
        },
        {
          $project: {
            productItem: "$cart.productId",
            productQuantity: "$cart.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
            },
          },
        },
      ]);
      count = allProduct.length;
      const wishlistData = await wishlist.aggregate([
        {
          $match: { userId: userData._id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
      ]);
      res.render("user/wishlist", { count, wishlistData, allCategory });
    } catch (error) {
      res.render("user/404");
    }
  },

  addWishlist: async (req, res) => {
    try {
      const id = req.params.id;
      user = req.session.user;
      const objId = mongoose.Types.ObjectId(id);
      let proObj = {
        productId: objId,
      };
      const userData = await User.findOne({ email: user });
      const userId = mongoose.Types.ObjectId(userData._id);
      const userWishlist = await wishlist.findOne({ userId: userId });
      const productexistcart = await cart.findOne(
        { userId: userId },
        { cart: { $elemMatch: { productId: objId } } }
      );
      if (productexistcart && productexistcart.product && productexistcart.product.length) {
        res.json({ cart: true });
      } else {
        if (userWishlist) {
          let proExist = userWishlist.product.findIndex(
            (product) => product.productId == id
          );
          if (proExist != -1) {
            res.json({ productExist: true });
          } else {
            wishlist
              .updateOne({ userId: userId }, { $push: { product: proObj } })
              .then(() => {
                res.json({ status: true });
              });
          }
        } else {
          wishlist
            .create({
              userId: userId,
              product: [
                {
                  productId: objId,
                },
              ],
            })
            .then(() => {
              res.json({ status: true });
            });
        }
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getCheckout: async (req, res) => {
    try {
      const userId = req.session.user;
      const pro = await product.find();
      const allCategory = await category.find();
      const useraddressData = await User.aggregate([
        {
          $match: { email: userId },
        },
        {
          $unwind: "$addressDetails",
        },
        {
          $project: {
            housename: "$addressDetails.housename",
            street: "$addressDetails.street",
            city: "$addressDetails.city",
            state: "$addressDetails.state",
            pincode: "$addressDetails.pincode",
          },
        },
      ]);

      const userData = await User.findOne({ email: userId });

      const allProduct = await cart.aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$cart",
        },
        {
          $project: {
            productItem: "$cart.productId",
            productQuantity: "$cart.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
            },
          },
        },
      ]);
      const sum = allProduct.reduce((accumulator, object) => {
        return accumulator + object.productPrice;
      }, 0);
      count = allProduct.length;
      res.render("user/tesxt", {
        allProduct,
        count,
        sum,
        allCategory,
        pro,
        userData,
        useraddressData,
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  addNewAddress: async (req, res) => {
    try {
      const session = req.session.user;
      const addObj = {
        housename: req.body.housename,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
      };

      await User.updateOne(
        { email: session },
        { $push: { addressDetails: addObj } }
      );
      res.redirect("/checkout");
    } catch (error) {
      res.render("user/400");
    }
  },

  postplaceOrder: async (req, res) => {
    try {
      const data = req.body;
      const userId = req.session.user;
      const userData = await User.findOne({ email: userId });
      const cartData = await cart.findOne({ userId: userData._id });
      // const status = req.body.paymentMethod === "COD" ? "placed" : "pending";
      if (cartData) {
        const productData = await cart
          .aggregate([
            {
              $match: { userId: userData.id },
            },
            {
              $unwind: "$cart",
            },
            {
              $project: {
                productItem: "$cart.productId",
                productQuantity: "$cart.quantity",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "productItem",
                foreignField: "_id",
                as: "productDetail",
              },
            },
            {
              $project: {
                productItem: 1,
                productQuantity: 1,
                productDetail: { $arrayElemAt: ["$productDetail", 0] },
              },
            },
            {
              $addFields: {
                productPrice: {
                  $multiply: ["$productQuantity", "$productDetail.price"],
                },
              },
            },
          ])
          .exec();
        let sum;
        if (data.total) {
          sum = parseInt(data.total);
        } else {
          sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
          }, 0);
        }
        count = productData.length;

        const orderData = await orderdetails.create({
          userId: userData._id,
          name: userData.name,
          number: userData.number,
          address: req.body.address,
          orderItems: cartData.cart,
          totalAmount: sum,
          paymentMethod: data.paymentMethod,
          orderStatus: "pending",
          orderDate: moment().format("MMM Do YY"),
          deliveryDate: moment().add(3, "days").format("MMM Do YY"),
        });

        const amount = orderData.totalAmount * 100;
        const _id = orderData._id;
        await cart.deleteOne({ userId: userData._id });

        if (data.paymentMethod === "COD") {
          await coupon.updateOne(
            { couponName: data.couponName },
            { $push: { users: { userId: userData._id } } }
          );
          console.log("Cod payment");
          res.json({ success: true });
        } else if (data.paymentMethod === "Online") {
          let options = {
            amount: amount,
            currency: "INR",
            receipt: "" + _id,
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
              console.log(err);
              console.log("online payment error");
            } else {
              res.json(order);
              console.log("online payment");
               coupon.updateOne(
                { couponName: data.couponName },
                { $push: { users: { userId: userData._id } } }
              ).then((updated)=>{
                console.log(updated);
              })
            }
          });
        }
        for (let i = 0; i < productData.length; i++) {
          const updatedStock =
          productData[i].productDetail.stock -
          productData[i].productQuantity;
          product
            .updateOne(
              {
                _id: productData[i].productDetail._id,
              },
              {
                stock: updatedStock,
              }
            )
            .then((data) => {
              console.log(data);
            });
        }
      }
    
    } catch (error) {
      res.render("user/404");
    }
  },

  postverifyPayment: async (req, res) => {
    try {
      const details = req.body;
      console.log(details);
      let hmac = crypto.createHmac("sha256", process.env.KEYSECRET);
      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id
      );
      hmac = hmac.digest("hex");
      if (hmac == details.payment.razorpay_signature) {
        const objId = mongoose.Types.ObjectId(details.order.receipt);
        orderdetails
          .updateOne({ _id: objId }, { $set: { paymentStatus: "paid" } })
          .then(() => {
            res.json({ success: true });
          })
          .catch((err) => {
            console.log(err);
            res.json({ status: false, err_message: "payment failed" });
          });
      } else {
        res.json({ status: false, err_message: "payment failed" });
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  orderSuccess: async (req, res) => {
    try {
      user = req.session.user;
      const allCategory = await category.find();
      const userData = await User.findOne({ email: user });
      const order = await orderdetails
        .find({ userId: userData._id })
        .sort({ _id: -1 })
        .limit(1);
      if (user) {
        res.render("user/ordersucces", { allCategory, order });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getOrderstatus: async (req, res) => {
    try {
      const message = req.query.message;
      console.log(message);
      user = req.session.user;
      const allCategory = await category.find();
      const userData = await User.findOne({ email: user });
      const order = await orderdetails
        .find({ userId: userData._id })
        .sort({ createdAt: -1 });

      res.render("user/orderhistory", { allCategory, order, message });
    } catch (error) {
      res.render("user/404");
    }
  },

  viewOrderProducts: async (req, res) => {
    try {
      const id = req.params.id;
      const allCategory = await category.find();
      const objId = mongoose.Types.ObjectId(id);
      orderdetails
        .aggregate([
          {
            $match: { _id: objId },
          },
          {
            $unwind: "$orderItems",
          },
          {
            $project: {
              address: "$address",
              totalAmount: "$totalAmount",
              number: "$number",
              productItem: "$orderItems.productId",
              productQuantity: "$orderItems.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productItem",
              foreignField: "_id",
              as: "productDetail",
            },
          },
          {
            $project: {
              address: 1,
              totalAmount: 1,
              number: 1,
              productItem: 1,
              productQuantity: 1,
              productDetail: { $arrayElemAt: ["$productDetail", 0] },
            },
          },
        ])
        .then((productData) => {
          res.render("user/vieworder", { count, productData, allCategory });
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = req.session.user;
      const userdata = await User.findOne({ email: user });
      const allCategory = await category.find();
      res.render("user/userprofile", { allCategory, userdata });
    } catch (error) {
      res.render("user/404");
    }
  },

  postAddress: async (req, res) => {
    try {
      const data = req.body;
      const addressObj = {
        name: data.name,
        number: data.number,
        housename: data.housename,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      };
      await User.updateOne(
        { $or: [{ name: data.name }, { number: data.number }] },
        { $set: { primaryaddress: addressObj } }
      ).then(() => {
        res.redirect("/getprofile");
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getEditAccount: async (req, res) => {
    try {
      const user = req.session.user;
      const userdata = await User.findOne({ email: user });
      const allCategory = await category.find();
      res.render("user/editaccount", { allCategory, userdata });
    } catch (error) {
      res.render("user/404");
    }
  },

  // postEditAccount: async (req,res)=>{
  //   const session = req.session.user;
  //   const data = req.body;
  //   await User.updateOne(
  //     { email: session },
  //     {
  //       $set: {
  //         name: data.name,
  //         email: data.email,
  //         number: data.number,
  //         primaryaddress: {
  //           addressname: data.addressname,
  //           addressnumber: data.addressnumber,
  //           housename: data.housename,
  //           street: data.street,
  //           city: data.city,
  //           state: data.state,
  //           pincode: data.pincode,
  //         },
  //       },
  //     }
  //   );
  //   res.redirect("/getprofile");
  // },

  getsavedaddress: async (req, res) => {
    try {
      const user = req.session.user;
      const userdata = await User.findOne({ email: user });
      const allCategory = await category.find();
      res.render("user/savedaddress", { allCategory, userdata });
    } catch (error) {
      res.render("user/404");
    }
  },

  postEditAddress: async (req, res) => {
    try {
      const session = req.session.user;
      const userId = await User.findOne({ email: session });
      const AddressId = req.params.id;
      const housename = req.body.housename;
      const street = req.body.street;
      const city = req.body.city;
      const state = req.body.state;
      const pincode = req.body.pincode;

      const updatedAddress = {
        housename: housename,
        street: street,
        city: city,
        state: state,
        pincode: pincode,
      };

      await User.findOneAndUpdate(
        { _id: userId, "addressDetails._id": AddressId },
        { $set: { "addressDetails.$": updatedAddress } }
      );
      res.redirect("/savedaddress");
    } catch (error) {
      res.render("user/404");
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const session = req.session.user;
      const userId = await User.findOne({ email: session });
      const addressId = req.params.id;

      await User.updateOne(
        {
          _id: userId,
        },
        {
          $pull: { addressDetails: { _id: addressId } },
        }
      );
      res.redirect("/savedaddress");
    } catch (error) {
      res.render("user/404");
    }
  },

  editAccount: async (req, res) => {
    try {
      const session = req.session.user;
      const userdata = await User.findOne({ email: session });
      res.render("user/editaccount", { userdata });
    } catch (error) {
      res.render("user/404");
    }
  },

  postEditAccount: async (req, res) => {
    try {
      const session = req.session.user;
      const data = req.body;

      await User.updateOne(
        {
          email: session,
        },
        {
          $set: {
            name: data.name,
            number: data.number,
          },
        }
      );
      res.redirect("/getprofile");
    } catch (error) {
      res.render("user/404");
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const data = req.params.id;
      const objId = mongoose.Types.ObjectId(data);
      const orderData = await orderdetails.aggregate([
        {
          $match: { _id: objId },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $project: {
            quantity: "$orderItems.quantity",
            products: { $arrayElemAt: ["$products", 0] },
          },
        },
      ]);
      
      for (let i = 0; i < orderData.length; i++) {
        const updatedStock =
          orderData[i].products.stock + orderData[i].quantity;
        product
          .updateOne(
            {
              _id: orderData[i].products._id,
            },
            {
              stock: updatedStock,
            }
          )
          .then((data) => {
            console.log(data);
          });
      }

      orderdetails
        .updateOne(
          { _id: data, orderStatus: { $ne: "delivered" } },
          { $set: { orderStatus: "Cancelled" } }
        )
        .then(() => {
            res.redirect("/orderdetails");
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  changePassword: (req, res) => {
    if (req.session.user) {
      try {
        res.render("user/changePassword", { message: "" });
      } catch (error) {
        res.redner("user/404");
      }
    } else {
      res.redirect("/userlogin");
    }
  },

  postChangePassword: (req, res) => {
    try {
      const session = req.session.user;
      const { currentPassword, password } = req.body;
      User.findOne({ email: session })
        .then((result) => {
          if (result.password === currentPassword) {
            if (password === currentPassword) {
              res.render("user/ChangePassword", {
                message: "Old password and New password is same",
              });
            } else {
              User.findOneAndUpdate({ email: session }, { password: password })
                .then(() => {
                  res.redirect("/getprofile");
                })
                .catch(() => {
                  console.log("error in Change Password");
                });
            }
          } else {
            res.render("user/changePassword", {
              message: "You have entered wrong password",
            });
          }
        })
        .catch(() => {
          console.log("Something wrong");
        });
    } catch (error) {
      res.render("user/404");
    }
  },

  forgotPassword: (req, res) => {
    try {
      user = req.session.user;
      if (user) {
        res.redirect("/login");
      } else {
        res.render("user/forgotpassword");
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  postforgotPassword: async (req, res) => {
    try {
      let Data = req.body;

      let userData = await User.findOne({ email: Data.details });
      let mailDetails = {
        from: "thalhaz999@gmail.com",
        to: userData.email,
        subject: "KICKS ACCOUNT VERIFICATION",
        html: `<p>YOUR OTP FOR RESET PASSWORD IS <h1> ${mailer.OTP} <h1> </p>`,
      };
      mailer.mailTransporter.sendMail(mailDetails, (err, data) => {
        if (err) {
          console.log("error occurs");
        } else {
          console.log(data);
          res.render("user/resetpassotp", { Data });
        }
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postotpsignup: async (req, res) => {
    let data = req.body.details;

    try {
      let otp = req.body.otp;
      if (mailer.OTP == otp) {
        console.log("matchedd");
        res.render("user/resetpassword", { data });
      } else {
        console.log("error");
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  postNewPassword: async (req, res) => {
    try {
      const data = req.body;
      if (data.password && data.confirmpassword) {
        if (data.password === data.confirmpassword) {
          let newPassword = await bcrypt.hash(data.password, 10);

          User.updateOne(
            { email: data.details },
            {
              $set: {
                password: newPassword,
              },
            }
          ).then((data) => {
            console.log(data);
            res.redirect("/login");
          });
        }
      }
    } catch (error) {
      res.render("user/404");
    }
  },

  getLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/");
  },
};
