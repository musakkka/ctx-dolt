"use server";

import { Prompt } from "@/models/Prompt";
import { mongooseConnect } from "@/libs/mongoose";
import { revalidateTag } from "next/cache";

interface PromptData {
  promptTitle: string;
  promptContent: string;
  promptId?: string;
  channelId?: string;
}

export const createPrompt = async (data: PromptData): Promise<{ success: boolean; message: string }> => {
  try {
    await mongooseConnect();
    const newPrompt = new Prompt(data);
    await newPrompt.save();
    revalidateTag("get-chanel-prompts");

    return { success: true, message: "Prompt Created Successfully!" };
  } catch (error) {
    console.error("Error creating prompt:", error);
    return { success: false, message: "Error creating prompt!" };
  }
};

export const updatePrompt = async (data: PromptData): Promise<{ success: boolean; message: string }> => {

  try {
    await mongooseConnect();
    await Prompt.findByIdAndUpdate(data.promptId, data);
    revalidateTag("get-chanel-prompts");

    return { success: true, message: "Prompt Updated Successfully!" };
  } catch (error) {
    console.error("Error updating prompt:", error);
    return { success: false, message: "Error updating prompt!" };
  }
};
