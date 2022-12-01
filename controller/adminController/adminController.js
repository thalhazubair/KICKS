const User = require("../../model/user/signUpModel")
const category = require("../../model/admin/category")
const product = require("../../model/admin/products")
// const path = require("path")
const admin = {email: 'admin@gmail.com', password: '1100'}

module.exports={

    getLogin:(req,res)=>{
        if(req.session.admin){
            res.redirect('/admin/login')
        }else{
            res.render('admin/login')
        }

    },

    getTable:async(req,res)=>{
        if(req.session.admin){
            const usersData =  await User.find({is_admin:0})
            res.render('admin/table',{users:usersData})
        }else{
            res.redirect('/admin/login')
        }
    },

    postHome:(req,res)=>{
        if(req.body.email === admin.email && req.body.password == admin.password){
            req.session.admin = req.body.email
            res.redirect('/admin/login')
        }else{
            res.render('admin/login',{err_message:"invalid Email or Password"})
        }
    },

    getHome:(req,res)=>{
        if(req.session.admin){
        // const usersData =  await User.find({is_admin:0})
            res.render('admin/home')
        }else{
            res.redirect('/admin')
        }

    },

    blockuser:(req,res)=>{
        try {
            const id = req.params.id
            User.updateOne({_id: id}, { $set: { isBlocked: true } }).then(()=>{
            res.redirect('/admin/table')
            });
        }catch{
            console.error();
        }
    },

    unblockuser:(req,res)=>{
        try {
            const id = req.params.id
            User.updateOne({_id: id}, { $set: { isBlocked: false } }).then(()=>{
            res.redirect('/admin/table')
            });
        }catch{
            console.error();
        }
    },

    getCategory: async(req,res)=>{
        try{
            if(req.session.admin){
                const categories = await category.find();
            if(categories){
                res.render('admin/category',{categories});
            } else{
                res.send('No categories found');
            }
            } else {
                res.redirect('/admin/login')
            }
            
            }catch{
            console.error();
        }
    },


    addCategory:(req,res)=>{
        if(req.session.admin){
            res.render('admin/addcategory')
        }else{
            res.render('admin/login')
        }
    },

    postCategory:async(req,res)=>{
        try{
            let categories = req.body.categories

            const newcategory = new category({
                categories:categories,
            })
            const data = await newcategory.save()
            if(data){
                res.redirect("/admin/category");
            }
        }catch(error){
            res.redirect("admin/addcategory");
        }
        
    },

    editCategory:async(req,res)=>{
        if(req.session.admin){
            const id = req.params.id
             const data = await category.find({_id:id})
            res.render('admin/editcategory',{data})
        }else{
            res.redirect('/admin/login')
        }
    },

    updateCategory: async(req,res)=>{
        try{
        const id = req.params.id
        console.log(id);
        await category.updateOne({_id:id},{$set:{categories:req.body.categories}})
        console.log("ith")
        res.redirect('/admin/category')
        }catch{
            console.error();
        }
        
    },

    getProduct:async(req,res)=>{
        if(req.session.admin){
            const productData = await product.find()
            res.render('admin/product',{productData})
        }else{
            res.redirect('/admin/login')
        }
    },

    addProduct:(req,res)=>{
        if(req.session.admin){
            try{
                category.find().then((categories)=>{
                    res.render('admin/addproduct',{categories});
                })
            
        }catch{
            console.err();
        }
    }
},

    postProduct:async (req,res)=>{
            try{
                const image = req.files.image;
                const newproduct = new product({
                    name:req.body.name,
                    description:req.body.description,
                    category:req.body.category,
                    price:req.body.price,
                    size:req.body.size,
                })
                const productData = await newproduct.save()
                if(productData){
                    let imagename = productData.name;
                    console.log(imagename),
                    image.mv("./public/admin/products/" + imagename + ".jpg",
                      (err) => {
                        if (!err) {
                          res.redirect("/admin/product");
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    console.error();
                  }
                }catch{
                  console.error();
                }
    },

    editProduct:async(req,res)=>{
        try {
           const id = req.query.name
           const categoriesData = await category.find();
           const productData = await product.findOne({name: id})
           if(productData){
            res.render('admin/editProduct',{productData,categoriesData})
           }
           else{
            console.log("ith")
            res.redirect('/admin')
           }

        } catch (error) {
            console.log(error.message);
        }
    },

    updateProduct:async(req,res)=>{
        try {
            const id = req.params.name
            console.log(id)
           await product.updateOne({name: id},{$set:{name:req.body.name, description:req.body.description, category:req.body.category, price:req.body.price, size:req.body.size},}).then((data)=>{
            console.log(data)
           })
          
           if (req?.files?.image) {
            const image = req.files.image;
            image.mv("./public/admin/products/" + id + ".jpg");
           res.redirect('/admin/product');
           }else{
            res.redirect('/admin/product');
           }
        } catch (error) {
            console.log(error.message);
        }
    },

    getLogout:(req,res)=>{
        req.session.destroy();
        res.render('admin/login')
    }
}
