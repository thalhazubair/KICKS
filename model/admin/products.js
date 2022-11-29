const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({

    name:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true
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
        type:Number,
        required:true
    },

});

const product = mongoose.model("products", productSchema);
module.exports = product;