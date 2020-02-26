const papa = require("papaparse");
const fs = require("fs");
const _ = require("underscore");
const { Style } = require("../models/style.js");
const { db } = require("../database/dbSetup.js");

let readStream = fs.createReadStream("../sdc_app_data/photos.csv", "ascii");

let successCount = 0;
let failedCount = 0;
let failedRecords = [];
const startTime = Date.now();

let config = {
  chunk: function(results, parser) {
    let ops = [];
    for (let row of results.data) {
        let styleId = row[1];
        let pic = row[2];
        let thumbnail = row[3];
        let photo = {
            url: pic,
            thumbnail_url: thumbnail
        }
      if (row.length === 4) {
      } else {
        failedCount += 1;
        failedRecords.push(row);
        continue;
      }
      ops.push({
        updateOne: {
          filter: { style_id: styleId },
          update: { $push: { photos: photo } }
        }
      });

    }
    Style.bulkWrite(ops)
      .then(res => {
        successCount += res.matchedCount;
        console.log("Success");
        console.log(res);
      })
      .catch(err => {
        console.log("Failed");
        console.log(err);
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
      `photos.csv\n\n` +
      `Completed in ${totalTime}s\n` +
      `Total records written: ${successCount}\n` +
      `Failed Chunks: ${failedCount}\n\n` +
      `---Failed records---\n` +
      JSON.stringify(failedRecords, null, 2) +
      "\n" +
      "=======================";;
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
