const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  categories: {
    type: String,
    required: true,
  },
});

const category = mongoose.model("categories", categorySchema);
module.exports = category;