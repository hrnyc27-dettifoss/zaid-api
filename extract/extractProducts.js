const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { Product } = require("../models/product.js");
const { db } = require("../database/dbSetup.js");
//const RelatedProducts = require('./models/relatedProduct').RelatedProducts

let readStream = fs.createReadStream("../sdc_app_data/product.csv")
let successCount = 0;
let failedCount = 0;
let failedRecords = [];
const startTime = Date.now();

let config = {
  step: function(results, parser) {
    let notEmpty = _.every(results.data, field => {
      return !!field
    });

    if (notEmpty && results.data.length === 6) {
      let aProduct = new Product({
        id: results.data[0],
        name: results.data[1],
        slogan: results.data[2],
        description: results.data[3],
        category: results.data[4],
        default_price: results.data[5]
      });

      aProduct.save((err, data) => {
        if (err) {
          failedRecords.push(results.data);
          failedCount += 1
        } else {
            successCount += 1; 
        }
      });
    } else {
        failedRecords.push(results.data);
        failedCount += 1;
    }

    //parser.abort();
  },
  complete: function(results, file) {
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    let message = "";
    message += `=======================\n`
    + `Products.csv\n\n`
    + `Completed in ${totalTime}s\n`
    + `Total records written: ${successCount}\n`
    + `Failed records: ${failedCount}\n\n`
    + `---Failed records---\n`
    + JSON.stringify(failedRecords, null, 2) + '\n'
    + "======================="

    //db.close();
    console.log("Done");
    db.close();
    fs.appendFile('../ETL_LOG.txt', message, 'ascii', (err, data) => {
        if (err){
            console.log("Something went wrong")
        } else {
            console.log("Write successful");
        }
    });
    db.close();
  }
};
papa.parse(readStream, config);

