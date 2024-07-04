import { Prompt } from "@/models/Prompt";
import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { ObjectId } from "mongoose";
import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from "next";

export const maxDuration = 59; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'



let openai: OpenAI | undefined;

try {
  openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID!,
    apiKey: process.env.OPENAI_API_KEY!,
  });
} catch (error) {
  console.log('Failed to initialise OpenAI SDK', (error as Error).message);
}

async function getLeastUsedPrompt() {
  return await Prompt.findOne().sort({ usage_count: 1 }).exec();
}

async function incrementUsageCount(promptId: ObjectId) {
  await Prompt.findByIdAndUpdate(promptId, { $inc: { usage_count: 1 } }).exec();
}

async function createVideoScript(promptText: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API not initialised');
  }

  const chatGptResponse = await openai.chat.completions.create({
    messages: [
      {
        role: 'system', content: `
          You are an AI specialized in creating compelling and engaging motivational scripts. Your task is to generate scripts that teach morals through intuitive and philosophical stories. Follow these guidelines:

          Captivating Storytelling: Each script should captivate the audience from start to finish, incorporating engaging narratives and thought-provoking lessons.
          Avoid Filler: Be concise yet descriptive, ensuring every sentence adds value and intrigue.
          Philosophical Depth: Infuse the scripts with philosophical insights and moral teachings, making them deeply meaningful.
          Structure: Ensure the script flows logically from one idea to the next, creating a seamless narrative.
          Here is an example to inspire you:

          One day, a young boy asked a priest about the secret to success. The priest told the boy to meet him at the river at the end of the village. They walked to the river and entered until the water was covering their nose and mouth. Suddenly, the priest ducked the boy into the water. The boy struggled to breathe, but the priest held him down. After a few minutes, the priest pulled the boy up so he could get air. The boy gasped and inhaled deeply. The priest asked, "What were you fighting for when you were underwater?" The boy replied, "Air." The priest smiled and said, "When you want to succeed as much as you wanted to breathe, then you will be successful."

          Use these guidelines to create detailed and engaging scripts that teach profound moral lessons.
        ` },
      { role: 'user', content: promptText }
    ],
    model: 'gpt-4o',
  });

  console.log(chatGptResponse.choices[0]);

  return `${chatGptResponse.choices[0].message.content}`;
}

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
  try {
      const body = await request.json();

      if (!body.permissions || body.permissions !== 'allowed') {
          return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
      }
    await mongooseConnect();

    // Get the least used prompt
    const prompt = await getLeastUsedPrompt();
    if (prompt) {
      const promptText = prompt.promptContent;
      // Create the video script
      const script = await createVideoScript(promptText);
      // Update the usage count for the prompt
      await incrementUsageCount(prompt._id);

      // Create a new content entry with the generated script
      await Content.create({
        account_id: prompt.channelId,
        prompt_id: prompt._id,
        content_generation_script: script,
        content_generation_voice_over_url: '',
        content_generation_captions: '',
        content_generation_background_video_url: '',
        content_publishing_title: '',
        content_publishing_description: '',
        content_publishing_final_video_url: '',
        final_publishing_youtube_url: '',
        status: '',
        review_counts: '',
        corrections_to_be_made: [],
        content_generation_script_approved: false,
        content_generation_voice_over_url_approved: false,
        content_generation_captions_approved: false,
        content_generation_background_video_url_approved: false,
        tags: [],
        keywords: '',
        category: ''
      });

      // Return the created script as a response
      return NextResponse.json({ message: "Content Script Successfully Created", script });
    } else {
      return NextResponse.json({ error: "No prompts available" }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
