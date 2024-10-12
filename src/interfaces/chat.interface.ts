/** @format */

import mongoose from "mongoose";

interface IChat {
  readonly _id: mongoose.Schema.Types.ObjectId;
  name: string;
  bio: string;
  profileImage: string;
  users: mongoose.Schema.Types.ObjectId[];
  readonly creator: mongoose.Schema.Types.ObjectId;
  status: string;
  chatType: string;
  isVerify: boolean;
  chatPrivacy: string;
  bookmark: mongoose.Schema.Types.ObjectId[];
  admins: mongoose.Schema.Types.ObjectId[];
  blockUsers: mongoose.Schema.Types.ObjectId[];
  reports: mongoose.Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export default IChat;
