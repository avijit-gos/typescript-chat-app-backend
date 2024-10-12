/** @format */

import mongoose from "mongoose";
import IChat from "../interfaces/chat.interface";
import chatModel from "../model/chat.model";
import IUser from "../interfaces/user.interface";
import userModel from "../model/user.model";
import createError from "http-errors";
import CustomRequest from "../interfaces/custom.request";
import { Response, NextFunction } from "express";
import fileUpload from "express-fileupload";
import uploadImage from "../utils/upload.image";

//*** Create a single chat ***//
export const createSingleChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.body.userID)
      throw createError.BadRequest(
        "Please provide the user id to start chatting"
      );
    const user: IUser | null = await userModel
      .findById(req.body.userID)
      .select("status");
    if (!user) throw createError.BadRequest("No user found");
    if (user && user.status !== "active")
      throw createError.BadRequest("User profile is not active");

    const isChatExists: IChat | null = await chatModel.findOne({
      $and: [{ users: req.user._id }, { users: req.body.userID }],
    });
    if (isChatExists && isChatExists.status === "active") {
      res.status(201).json({
        message: "Already have chat btween two user",
        status: 201,
        chat: isChatExists,
      });
    } else {
      const newChat = new chatModel({
        _id: new mongoose.Types.ObjectId(),
        name: "single_chat",
        users: [req.user._id, req.body.userID],
        creator: req.user._id,
      });
      const chat: IChat | null = await newChat.save();
      res
        .status(201)
        .json({ message: "A new chat has been created", status: 201, chat });
    }
  } catch (error) {
    next(error);
  }
};

//*** Get all groups/channels ***//
export const getChats = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const operation = req.query.chatType
      ? {
          $and: [{ chatType: req.query.chatType }, { status: "active" }],
        }
      : {};
    const chats = await chatModel
      .find(operation)
      .find({
        $and: [
          { creator: { $ne: req.user._id } },
          { users: { $nin: [req.user._id] } },
        ],
      })
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    const totalCounts = await chatModel.countDocuments(operation);
    res.status(200).json({
      message: `Fetch all ${req.query.chatType}`,
      status: 200,
      totalCounts,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

//*** Get all user specific chat ***//
export const getUserChats = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const chats = await chatModel
      .find({
        $or: [
          { creator: { $eq: req.user._id } },
          { users: { $in: [req.user._id] } },
        ],
      })
      .find({ status: { $eq: "active" } })
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    // const totalCounts = await chatModel.countDocuments({
    //   $and: [
    //     { creator: { $eq: req.user._id } },
    //     { users: { $in: [req.user._id] } },
    //     { status: "active" },
    //   ],
    // });
    res.status(200).json({
      message: `Fetch user chats`,
      status: 200,
      // totalCounts,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

//*** Get a single chat details ***//
export const getSingleChatDetails = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.chatId)
      throw createError.BadRequest("No chat id is present");
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .populate({ path: "creator", select: "name username profileImage" });
    res.status(200).json({ message: "Fetch chat details", status: 200, chat });
  } catch (error) {
    next(error);
  }
};

//*** Get all members of chat ***//
export const getAllMembers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .select("users");
    const users = chat?.users;
    const userList = await userModel
      .find({
        $and: [{ _id: { $in: users } }, { status: "active" }],
      })
      .select("name username profileImage bio")
      .limit(limit)
      .skip(limit * (page - 1));
    res.status(200).json({
      message: "Fetch all members from group",
      status: 200,
      members: userList,
    });
  } catch (error) {
    next(error);
  }
};

//*** Get all admins of the chat ***//
export const getAllAdmins = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .select("users");
    const users = chat?.admins;
    const userList = await userModel
      .find({
        $and: [{ _id: { $in: users } }, { status: "active" }],
      })
      .select("name username profileImage bio")
      .limit(limit)
      .skip(limit * (page - 1));
    res.status(200).json({
      message: "Fetch all members from group",
      status: 200,
      members: userList,
    });
  } catch (error) {
    next(error);
  }
};

//*** Create a group/channel chat ***//
export const createGroupChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, bio, chatType } = req.body;
    if (!name) throw createError.BadRequest("Please provide the name");
    if (!chatType)
      throw createError.BadRequest("Please provide what type of chat is it.");
    let imageUrl: string | undefined;
    if (req.files && req.files.image) {
      const image = req.files && (req.files.image as fileUpload.UploadedFile); // Type assertion
      imageUrl = await uploadImage(image.tempFilePath);
    }
    const newGroupChat = new chatModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      bio,
      chatType,
      profileImage: imageUrl,
      creator: req.user._id,
    });
    const chat: IChat | null = await newGroupChat.save();
    const updatedChat = await chatModel.findByIdAndUpdate(
      chat._id,
      {
        $addToSet: { admins: req.user._id },
      },
      { new: true }
    );
    const chatDetails = await updatedChat?.populate({
      path: "creator",
      select: "name username profileImage",
    });
    res.status(201).json({
      message: "A new chat has been created",
      status: 201,
      chat: chatDetails,
    });
  } catch (error) {
    next(error);
  }
};

//*** Update chat details ***//
export const updateChatDetails = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.chatId)
      throw createError.BadRequest("No chat id is present");
    const chat: IChat | null = await chatModel.findById(req.params.chatId);
    if (
      (chat && chat.chatType === "group") ||
      (chat && chat.chatType === "channel")
    ) {
      if (chat && chat.creator.toString() !== req.user._id.toString()) {
        throw createError.BadRequest(
          "You dont have the permission to change the chat details"
        );
      } else {
        //*** If there is image file present ***//
        let imageUrl: string | undefined;
        if (req.files && req.files.image) {
          const image =
            req.files && (req.files.image as fileUpload.UploadedFile); // Type assertion
          imageUrl = await uploadImage(image.tempFilePath);
        }
        const updatedChat = await chatModel.findByIdAndUpdate(
          req.params.chatId,
          {
            $set: {
              profileImage: req.body.profileImage || imageUrl,
              name: req.body.name || chat.name,
              bio: req.body.bio || chat.bio,
            },
          },
          { new: true }
        );
        res.status(200).json({
          message: "Chat details has been updated",
          status: 200,
          chat: updatedChat,
        });
      }
    } else {
      throw createError.BadRequest(
        "You cannot change the details of single chat"
      );
    }
  } catch (error) {
    next(error);
  }
};

//*** Add new user or remove existing member ***//
export const addOrRemoveMembers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.chatId) throw createError.BadRequest("No chat id is found");
    if (!req.body.userID)
      throw createError.BadRequest("No user ID is not provided");
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .select("users status chatType");
    if (
      (chat && chat.chatType === "channel") ||
      (chat && chat.chatType === "group")
    ) {
      const isAlreadyUser = chat.users && chat.users.includes(req.body.userID);
      const operation = isAlreadyUser ? "$pull" : "$addToSet";

      const updatedChat: IChat | null = await chatModel.findByIdAndUpdate(
        req.params.chatId,
        { [operation]: { users: req.body.userID } },
        { new: true }
      );
      res.status(200).json({
        message: isAlreadyUser ? "Remove member" : "Add new member",
        status: 200,
        chat: updatedChat,
      });
    } else {
      throw createError.BadRequest("You cannot add new members in single chat");
    }
  } catch (error) {
    next(error);
  }
};

//*** Add member to group admin ***//
export const AddOrRemoveAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.chatId) throw createError.BadRequest("No chat id is found");
    if (!req.body.userID)
      throw createError.BadRequest("No user ID is not provided");
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .select("admins status chatType");

    if (
      (chat && chat.chatType === "group") ||
      (chat && chat.chatType === "channel")
    ) {
      const isAlreadyAdmin =
        chat.admins && chat.admins.includes(req.body.userID);
      const operation = isAlreadyAdmin ? "$pull" : "$addToSet";
      const updatedChat: IChat | null = await chatModel.findByIdAndUpdate(
        req.params.chatId,
        { [operation]: { users: req.body.userID } },
        { new: true }
      );
      res.status(200).json({
        message: isAlreadyAdmin ? "Remove admin" : "Add new admin",
        status: 200,
        chat: updatedChat,
      });
    } else {
      throw createError.BadRequest("You cannot set admin in single chat");
    }
  } catch (error) {
    next(error);
  }
};

//*** Bookmark group ***//
export const addOrRemoveBookmark = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.chatId)
      throw createError.BadRequest("No chat id is present");
    const chat: IChat | null = await chatModel.findById(req.params.chatId);
    if (chat) {
      const isAlreadybookmark: boolean =
        chat.bookmark && chat.bookmark.includes(req.user._id);
      const operation = isAlreadybookmark ? "$pull" : "$addToSet";
      const updatedChat: IChat | null = await chatModel.findByIdAndUpdate(
        req.params.chatId,
        { [operation]: { bookmark: req.user._id } },
        { new: true }
      );
      res.status(200).json({
        message: isAlreadybookmark
          ? "Removed from bookmark"
          : "Add in bookmark",
        status: 200,
        chat: updatedChat,
      });
    } else {
      throw createError.BadRequest("No chat data found");
    }
  } catch (error) {
    next(error);
  }
};

//*** Update chat privacy ***//

//*** Report group chat ***//
export const addReport = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.chatId)
      throw createError.BadRequest("No chat id is present");
    const chat: IChat | null = await chatModel.findById(req.params.chatId);
    if (chat) {
      const updatedChat: IChat | null = await chatModel.findByIdAndUpdate(
        req.params.chatId,
        { $addToSet: { reports: req.user._id } },
        { new: true }
      );
      res.status(200).json({
        message: "Your report has been added",
        status: 200,
        chat: updatedChat,
      });
    }
  } catch (error) {
    next(error);
  }
};

//*** Delete chat ***//
export const deleteChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("*****");
    if (!req.params.chatId)
      throw createError.BadRequest("No chat id is present");
    const chat: IChat | null = await chatModel.findById(req.params.chatId);

    if (chat && chat.chatType !== "single") {
      if (chat && chat.creator.toString() !== req.user._id.toString()) {
        throw createError.BadRequest(
          "You don't have enough permission to delete this chat"
        );
      } else {
        const updatedChat = await chatModel.findByIdAndUpdate(
          req.params.chatId,
          { $set: { status: "delete" } },
          { new: true }
        );
        res.status(200).json({
          message: "Chat has been deleted",
          status: 200,
          chat: updatedChat,
        });
      }
    } else {
      const updatedChat = await chatModel.findByIdAndUpdate(
        req.params.chatId,
        { $set: { status: "delete" } },
        { new: true }
      );
      res.status(200).json({
        message: "Chat has been deleted",
        status: 200,
        chat: updatedChat,
      });
    }
  } catch (error) {
    next(error);
  }
};
