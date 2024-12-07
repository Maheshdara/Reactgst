const mongoose = require("mongoose");

const subproductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const stockSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  subproducts: [subproductSchema]
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
