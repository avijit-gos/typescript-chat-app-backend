/** @format */

import bcrypt from "bcrypt";

async function comparePassword(
  password: string,
  userPassword: string
): Promise<boolean> {
  const iscorrect = await bcrypt.compare(password, userPassword);
  return iscorrect;
}
export default comparePassword;
