"use server";

import { Asset } from "@/models/Asset";
import { mongooseConnect } from "@/libs/mongoose";

interface AssetData {
  description: string;
  type: string;
  url: string;
  account_id: string;
}

export const createAsset = async (data: AssetData): Promise<{ success: boolean; message: string }> => {
  try {
    await mongooseConnect();
    const newAsset = new Asset(data);
    await newAsset.save();

    return { success: true, message: "Asset Created Successfully!" };
  } catch (error) {
    console.error("Error creating asset:", error);
    return { success: false, message: "Error creating asset!" };
  }
};
