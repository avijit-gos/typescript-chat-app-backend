/** @format */

import IChat from "../interfaces/chat.interface";
import chatModel from "../model/chat.model";
import createError from "http-errors";
import { Request, Response, NextFunction } from "express";

async function checkChat(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const chat: IChat | null = await chatModel
      .findById(req.params.chatId)
      .select("status");
    if (!req.params.chatId) {
      throw createError.BadRequest("No chat id is present");
    } else if (!chat) {
      throw createError.BadRequest("No chat data found");
    } else if (chat && chat.status === "delete") {
      throw createError.BadRequest("Chat has been deleted");
    } else if (chat && chat.status === "restricted") {
      throw createError.BadRequest("Chat has been restricted");
    } else if (chat && chat.status === "inactive") {
      throw createError.BadRequest("Chat has been inactive");
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

export default checkChat;
