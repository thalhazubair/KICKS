const nodemailer = require("nodemailer");

module.exports={
    mailTransporter : nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"thalhaz999@gmail.com",
            pass:"kive lbfu mqty zvha"
        },
    }),
    OTP : `${Math.floor(1000 + Math.random() * 9000)}`,
}