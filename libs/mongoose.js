import mongoose from "mongoose";

export async function mongooseConnect() {
  if (mongoose.connection.readyState === 0) {
    try {
      const uri = process.env.MONGODB_URI;
      return await mongoose.connect(uri);
    } catch (err) {
      console.log(err);
    }
  } else {
    return mongoose.connection;
  }
}
