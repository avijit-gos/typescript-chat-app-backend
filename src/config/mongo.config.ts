/** @format */

import mongoose from "mongoose";

function databaseInit() {
  mongoose.connect(process.env.DB_URL as string);
  mongoose.connection.on("error", () => console.log("DB is not connected"));
  mongoose.connection.on("connected", () => console.log("DB is connected"));
}
export default databaseInit;
