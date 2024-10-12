/** @format */

import express from "express";
import {
  AddOrRemoveAdmin,
  addOrRemoveBookmark,
  addOrRemoveMembers,
  addReport,
  createGroupChat,
  createSingleChat,
  deleteChat,
  getChats,
  getSingleChatDetails,
  getAllMembers,
  getUserChats,
  updateChatDetails,
  getAllAdmins,
} from "../controller/chat.controller";
import authentication from "../middleware/auth.middleware";
import checkChat from "../middleware/check.chat";
const router = express.Router();

//*** Create a single chat ***//
router.post("/create/single", authentication, createSingleChat);

//*** Get all groups/channels ***//
router.get("/", authentication, getChats);

//*** Get all user specific chat ***//
router.get("/user-chats", authentication, getUserChats);

//*** Get a single chat details ***//
router.get("/:chatId", authentication, checkChat, getSingleChatDetails);

//*** Get all members of chat ***//
router.get("/get-members/:chatId", authentication, checkChat, getAllMembers);

//*** Get all admins of the chat ***//
router.get("/get-admins/:chatId", authentication, checkChat, getAllAdmins);

//*** Create a group/channel chat ***//
router.post("/create", authentication, createGroupChat);

//*** Update chat details ***//
router.put(
  "/update-details/:chatId",
  authentication,
  checkChat,
  updateChatDetails
);

//*** Add new user or remove existing member ***//
router.patch(
  "/add-remove/member/:chatId",
  authentication,
  checkChat,
  addOrRemoveMembers
);

//*** Add member to group admin ***//
router.patch(
  "/add-remove/admin/:chatId",
  authentication,
  checkChat,
  AddOrRemoveAdmin
);

//*** Bookmark group ***//
router.patch(
  "/add-remove/bookmark/:chatId",
  authentication,
  checkChat,
  addOrRemoveBookmark
);

//*** Update chat privacy ***//

//*** Report group chat ***//
router.patch("/report/:chatId", authentication, checkChat, addReport);

//*** Delete chat ***//
router.delete("/delete/:chatId", authentication, checkChat, deleteChat);

export default router;
