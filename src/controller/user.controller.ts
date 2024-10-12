/** @format */

import { Request, Response, NextFunction } from "express";
import IUser from "../interfaces/user.interface";
import userModel from "../model/user.model";
// import mongoose from "mongoose";
import createError from "http-errors";
import hashPassword from "../utils/hash.password";
import mongoose from "mongoose";
import generateToken from "../utils/generate.token";
import comparePassword from "../utils/compare.password";
import CustomRequest from "../interfaces/custom.request";
import fileUpload from "express-fileupload";
import uploadImage from "../utils/upload.image";

//*** Register a new user ***//
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, username, password, email } = req.body;
    if (!name) throw createError.BadRequest("Provide user name");
    if (!username) throw createError.BadRequest("Provide username");
    if (!email) throw createError.BadRequest("Provide user email");
    if (!password) throw createError.BadRequest("Provide password");

    const isUserExists: IUser | null = await userModel
      .findOne({
        $or: [{ email }, { username }],
      })
      .select("-password");
    //*** If user already exists with same email or username
    if (isUserExists && isUserExists.email)
      throw createError.BadRequest("User with same email already exists");
    if (isUserExists && isUserExists.username)
      throw createError.BadRequest("User with same username already exists");

    //*** Hash user password
    const hash: string = await hashPassword(password);
    const newUser = new userModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      username,
      password: hash,
    });
    const user: IUser | null = await newUser.save();

    //***Generate user token for authentication
    const token = await generateToken(user);
    res
      .status(201)
      .json({ message: "User register successfull", status: 201, user, token });
  } catch (error) {
    next(error);
  }
};

//*** User login ***//
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userInfo, password } = req.body;
    if (!userInfo)
      throw createError.BadRequest("Please provide email or username");
    if (!password) throw createError.BadRequest("Invalid account password");
    const user: IUser | null = await userModel.findOne({
      $or: [{ email: userInfo }, { username: userInfo }],
    });
    if (!user) throw createError.BadRequest("No user found");
    if (user && user.status !== "active")
      throw createError.BadRequest("Account don't have permission to loggedIn");

    //***Check user password
    const isPasswordCorrect: boolean = await comparePassword(
      password,
      user.password
    );
    if (!isPasswordCorrect)
      throw createError.BadRequest("Password is not correct");
    const token: string = await generateToken(user);
    res.status(200).json({
      message: "I=User loggedIn successfully",
      status: 200,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

//*** Get user profile ***//
export const getUserProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.id)
      throw createError.BadRequest("User profile id is not found");
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) throw createError.BadRequest("No user profile found");
    res.status(200).json({ message: "Fetch user profile", status: 200, user });
  } catch (error) {
    next(error);
  }
};

//*** Update profile details ***//
export const updateProfileDetails = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const originalUserData: IUser | null = await userModel
      .findById(req.user._id)
      .select("-password");
    if (!originalUserData)
      throw createError.BadRequest("No user profile found");
    if (originalUserData && originalUserData.status !== "active")
      throw createError.BadRequest("User profile status is not active");

    //***If user upload image
    let imageUrl: string | undefined;
    if (req.files && req.files.image) {
      const image = req.files && (req.files.image as fileUpload.UploadedFile); // Type assertion
      imageUrl = await uploadImage(image.tempFilePath);
    }

    const updatedProfileData = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: req.body.name || originalUserData.name,
          bio: req.body.bio || originalUserData.bio,
          profileImage: imageUrl || originalUserData.profileImage,
        },
      },
      { new: true }
    );
    res.status(200).json({
      message: "User profile details has been updated",
      status: 200,
      user: updatedProfileData,
    });
  } catch (error) {
    next(error);
  }
};

//*** Update account password ***//
export const resetPassword = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    if (!password) throw createError.BadRequest("Please provide password");
    if (!newPassword)
      throw createError.BadRequest("Please provide new password");
    if (!confirmPassword)
      throw createError.BadRequest("Please provide confirm password");
    if (confirmPassword !== newPassword)
      throw createError.BadRequest(
        "Confirm password & New password did not matched"
      );

    const user = await userModel.findById(req.user._id).select("password");
    if (!user) throw createError.BadRequest("User details not valid");

    //***Compare user password
    const isPasswordAuthenticated: boolean = await comparePassword(
      password,
      user.password
    );
    if (!isPasswordAuthenticated)
      throw createError.BadRequest("Password did not match");
    //***Hash user's new password
    const hash: string = await hashPassword(newPassword);
    const updatedProfilePassword = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: { password: hash } },
      { new: true }
    );
    res.status(200).json({
      message: "Account password has been changed",
      status: 200,
      user: updatedProfilePassword,
    });
  } catch (error) {
    next(error);
  }
};

//*** Report user ***//
export const reportProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.params.userId) throw createError.BadRequest("No user id found");
    const user: IUser | null = await userModel
      .findById(req.params.userId)
      .select("-password");
    if (!user) throw createError.BadRequest("No user found");
    if (user && user.status !== "active")
      throw createError.BadRequest("User profile is not active");

    const isReported: boolean =
      user.reports && user.reports.includes(req.user._id);
    const operation = isReported ? "$pull" : "$addToSet";

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.userId,
      {
        [operation]: { reports: req.user._id },
      },
      { new: true }
    );
    res.status(200).json({
      message: isReported ? "Removed report" : "Add report",
      status: 200,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

//*** Search user ***//
export const searchUserList = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const query = req.query.value
      ? {
          $or: [
            { name: { $regex: req.query.value, $options: "i" } },
            { username: { $regex: req.query.value, $options: "i" } },
          ],
        }
      : {};
    const users = await userModel
      .find({ $and: [{ status: { $eq: "active" } }, query] })
      .find({ _id: { $ne: req.user._id } })
      .select("name profileImage username")
      .limit(limit)
      .skip(limit * (page - 1));

    const totalCount: number = await userModel.countDocuments({
      $and: [{ status: { $eq: "active" } }, query],
    });
    res.status(200).json({
      message: `Search result ${req.query.value}`,
      status: 200,
      totalCount,
      users,
    });
  } catch (error) {
    next(error);
  }
};

//*** Update account type ***//

//*** Delete Account ***//
export const deleteAccount = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user: IUser | null = await userModel.findById(req.user._id);
    if (!user) throw createError.BadRequest("User not found");
    if (user && user.status === "delete")
      throw createError.BadRequest("Account has already been deleted");

    const deleteAccount = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: { status: "delete" },
      },
      { new: true }
    );
    res.status(200).json({
      message: "Account has been deleted",
      status: 200,
      user: deleteAccount,
    });
  } catch (error) {
    next(error);
  }
};
