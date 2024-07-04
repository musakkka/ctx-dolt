import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
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

async function generateMetadata(script: string): Promise<{ title: string, description: string, tags: string[], keywords: string }> {
    if (!openai) {
        throw new Error('OpenAI API not initialised');
    }

    const chatGptResponse = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', content: `
            You are an AI specialized in creating compelling and optimized metadata for video content. Based on the provided script, generate the following metadata in this format:
            Title: <compelling title>
            Description: <detailed description>
            Tags: <tag1>, <tag2>, <tag3>
            Keywords: <keyword1>, <keyword2>, <keyword3>` },
            { role: 'user', content: script }
        ],
        model: 'gpt-4o',
    });

    const metadata = chatGptResponse.choices[0].message.content;
    const lines = metadata.split('\n').map(line => line.trim());

    const title = lines.find(line => line.startsWith('Title:'))?.replace('Title: ', '') || '';
    const description = lines.find(line => line.startsWith('Description:'))?.replace('Description: ', '') || '';
    const tags = lines.find(line => line.startsWith('Tags:'))?.replace('Tags: ', '').split(', ').filter(tag => tag) || [];
    const keywords = lines.find(line => line.startsWith('Keywords:'))?.replace('Keywords: ', '') || '';

    return { title, description, tags, keywords };
}

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        const body = await request.json();

        if (!body.permissions || body.permissions !== 'allowed') {
            return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
        }
        
        await mongooseConnect();

        // Find content with approved script and without existing metadata
        const content = await Content.findOne({
            content_generation_script_approved: true,
            $or: [
                { content_publishing_title: { $in: [null, ""] } },
                { content_publishing_description: { $in: [null, ""] } },
                { tags: { $in: [null, []] } },
                { keywords: { $in: [null, ""] } }
            ]
        });

        if (!content) {
            return NextResponse.json({ error: "No content found with approved script and missing metadata" }, { status: 404 });
        }

        const { content_generation_script } = content;
        const { title, description, tags, keywords } = await generateMetadata(content_generation_script);

        console.log({ title, description, tags, keywords });

        content.content_publishing_title = title;
        content.content_publishing_description = description;
        content.tags = tags;
        content.keywords = keywords;
        content.category = "22"; // Example category ID, can be dynamically generated based on the script

        await content.save();

        return NextResponse.json({ message: "Metadata created successfully", content });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
