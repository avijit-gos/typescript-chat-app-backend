/** @format */

import express from "express";
import {
  getUserProfile,
  loginUser,
  registerUser,
  resetPassword,
  updateProfileDetails,
  reportProfile,
  searchUserList,
  deleteAccount,
} from "../controller/user.controller";
import authentication from "../middleware/auth.middleware";
const router = express.Router();

//*** Register a new user ***//
router.post("/register", registerUser);

//*** User login ***//
router.post("/login", loginUser);

//*** Get user profile ***//
router.get("/profile/:id", authentication, getUserProfile);

//*** Update profile details ***//
router.put("/update-profile/", authentication, updateProfileDetails);

//*** Update account password ***//
router.patch("/reset-password", authentication, resetPassword);

//*** Report user ***//
router.patch("/report/:userId", authentication, reportProfile);

//*** Search user ***//
router.get("/", authentication, searchUserList);

//*** Update account type ***//

//*** Delete Account ***//
router.delete("/delete-account", authentication, deleteAccount)

export default router;
