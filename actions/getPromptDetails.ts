import { Prompt } from "@/models/Prompt";
import { mongooseConnect } from "@/libs/mongoose";

export const getPromptDetails = async (promptId: string) => {
  try {
    await mongooseConnect();
    const prompt = await Prompt.findById(promptId).exec();
    if (!prompt) {
      throw new Error("Prompt not found");
    }
    return prompt;
  } catch (error) {
    console.error("Error fetching prompt details:", error);
    throw new Error("Unable to fetch prompt details");
  }
};
