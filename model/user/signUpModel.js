const mongoose = require("mongoose")
const Schema = mongoose.Schema
// const userSignup = require("../controller/userController/userSignup")
var validateEmail = function(email) {
    var re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

var validateName = function(name) {
    return /^[a-zA-Z]+$/.test(name);
  };

const SignUpSchema = new Schema({

    name:{
        type:String,
        required:true,
        validate: [validateName, 'please fill a valid name'],
        match:[/^[a-zA-Z]+$/, 'please fill a valid name']
    },
   
    email: {
        type: String,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    number:{
        type: Number,
        unique: true,
    },
    
    addressDetails:[
        {
          housename:{
            type:String,
          },
          street:{
            type:String,
          },
          city:{
            type:String,
          },
          state:{
            type:String,
          },
          pincode:{
            type:Number,
          },
        },
      ],
    password:{
        type:String,
        required:true
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
})


const user = mongoose.model("User",SignUpSchema)
module.exports = user