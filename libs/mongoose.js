import mongoose from "mongoose";

export async function mongooseConnect() {
  try {
    const uri = process.env.MONGODB_URI;
    return await mongoose.connect(uri);
  } catch (err) {
    console.log(err);
  }
   
}
