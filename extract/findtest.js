const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { RelatedProducts } = require("../models/relatedProduct.js");
const { db } = require("../database/dbSetup.js");

RelatedProducts.findOneAndUpdate(
  { product_id: 2 },
  {
    $push: { related_ids: 8}
  },
  {
    new: true,
    upsert: true
  },
  (err, data) => {
    db.close();
    if (err) {
      return console.log(err);
    } else {
      return console.log(data);
    }
  }
);
