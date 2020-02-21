const {mongoose} = require("../database/dbSetup.js")
const stylesSchema = new mongoose.Schema({
  product_id: { type: Number, unique: true },
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
      skus: {}
    }
  ]
});

const Style = mongoose.model("Style", stylesSchema);

exports.Style = Style;
