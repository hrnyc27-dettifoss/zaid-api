const express = require("express");
const app = express();
const port = 3000;
const { Product } = require("../models/product.js");
const { Style } = require("../models/style.js");
const { RelatedProducts } = require("../models/relatedProduct.js");
const _ = require("underscore");

app.use(express.static("loaderio-02b5033c16a569f322adff8edb0c0765.txt"));
app.get("/", (req, res) => {
  res.send("Test Success");
});
app.get("/products/list", (req, res) => {
  let page = req.query.page || 1;
  let count = req.query.count || 5;
  let startId = (page - 1) * count + 1;
  let endId = page * count;
  Product.find({ id: { $gte: startId, $lte: endId } })
    .then(data => {
      let scrubbed = _.map(data, product => {
        let cleaned = {
          id: product.id,
          name: product.name,
          slogan: product.slogan,
          description: product.description,
          category: product.category,
          default_price: product.default_price
        };

        return cleaned;
      });
      res.send(scrubbed);
    })
    .catch(err => {
      res.status(500).send("Sorry we couldn't get that for you");
    });
  //collection.find( { qty: { $gt: 4 } } )
  // [(page ] * count 5 = 10 < - start at 10
  // [ (page 2)] * count 5 = 10 - 1 <  end at 9

  // page (10) -1 * count 500 < - start
});

app.get("/products/:product_id", (req, res) => {
  let idYo = req.params.product_id;
  Product.find({ id: idYo })
    .then(product => {
      product = product[0];
      let cleaned = {
        id: product.id,
        name: product.name,
        slogan: product.slogan,
        description: product.description,
        category: product.category,
        default_price: product.default_price,
        features: product.features
      };
      res.send(cleaned);
    })
    .catch(err => {
      res.status(500).send("Sorry but we couldn't get that for you :(");
    });
});

app.get("/products/:product_id/styles", (req, res) => {
  let id = req.params.product_id;
  Style.find({ product_id: id })
    .then(styles => {
      let scrubbed = _.map(styles, style => {
        
        // remove dashes from shoe sizes and insert dots, so 10-5  becomes 10.5
        let cleanSku = {};
        for (sku in style.skus){
            // let newSku = sku.split("-").join(".");
            // cleanSky.newSku = style.skus[sku];
            let okay = sku.split("-").join(".")
            cleanSku[[okay]] = style.skus[sku];
        }
        let cleaned = {
            style_id: style.style_id,
            name: style.name,
            original_price: style.original_price,
            sale_price: style.sale_price,
            "default?": style["default?"],
            photos: style.photos,
            skus: cleanSku
        };

        return cleaned;
      });
      let final = {
          product_id: id,
          results: scrubbed
      }
      res.send(final);
    })
    .catch(err => {
      res.status(500).send("Sorry we couldn't find that for you :(");
    });
  
});

app.get('/products/:product_id/related', (req, res) => {
    let id = req.params.product_id;
    
    RelatedProducts.find({product_id: id})
    .then(data => {
        res.send(data[0].related_ids);
    })
    .catch(err => {
        res.send(err);
    })
})
app.listen(port, () => console.log(`Connected on port ${port}!`));
