const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { Product } = require("../models/product.js");
const { db } = require("../database/dbSetup.js");

let readStream = fs.createReadStream("../sdc_app_data/features.csv", "ascii");

let successCount = 0;
let failedCount = 0;
let failedRecords = [];
const startTime = Date.now();

let config = {
  step: function(results, parser) {
    let notEmpty = _.every(results.data, data => {
      return !!data;
    });


    if (notEmpty && results.data.length === 4) {
      Product.update(
        { id: results.data[1] },
        {
          $push: { features: { [results.data[2]]: results.data[3] } }
        },
        (err, data) => {
          if (err) {
            failedCount += 1;
            failedRecords.push(results.data);
          } else {
            successCount += 1;
          }
        }
      );
    } else {
      failedCount += 1;
      failedRecords.push(results.data);
    }
  },
  complete: function(results, file) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    let message = "";
    message +=
      `=======================\n` +
      `Features.csv\n\n` +
      `Completed in ${totalTime}s\n` +
      `Total records written: ${successCount}\n` +
      `Failed records: ${failedCount}\n\n` +
      `---Failed records---\n` +
      JSON.stringify(failedRecords, null, 2) +
      "\n" +
      "=======================";

    //db.close();
    console.log("Features updated");
    db.close();
    fs.appendFile("../ETL_LOG.txt", message, "ascii", (err, data) => {
      if (err) {
        console.log("Something went wrong");
      } else {
        console.log("Write successful");
      }
    });
    db.close();
  }
};

papa.parse(readStream, config);
