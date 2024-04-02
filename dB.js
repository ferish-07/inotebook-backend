const mongoose = require("mongoose");

const mongoURL =
  "mongodb://0.0.0.0:27017/inotebook?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const connectToMongo = () => {
  mongoose
    .connect(mongoURL)
    .then(() => {
      console.log("Connection was successfull");
    })
    .catch((err) => console.log("error------------------", err));
};

module.exports = connectToMongo;
