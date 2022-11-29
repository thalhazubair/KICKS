const User = require("../../model/user/signUpModel")
module.exports={

    getPage:(req,res)=>{
        let user = req.session.user
        if(user){
            res.render('user/homepage')
        }else{
            res.render('user/landingpage')
        }
    },

    getHome:(req,res)=>{
        let user = req.session.user
        if(user){

            res.render('user/homepage')
        }else{
            res.render('user/landingpage')
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

    postLogin:(req,res)=>{
        const {email,password} = req.body
        User.findOne({email:email, password:password})
        .then((result)=>{
            if(result){
                req.session.user = req.body.email
                res.redirect('/home')
                console.log(req.session.user);
            }
            else{
                res.render('user/login')
                console.log("invalid Entry");
            }

        })
        .catch((err)=>{
            console.log(err);
        })
    },

    getLogout:(req,res)=>{
        req.session.destroy();
        res.render('user/login')
    }

}