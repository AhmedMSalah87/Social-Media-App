import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL_ONLINE as string, {
      dbName: "SocialMediaApp",
      serverSelectionTimeoutMS: 5000,
    });
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
