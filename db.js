const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL =  'mongodb://127.0.0.1:27017/voting';
// const mongoURL = 'mongodb+srv://tamhira:btechsucks20@cluster0.fmld8zz.mongodb.net/';
// const mongoURL = process.env.MONGODB_URL;

mongoose.connect(mongoURL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB Server");
});

db.on("error", (err) => {
  console.log("Error in MongoDB Server", err);
});
db.on("disconnected", () => {
  console.log("Disconnected from MongoDB Server");
});

module.exports = db;