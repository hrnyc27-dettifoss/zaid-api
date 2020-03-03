const mongoose = require("mongoose");
mongoose.connect("mongodb://18.207.104.84:27017/products", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
});


exports.mongoose = mongoose;
exports.db = db;
