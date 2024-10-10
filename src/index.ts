/** @format */

import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import logger from "morgan";
import createError from "http-errors";
import databaseInit from "./config/mongo.config";
import fileUpload from "express-fileupload";

dotenv.config();
const app = express();
databaseInit();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(logger("dev"));
app.use(cors());
app.use(helmet());
app.use(
  fileUpload({
    useTempFiles: true, // Ensure the files are stored temporarily
    tempFileDir: "/tmp/", // Temp folder to store uploaded files
  })
);

import UserRoute from "./router/user.router";
app.use("/api/users", UserRoute);

// If route not found
app.use(async (_req, _res, next) => {
  next(createError.NotFound("Page not found"));
});
// Error message
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const port = process.env.PORT || 2020;
app.listen(port, () => {
  console.log(`App listening on port:${port}`);
});
