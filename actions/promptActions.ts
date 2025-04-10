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


export const deletePrompt = async (promptId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await mongooseConnect();
    const result = await Prompt.deleteOne({ _id: promptId });

    if (result.deletedCount === 0) {
      return { success: false, message: "Content not found" };
    }

    revalidateTag("get-chanel-prompts");
    return { success: true, message: "Prompt Deleted Successfully!" };
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return { success: false, message: "Error deleting prompt!" };
  }
};