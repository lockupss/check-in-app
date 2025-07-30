import { hash, compare } from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(password, hashedPassword);
};