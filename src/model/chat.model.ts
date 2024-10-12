/** @format */

import mongoose from "mongoose";
import IChat from "../interfaces/chat.interface";

const ChatSchema = new mongoose.Schema<IChat>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, trim: true, required: [true, "Name is required"] },
    bio: { type: String, trim: true, default: "" },
    profileImage: { type: String, default: "" },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "restricted", "inactive", "delete"],
      default: "active",
    },
    chatType: {
      type: String,
      enum: ["single", "group", "channel"],
      default: "single",
    },
    chatPrivacy: {
      type: String,
      enum: ["open", "close", "only_admins"],
      default: "open",
    },
    isVerify: { type: Boolean, deafult: false },
    bookmark: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

ChatSchema.index({ name: 1 });
ChatSchema.index({ chatType: 1 });
ChatSchema.index({ status: 1 });

export default mongoose.model("Chat", ChatSchema);
