const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sliderSchema = new Schema({

    slider:{
        title:String,
        subTitle:String,
        imageUrl:String,
        class:String
    }
})

const slider= mongoose.model("sliders", sliderSchema);
module.exports = slider;