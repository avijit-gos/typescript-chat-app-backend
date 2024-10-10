/** @format */

import bcrypt from "bcrypt";

async function hashPassword(password: string): Promise<string> {
  const hash: string = await bcrypt.hash(password, 10);
  return hash;
}
export default hashPassword;
