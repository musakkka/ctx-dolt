import { Content } from "@/models/Content";
import { mongooseConnect } from "@/libs/mongoose";

export const getChannelContent = async (channelId: string) => {
  try {
    await mongooseConnect();
    const content = await Content.find({ account_id: channelId }).exec();
    // console.log({content})
    return content;
  } catch (error) {
    console.error("Error fetching channel content:", error);
    throw new Error("Unable to fetch channel content.");
  }
};
