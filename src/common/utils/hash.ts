import bcrypt from "bcrypt";

export const hashValue = async (value: string, salt: number = 10) => {
  return await bcrypt.hash(value, salt);
};

export const compareValue = async (data: string, encrypted: string) => {
  return await bcrypt.compare(data, encrypted);
};
