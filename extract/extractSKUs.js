const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { Style } = require("../models/style.js");
const { db } = require("../database/dbSetup.js");

let readStream = fs.createReadStream("../sdc_app_data/skus.csv", "ascii");

let successCount = 0;
let failedCount = 0;
let failedRecords = [];
const startTime = Date.now();

let config = {
  //   step: function(results, parser) {
  //     let notEmpty = _.every(results.data, data => {
  //       return !!data;
  //     });

  //     if (notEmpty && results.data.length === 4) {
  //       Product.update(
  //         { id: results.data[1] },
  //         {
  //           $push: { features: { [results.data[2]]: results.data[3] } }
  //         },
  //         (err, data) => {
  //           if (err) {
  //             failedCount += 1;
  //             failedRecords.push(results.data);
  //           } else {
  //             successCount += 1;
  //           }
  //         }
  //       );
  //     } else {
  //       failedCount += 1;
  //       failedRecords.push(results.data);
  //     }
  //   },
  chunk: function(results, parser) {
    let ops = [];
    for (let row of results.data) {
      let quantity = Number.parseInt(row[3]);
      let styleId = Number.parseInt(row[1]);
      let size = `skus.`;

      if (isNaN(Number.parseFloat(row[2]))) {
        size += row[2];
      } else {
        size += row[2].split(".").join("-");
      }
      if (
        row.length === 4 &&
        typeof quantity === "number" &&
        !isNaN(quantity)
      ) {
      } else {
        failedCount += 1;
        failedRecords.push(row);
        continue;
      }
      ops.push({
        updateOne: {
          filter: { style_id: styleId },
          update: { $set: { [[size]]: quantity } }
        }
      });
    }
    Style.bulkWrite(ops)
      .then(res => {
        successCount += res.modifiedCount;
      })
      .catch(err => {
        failedRecords.push(JSON.stringify(err));
        failedCount += 1;
      });
  },
  complete: function(results, file) {
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    let message = "";
    message +=
      `=======================\n` +
      `skus.csv\n\n` +
      `Completed in ${totalTime}s\n` +
      `Total records written: ${successCount}\n` +
      `Failed Chunks: ${failedCount}\n\n` +
      `---Failed records---\n` +
      JSON.stringify(failedRecords, null, 2) +
      "\n" +
      "=======================";


    db.close();
    fs.appendFile("../ETL_LOG.txt", message, "ascii", (err, data) => {
      if (err) {
        console.log("Something went wrong");
      } else {
        console.log("Write successful");
      }
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
    db.close();
  }
};

papa.parse(readStream, config);
