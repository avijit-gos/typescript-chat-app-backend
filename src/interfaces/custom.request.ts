import { Request } from "express";

interface CustomRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?:any
}

export default CustomRequest