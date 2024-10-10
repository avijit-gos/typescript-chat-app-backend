/** @format */

import mongoose from "mongoose";
import IUser from "../interfaces/user.interface";

const UserSchema = new mongoose.Schema<IUser>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
      unique: true,
    },
    password: { type: String, required: [true, "Password is required"] },
    profileImage: { type: String, default: "" },
    bio: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "delete"],
      default: "active",
    },
    accountType: {
      type: String,
      enum: ["business", "verify", "none"],
      default: "none",
    },
    reports: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
