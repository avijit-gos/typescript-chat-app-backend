/** @format */

import jwt from "jsonwebtoken";
import IUser from "../interfaces/user.interface";

async function generateToken(user: IUser): Promise<string> {
  const token = await jwt.sign(
    {
      _id: user._id,
      status: user.status,
    },
    process.env.SECRET_KEY as string,
    { expiresIn: "365d" }
  );
  return token;
}
export default generateToken;
