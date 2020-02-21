const papa = require("papaparse");
const fs = require("fs").promises;

// fs.readFile("./sdc_app_data/features.csv", 'ascii', (err, content) => {
//     if (err) return console.error(err);
//     console.log("Successfully read");
// })

fs.open("./sdc_app_data/features.csv", "r")
  .then(file => {
    file.read()
    .then(data => console.log(data))
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err));

  papa.parse()