/** @format */

import { Response, NextFunction } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import CustomRequest from "../interfaces/custom.request";

async function authentication(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token: string =
      req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) throw createError.BadRequest("Token not found");
    const verify = await jwt.verify(token, process.env.SECRET_KEY as string);
    req.user = verify;
    // console.log(req.user);
    if (req.user.status !== "active")
      throw createError.BadRequest("User profile is not active");
    next();
  } catch (error) {
    next(error);
  }
}

export default authentication;
