const User = require("../../model/user/signUpModel")
const bcrypt = require("bcrypt");
const category = require("../../model/admin/category");
const product = require("../../model/admin/products")
let message;

module.exports={

    getPage: async (req,res)=>{
        const allCategory = await category.find()
        const allProduct = await product.find()
        let user = req.session.user
        if(user){
            res.render('user/homepage',{ allCategory, allProduct })
        }else{
            res.render('user/landingpage',{ allCategory, allProduct })
        }
    },

    getHome: async (req,res)=>{
        const allCategory = await category.find()
        const allProduct = await product.find()
        let user = req.session.user
        if(user){
            res.render('user/homepage',{ allCategory, allProduct })
        }else{
            res.render('user/landingpage',{ allCategory, allProduct })
        }
    },

    getLogin:(req,res)=>{
        let user = req.session.user
        if(user){
            res.redirect('/home')
        }else{
            res.render('user/login')
        }
    },

    postLogin: async (req,res)=>{
        try{
        const email = req.body.email;
        const userDetails = await User.findOne({ email:email });
        if(userDetails){
            const blocked = userDetails.isBlocked;
            if(blocked === false){
                if(userDetails){
                    const value = await bcrypt.compare(req.body.password,userDetails.password);
                    if(value){
                        req.session.user = req.body.email
                        res.redirect("/home")
                    }else{
                        console.log("this")
                        res.render('user/login')
                    }
                }else{
                    res.render("user/login", {message, err_message: "email not registered",});
                }
            }else{
                res.render('user/login', {message, err_message: "Blocked"});
            }
        }else{
            res.render("user/login",{ message, err_message: "email or password incorrect"});
        }
    } catch {
        console.error();
    }
               
    },

    getLogout:(req,res)=>{
        req.session.destroy();
        res.redirect('/')
    }

}