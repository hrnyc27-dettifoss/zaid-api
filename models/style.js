const { mongoose } = require("../database/dbSetup.js");
const stylesSchema = new mongoose.Schema({
  product_id: {type: Number, index: true},
  style_id: {type: Number, index: true},
  name: String,
  original_price: Number,
  sale_price: Number,
  "default?": Number,
  skus: Object,
  photos: [Object]
});

const Style = mongoose.model("Style", stylesSchema);

exports.Style = Style;
