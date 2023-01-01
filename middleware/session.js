const Session = require("../model/user/session")

module.exports = {
    verifyLoginAdmin: (req, res, next) => {
      if (req.session.admin) {
        next();
      } else {
        res.redirect("/admin");
      }
    },
    verifyLoginUser: async(req, res, next) => {
      await Session.find({ data:req.session.user }).then((data)=>{
      if (!data.length == 0) {
          next();
      } else {
        res.redirect("/");
      }
    })
    },
  };