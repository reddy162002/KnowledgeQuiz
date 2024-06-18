require('dotenv').config();
const mongoose = require("mongoose");
console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("Mongo Db Connection Successful");
  console.log("Hi here i am in success");
});

connection.on("error", (err) => {
  console.log("Mongo Db Connection Failed");
  console.log("Hi here i am in the error");
});
console.log("Hi here i am");

module.exports = connection;
