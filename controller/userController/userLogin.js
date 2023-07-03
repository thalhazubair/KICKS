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
      category.find().then((allCategory)=>{
        product.find().then((allProduct)=>{
          Session.find({ data: req.session.user }).then((data) => {
            if (!data.length == 0) {
              res.redirect("/home");
            } else {
              res.render("user/landingpage", { allProduct, allCategory });
            }
          });
        })
      })
     
      
    } catch (error) {
      res.render("user/404");
    }
  },

  getHome: async (req, res) => {
    try {
      user = req.session.user;
      category.find().then((allCategory) => {
        User.findOne({ email: user }).then((userData) => {
          product.find().then((allProduct) => {
            if (user) {
              cart.find({ userId: userData._id }).then((productCount) => {
                if (productCount.length) {
                  count = productCount[0].cart.length;
                } else {
                  count = 0;
                }
                res.render("user/homepage", { allCategory, allProduct, count });
              });
            } else {
              res.render("user/landingpage", {
                allCategory,
                allProduct,
                count,
              });
            }
          });
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getLogin: async (req, res) => {
    try {
      Session.find({ data: req.session.user }).then((data) => {
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
      User.findOne({ email: email }).then((userDetails) => {
        if (userDetails) {
          const blocked = userDetails.isBlocked;
          if (blocked === false) {
            if (userDetails) {
              bcrypt
                .compare(req.body.password, userDetails.password)
                .then((value) => {
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
                });
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
      });
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
      category.find().then((allCategory) => {
        User.findOne({ email: user }).then((userData) => {
          product.find().then((allProducts) => {
            product.aggregate([{ $group: { _id: "$brand" } }]).then((brand) => {
              if (user) {
                cart.find({ userId: userData._id }).then((productCount) => {
                  if (productCount.length) {
                    count = productCount[0].cart.length;
                  } else {
                    count = 0;
                  }

                  product
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
                });
              } else {
                res.render("user/guest_shop", {
                  allCategory,
                  allProducts,
                  count,
                  brand,
                  docCount,
                  pageNum,
                  pages: Math.ceil(docCount / perpage),
                });
              }
            });
          });
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getCategory: async (req, res) => {
    try {
      const id = req.params.categories;
      category.find().then((allCategory) => {
        product.find({ category: id }).then((allProduct) => {
          res.render("user/homepage", { allProduct, allCategory, count });
        });
      });
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
      category.find().then((allCategory) => {
        product.aggregate([{ $group: { _id: "$brand" } }]).then((brand) => {
          product
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

      category.find().then((allCategory)=>{
        product.aggregate([{ $group: { _id: "$brand" } }]).then((brand)=>{

           product
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

        })
      })
      

     
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

    category.find().then((allCategory)=>{
        product.aggregate([{ $group: { _id: "$brand" } }]).then((brand)=>{

        product
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

        })
      })
     

      
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
      category.find().then((allCategory)=>{
        product.aggregate([{ $group: { _id: "$brand" } }]).then((brand)=>{
          if (user) {
            product
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
        })
      })
      
      
    } catch (error) {
      res.render("user/404");
    }
  },

  addCart: async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.session.user;
      product.findOne({ _id: id }).then((data) => {
        User.findOne({ email: userId }).then((userData) => {
          const objId = mongoose.Types.ObjectId(id);
          let proObj = {
            productId: objId,
            quantity: 1,
          };

          if (data.stock >= 1) {
            cart.findOne({ userId: userData._id }).then((userCart) => {
              if (userCart) {
                let proExist = userCart.cart.findIndex(
                  (cart) => cart.productId == id
                );
                if (proExist != -1) {
                  res.json({ productExist: true });
                } else {
                  cart
                    .updateOne(
                      { userId: userData._id },
                      { $push: { cart: proObj } }
                    )
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
                });
              }
            });
          } else {
            res.json({ stock: true });
          }
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getCart: async (req, res) => {
    try {
      const userId = req.session.user;
      category.find().then((allCategory) => {
        User.findOne({ email: userId }).then((userData) => {
          cart
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
                    $sum: {
                      $multiply: ["$productQuantity", "$productDetail.price"],
                    },
                  },
                },
              },
            ])
            .then((allProduct) => {
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
            });
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postchangeQuantity: async (req, res, next) => {
    try {
      const data = req.body;
      data.count = parseInt(data.count);
      data.quantity = parseInt(data.quantity);
     

      const objId = mongoose.Types.ObjectId(data.product);
       product.findOne({ _id: objId }).then((productDetail)=>{

        if (data.count == 1 && data.quantity == productDetail.stock) {
          res.json({ stock: true });
        } else if(data.count == -1 && data.quantity == 1){
          res.json({ quantity: true })
        } else {
           cart
            .aggregate([
              {
                $unwind: "$cart",
              },
            ])
            .then(() => {
               cart
              .updateOne(
                { _id: data.cart, "cart.productId": objId },
                { $inc: { "cart.$.quantity": data.count } }
              )
              .then(() => {
                next();
              });
            });
         
        }

      })
    } catch (error) {
      res.render("user/404");
    }
  },

  totalAmount: async (req, res) => {
    try {
      const userId = req.session.user;
      const userData = await User.findOne({ email: userId });
      const productData = await cart.aggregate([
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
        {
          $group: {
            _id: userId,
            total: {
              $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
            },
          },
        },
      ]);
      res.json({ status: true, productData });
    } catch {
      console.error();
      res.render("user/error500");
    }
  },

  postremoveProduct: async (req, res) => {
    try {
      const data = req.body;
      const objId = mongoose.Types.ObjectId(data.product);
      cart.aggregate([
        {
          $unwind: "$cart",
        },
      ]).then(()=>{
        cart
        .updateOne(
          { _id: data.cart, "cart.productId": objId },
          { $pull: { cart: { productId: objId } } }
        )
        .then(() => {
          res.json({ status: true });
        });
      })
     
    } catch (error) {
      res.render("user/404");
    }
  },

  postremovewishlistProduct: async (req, res) => {
    try {
      const data = req.body;
      const objId = mongoose.Types.ObjectId(data.product);
      wishlist.aggregate([
        {
          $unwind: "$product",
        },
      ]).then(()=>{
        wishlist
        .updateOne(
          { _id: data.wishlist, "product.productId": objId },
          { $pull: { product: { productId: objId } } }
        )
        .then(() => {
         
          res.json({ status: true });
        });
      })
   
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

  guestgetProduct: async (req, res) => {
    try {
      const id = req.params.id;
        category.find().then((allCategory)=>{
        product.findOne({ _id: id }).then((data) => {
          res.render("user/guestproductview", { data, count, allCategory });
        });
      })
    } catch (error) {
      res.render("user/404");
    }
  },

  getProduct: async (req, res) => {
    try {
      const id = req.params.id;
        category.find().then((allCategory)=>{
        product.findOne({ _id: id }).then((data) => {
          res.render("user/productview", { data, count, allCategory });
        });
      })
     
    } catch (error) {
      res.render("user/404");
    }
  },

  getWishlist: async (req, res) => {
    try {
      const userId = req.session.user;
      User.findOne({ email: userId }).then((userData) => {
        category.find().then((allCategory) => {
          cart
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
                    $sum: {
                      $multiply: ["$productQuantity", "$productDetail.price"],
                    },
                  },
                },
              },
            ])
            .then((allProduct) => {
              count = allProduct.length;
              wishlist
                .aggregate([
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
                ])
                .then((wishlistData) => {
                  res.render("user/wishlist", {
                    count,
                    wishlistData,
                    allCategory,
                  });
                });
            });
        });
      });
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
      User.findOne({ email: user }).then((userData)=>{
        const userId = mongoose.Types.ObjectId(userData._id);
        wishlist.findOne({ userId: userId }).then((userWishlist)=>{
          cart.findOne(
            { userId: userId },
            { cart: { $elemMatch: { productId: objId } } } 
          ).then((productexistcart)=>{
            if (
              productexistcart &&
              productexistcart.product &&
              productexistcart.product.length
            ) {
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
          })
        })
      })
      
     
      
     
    } catch (error) {
      res.render("user/404");
    }
  },

  getCheckout: async (req, res) => {
    try {
      const userId = req.session.user;
      User.findOne({ email: userId }).then((userData)=>{
        product.find().then((pro)=>{
          category.find().then((allCategory)=>{
            User.aggregate([
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
            ]).then((useraddressData) => {
              cart
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
                        $sum: {
                          $multiply: ["$productQuantity", "$productDetail.price"],
                        },
                      },
                    },
                  },
                ])
                .then((allProduct) => {
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
                });
            });
          })
        })
      })

      
      

     
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

      User.updateOne(
        { email: session },
        { $push: { addressDetails: addObj } }
      ).then(() => {
        res.redirect("/checkout");
      });
    } catch (error) {
      res.render("user/400");
    }
  },

  postplaceOrder: async (req, res) => {
    try {
      const data = req.body;
      const userId = req.session.user;
      User.findOne({ email: userId }).then((userData) => {
        cart.findOne({ userId: userData._id }).then((cartData) => {
          if (cartData) {
            cart
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
              .exec()
              .then((productData) => {
                let sum;
                if (data.total) {
                  sum = parseInt(data.total);
                } else {
                  sum = productData.reduce((accumulator, object) => {
                    return accumulator + object.productPrice;
                  }, 0);
                }
                count = productData.length;

                orderdetails
                  .create({
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
                  })
                  .then((orderData) => {
                    const amount = orderData.totalAmount * 100;
                    const _id = orderData._id;
                    cart.deleteOne({ userId: userData._id }).then(()=>{

                      if (data.paymentMethod === "COD") {
                        coupon.updateOne(
                          { couponName: data.couponName },
                          { $push: { users: { userId: userData._id } } }
                        );
                        
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
                            
                          } else {
                            res.json(order);
                            
                            coupon
                              .updateOne(
                                { couponName: data.couponName },
                                { $push: { users: { userId: userData._id } } }
                              )
                              .then(() => {
                                
                              });
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
                          .then(() => {
                            
                          });
                      }
                    })

                  });
              });
          }
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postverifyPayment: async (req, res) => {
    try {
      const details = req.body;
      
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
          .catch(() => {
            
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
      category.find().then((allCategory) => {
        User.findOne({ email: user }).then((userData) => {
          orderdetails
            .find({ userId: userData._id })
            .sort({ _id: -1 })
            .limit(1)
            .then((order) => {
              if (user) {
                res.render("user/ordersucces", { allCategory, order });
              } else {
                res.redirect("/login");
              }
            });
        });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  getOrderstatus: async (req, res) => {
    try {
      const message = req.query.message;
      
      user = req.session.user;
      category.find().then((allCategory) => {
        User.findOne({ email: user }).then((userData) => {
          orderdetails
            .find({ userId: userData._id })
            .sort({ createdAt: -1 })
            .then((order) => {
              res.render("user/orderhistory", { allCategory, order, message });
            });
        });
      });
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
      User.findOne({ email: user }).then((userdata)=>{
        category.find().then((allCategory)=>{
          res.render("user/userprofile", { allCategory, userdata });
        })
      })
      
      
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
      User.updateOne(
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
      User.findOne({ email: user }).then((userdata)=>{
        category.find().then((allCategory)=>{
          res.render("user/editaccount", { allCategory, userdata });
        })
      })
      
     
    } catch (error) {
      res.render("user/404");
    }
  },

  getsavedaddress: async (req, res) => {
    try {
      const user = req.session.user;
      User.findOne({ email: user }).then((userdata) => {
        category.find().then((allCategory) => {
          res.render("user/savedaddress", { allCategory, userdata });
        });
      });
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

      User.findOneAndUpdate(
        { _id: userId, "addressDetails._id": AddressId },
        { $set: { "addressDetails.$": updatedAddress } }
      ).then(() => {
        res.redirect("/savedaddress");
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const session = req.session.user;
      const userId = await User.findOne({ email: session });
      const addressId = req.params.id;

      User.updateOne(
        {
          _id: userId,
        },
        {
          $pull: { addressDetails: { _id: addressId } },
        }
      ).then(() => {
        res.redirect("/savedaddress");
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  editAccount: async (req, res) => {
    try {
      const session = req.session.user;
      User.findOne({ email: session }).then((userdata) => {
        res.render("user/editaccount", { userdata });
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  postEditAccount: async (req, res) => {
    try {
      const session = req.session.user;
      const data = req.body;

      User.updateOne(
        {
          email: session,
        },
        {
          $set: {
            name: data.name,
            number: data.number,
          },
        }
      ).then(() => {
        res.redirect("/getprofile");
      });
    } catch (error) {
      res.render("user/404");
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const data = req.params.id;
      const objId = mongoose.Types.ObjectId(data);
      orderdetails
        .aggregate([
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
        ])
        .then((orderData) => {
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
          }
          orderdetails
            .updateOne(
              { _id: data, orderStatus: { $ne: "delivered" } },
              { $set: { orderStatus: "Cancelled" } }
            )
            .then(() => {
              res.redirect("/orderdetails");
            });
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
            }
          } else {
            res.render("user/changePassword", {
              message: "You have entered wrong password",
            });
          }
        })
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
      mailer.mailTransporter.sendMail(mailDetails, (err) => {
        if (err) {
          console.log("error occurs");
        } else {
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
        
        res.render("user/resetpassword", { data });
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
          ).then(() => {
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
