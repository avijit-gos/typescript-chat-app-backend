/** @format */

import { v2 as cloudinary } from "cloudinary";
import cloudinaryInit from "../config/cloudinary.config";

cloudinaryInit();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadImage(image: any): Promise<string> {
  const result = await cloudinary.uploader.upload(image, {
    folder: "chat_app",
  });
  return result.url;
}

export default uploadImage;
