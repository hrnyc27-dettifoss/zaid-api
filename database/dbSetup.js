const mongoose = require("mongoose");
mongoose.connect("mongodb://mongo:27017/products", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
});


exports.mongoose = mongoose;
exports.db = db;
