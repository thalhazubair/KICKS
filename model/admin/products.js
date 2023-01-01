const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({

    name:{
        type:String,
        required:true,
    },

    brand:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true
    },

    stock: {
        type: Number,
        required: true,
      },

    category:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true,
    },

    size:{
        type:String,
        required:true
    },

    images: [{
        type: String,
      }],
      
    isDeleted: {
        type: Boolean,
        default: false,
    },
});

const product = mongoose.model("products", productSchema);
module.exports = product;