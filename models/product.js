const { mongoose } = require("../database/dbSetup.js");
const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
  features: [Object]
});

const Product = mongoose.model("Product", productSchema);
exports.Product = Product;
