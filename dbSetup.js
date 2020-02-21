const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/products", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
});

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: Number,
  features: [
    {
      feature: String,
      value: String
    }
  ]
});

const product_styles_schema = new mongoose.Schema({
  product_id: Number,
  results: [
    {
      style_id: Number,
      name: String,
      original_price: Number,
      sale_price: Number,
      default: Number,
      photos: [
        {
          thumbnail_url: String,
          url: String
        }
      ],
      skus: {
        String: String
      }
    }
  ]
});
