import { Content } from "@/models/Content";
import { mongooseConnect } from "@/libs/mongoose";

export const getContentDetails = async (contentId: string) => {
  try {
    await mongooseConnect();
    const prompt = await Content.findById(contentId).exec();
    if (!prompt) {
      throw new Error("Prompt not found");
    }
    return prompt;
  } catch (error) {
    console.error("Error fetching prompt details:", error);
    throw new Error("Unable to fetch prompt details");
  }
};
