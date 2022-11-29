const User = require("../../model/user/signUpModel")
module.exports={

    getSignup:(req,res)=>{
        res.render('user/signup')
    },

    postSignup:(req,res)=>{
        let firstname = req.body.firstname
        let lastname = req.body.lastname
        let email = req.body.email
        let number = req.body.number
        let password = req.body.password
        let confirmpassword = req.body.confirmpassword
        const user = new User({
            firstname:firstname,
            lastname:lastname,
            email:email,
            number:number,
            password:password,
            confirmpassword:confirmpassword
          });
        user
        .save()
        .then(()=>{
            if(password==confirmpassword){
                res.redirect('/otpsignup')
            }else{
                console.log("not matching password")
                res.render('user/signup')
            }
        })
        .catch((err)=>{
            console.log(err);
            res.render('user/signup')
        });
    },

    getOtpsignup:(req,res)=>{
        res.render('user/otpsignup')
    },

}