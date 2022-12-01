const User = require("../../model/user/signUpModel")
const mailer = require('../../middleware/otp')
const bcrypt = require("bcrypt");

let data;
module.exports={

    getSignup:(req,res)=>{
        res.render('user/signup')
    },

    postSignup: async (req,res)=>{

        try{
            data =req.body;
            let mailDetails = {
                from: "thalhaz999@gmail.com",
                to: data.email,
                subject: "KICKS ACCOUNT REGISTRATION",
                html: `<p>YOUR OTP FOR REGISTERING IN KICKS IS ${mailer.OTP}</p>`,
              };
              if(req.body.password === req.body.confirmpassword){
                User.find({ email:data.email,number:data.number })
                .then((result)=>{
                    if(result.length){
                        res.render('user/singup',{err_message:"details already exist"});
                    }else{
                        
                        mailer.mailTransporter.sendMail(mailDetails,(err,data)=>{
                            if(err){
                              
                                console.log('error occurs');
                                
                            }else{
                                res.render('user/otpsignup')
                                console.log(data);
                            }
                        })
                    }
                });
              }else{
                res.render('user/signup',{err_message:"password must be same"})
              }
        }catch(error){
            console.log(error);
        }
    },
    
    postOtpsignup:async(req,res)=>{
        try{
            let otp = req.body.otp;
            console.log(otp);
            console.log(mailer.OTP);
            if(mailer.OTP == otp){
                console.log('matched');
               await bcrypt.hash(data.password, 10).then((password)=>{
                    console.log("password");
                    const user = new User({
                        firstname:data.firstname,
                        lastname:data.lastname,
                        email:data.email,
                        number:data.number,
                        password:password,
                    });
                     user.save().then(()=>{
                        req.session.user = user.email
                        res.redirect('/')
                    })
                })
            }else{
                console.log("error");
            }
        }catch(error){
            console.log(error);
        }
    },
}