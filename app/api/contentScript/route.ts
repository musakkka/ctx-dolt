import { Prompt } from "@/models/Prompt";
import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { ObjectId } from "mongoose";
import OpenAI from 'openai';

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
            { role: 'system', content: `
            You are an AI specialized in creating compelling and engaging scripts for videos. Your task is to generate scripts that are highly intriguing and interesting, ensuring they are detailed and substantial in length. Follow these guidelines:

            Captivating Content: Each script should captivate the audience from start to finish, incorporating a variety of fascinating facts, thought-provoking observations, and captivating narratives.
            Avoid Filler: Do not use a lot of filler words or jargon. Be concise yet descriptive, ensuring every sentence adds value and intrigue.
            Length and Detail: The scripts should be approximately 50% longer than typical short scripts, providing thorough and rich content. Aim for a length that supports a 5-10 minute video.
            Diverse Topics: Cover a range of topics within each script to keep the audience engaged. These can include paradoxes, curious facts, unexpected connections, and thought-provoking questions.
            Engaging Tone: Maintain an engaging, conversational, and thought-provoking tone throughout the script.
            Structure: Ensure the script flows logically from one idea to the next, creating a seamless narrative that keeps the audience intrigued.
            Use these guidelines to create detailed and engaging scripts that are suitable for producing interesting and substantial video content.
            The scripts should end following an example like in a way to upsell them to subscribe, though in the most smartest way. The content should be around 1000 characters. Do not explain jokes or your content.
            Do not make personal observations in the end or anywhere` },
            { role: 'user', content: promptText }
        ],
        model: 'gpt-4',
    });

    console.log(chatGptResponse.choices[0]);

    return `${chatGptResponse.choices[0].message.content}`;
}

export async function GET(): Promise<NextResponse> {
    try {
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
  
