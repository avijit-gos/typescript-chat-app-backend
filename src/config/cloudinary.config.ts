/** @format */

import { v2 as cloudinary } from "cloudinary";

function cloudinaryInit() {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string, // Click 'View API Keys' above to copy your API secret
  });
}
export default cloudinaryInit;
