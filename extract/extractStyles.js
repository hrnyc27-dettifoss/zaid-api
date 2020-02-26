const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { Style } = require("../models/style.js");
const { db } = require("../database/dbSetup.js");
//const RelatedProducts = require('./models/relatedProduct').RelatedProducts

let readStream = fs.createReadStream("../sdc_app_data/styles.csv");
let successCount = 0;
let failedCount = 0;
let failedRecords = [];
const startTime = Date.now();

let config = {
  // step: function(results, parser) {
  //   let notEmpty = _.every(results.data, field => {
  //     return !!field;
  //   });

  //   if (notEmpty && results.data.length === 6) {
  //     let aStyle = new Style({
  //       product_id: Number.parseInt(results.data[1]),
  //       style_id: Number.parseInt(results.data[0]),
  //       name: results.data[2],
  //       original_price: Number.parseInt(results.data[4]),
  //       sale_price: results.data[3] === "null" ? 0 : Number.parseInt(results.data[3]),
  //       "default?": Number.parseInt(results.data[5])
  //     });
  //     aStyle.save((err, res) => {
  //       if (err) {
  //         failedCount += 1;
  //         failedRecords.push(results.data)
  //       } else {
  //         successCount += 1;
  //       }
  //     });
  //   } else {
  //     failedRecords.push(results.data);
  //     failedCount += 1;
  //   }
  // },
  // },
  chunk: function(results, parser) {
    let ops = [];
    for (let row of results.data) {
      let notEmpty = _.every(row, field => {
        return !!field;
      });
      if (!notEmpty && row.length !== 6) {
        failedRecords.push(row);
        failedCount += 1;
        continue;
      }
      let aStyle = {
        product_id: Number.parseInt(row[1]),
        style_id: Number.parseInt(row[0]),
        name: row[2],
        original_price: Number.parseInt(row[4]),
        sale_price: row[3] === "null" ? 0 : Number.parseInt(row[3]),
        "default?": Number.parseInt(row[5])
      };
      ops.push(aStyle);
    }
    Style.insertMany(ops, { ordered: false, rawResult: true })
      .then(res => {
        let total = res.insertedCount;
        successCount += Number.parseInt(total);
        failedCount += results.data.length - total;
      })
      .catch(err => {
        failedRecords.push(JSON.stringify(err));
      });
  },
  complete: function(results, file) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    let message = "";
    message +=
      `=======================\n` +
      `styles.csv\n\n` +
      `Completed in ${totalTime}s\n` +
      `Total records written: ${successCount}\n` +
      `Failed records: ${failedCount}\n\n` +
      `---Failed records---\n` +
      JSON.stringify(failedRecords, null, 2) +
      "\n" +
      "=======================";

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
