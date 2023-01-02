const User = require("../../model/user/signUpModel")
const mailer = require('../../middleware/otp')
const bcrypt = require("bcrypt");
// const { render } = require("ejs");

module.exports={

    getSignup:(req,res)=>{
        res.render('user/signup')
    },

    postSignup: async (req,res)=>{

        try{
            let userdata =req.body;
            let mailDetails = {
                from: "thalhaz999@gmail.com",
                to: userdata.email,
                subject: "KICKS ACCOUNT REGISTRATION",
                html: `<p>YOUR OTP FOR REGISTERING IN KICKS IS ${mailer.OTP}</p>`,
              };
              console.log("ivida");
              if(userdata.password === userdata.confirmpassword){
                User.find({ $or:[{email:userdata.email},{number:userdata.number}]})
                .then((result)=>{
                   
                    if(result.length){          
                       
                        res.render('user/signup',{err_msg:"details already exist"});
                    }else{
                        
                        mailer.mailTransporter.sendMail(mailDetails,(err)=>{
                            if(err){
                              
                                console.log('error occurs');
                                
                            }else{
                                res.render('user/otpsignup',{userdata});
                            }
                        })
                    }
                });
              }else{
                res.render('user/signup',{err_message:"password must be same"})
              }
        }catch(error){
            console.log(error +"error");
        }
    },
    
    postOtpsignup:async(req,res)=>{
        try{
            const userdata = req.body
            let otp = req.body.otp;
            console.log(otp);
            console.log(mailer.OTP);
            if(mailer.OTP == otp){
                console.log(userdata);
               await bcrypt.hash(userdata.password, 10).then((password)=>{
                
                    const user = new User({
                        name:userdata.name,
                        email:userdata.email,
                        number:userdata.number,
                        password:password,
                    });
                     user.save().then(()=>{
                        req.session.user = user.email
                        res.redirect('/')
                    })
                })
            }else{
                res.render("user/otpsignup",{err_msg:"OTP doesn't match", userdata})
            }
        }catch(error){
            console.log(error);
        }
    },


 
}