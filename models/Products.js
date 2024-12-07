const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: String,
    gstPer: String,
    quantity: String,
    price: String,
    taxableAmount: String,
    cgst: String,
    sgst: String,
    totalAmount: String
  });
  
  const InvoiceSchema = new mongoose.Schema({
    customerName: String,
    phoneNumber: Number,
    invoice:Number,
    date:String,
    products: [ProductSchema],
    totalAmount:Number,
    totalTaxableAmount:Number,
    totalCgst:Number,
    totalSgst:Number,
    totalQty:Number
  });

const Pesticides = mongoose.model("Pesticides", InvoiceSchema);
const Fertilizer = mongoose.model("Fertilizers", InvoiceSchema);
const Seeds = mongoose.model("Seeds", InvoiceSchema);

module.exports = { Pesticides, Fertilizer, Seeds };
  


  
