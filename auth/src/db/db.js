import mongoose from "mongoose";
import config from "./config.js";

function connecttoDB() {
  mongoose.connect(config.MONGO_URI).then(() => {
    console.log("connected to Db");
  });
}

export default connecttoDB;
