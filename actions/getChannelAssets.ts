import { Asset } from "@/models/Asset"; // Assuming the Asset model is defined similarly to the Prompt model
import { mongooseConnect } from "@/libs/mongoose";

export const getChannelAssets = async (channelId: string) => {
  try {
    await mongooseConnect();
    const assets = await Asset.find({ account_id: channelId }).exec();
    return assets;
  } catch (error) {
    console.error("Error fetching channel assets:", error);
    throw new Error("Unable to fetch channel assets.");
  }
};
