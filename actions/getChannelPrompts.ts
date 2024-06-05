import { Prompt } from "@/models/Prompt";
import { mongooseConnect } from "@/libs/mongoose";

export const getChannelPrompts = async (channelId: string) => {
  try {
    await mongooseConnect();
    const prompts = await Prompt.find({ channelId })
      .sort({ created_at: -1 }) // Sort by "createdAt" in descending order (latest first)
      .exec();
    // console.log({prompts})
    return prompts;
  } catch (error) {
    console.error("Error fetching channel prompts:", error);
    throw new Error("Unable to fetch channel prompts.");
  }
};
