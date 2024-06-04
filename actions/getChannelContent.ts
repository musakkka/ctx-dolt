import { Content } from "@/models/Content";
import { mongooseConnect } from "@/libs/mongoose";

export const getChannelContent = async (channelId: string) => {
  try {
    await mongooseConnect();
    const content = await Content.find({ account_id: channelId })
      .sort({ created_at: -1 }) // Sort by "createdAt" in descending order (latest first)
      .exec();
    return content;
  } catch (error) {
    console.error("Error fetching channel content:", error);
    throw new Error("Unable to fetch channel content.");
  }
};
