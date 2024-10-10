/** @format */

import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  readonly _id: mongoose.Schema.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  status: string;
  bio: string;
  accountType: string;
  reports: mongoose.Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default IUser;
