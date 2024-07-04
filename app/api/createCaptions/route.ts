import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export const maxDuration = 59; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        const body = await request.json();

        if (!body.permissions || body.permissions !== 'allowed') {
            return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
        }

        await mongooseConnect();

        // Find content with a non-empty voice over URL and captions empty or not existing
        const content = await Content.findOne({
            content_generation_voice_over_url: { $ne: "" },
            $or: [
                { content_generation_captions: { $eq: "" } },
                { content_generation_captions: { $exists: false } },
                { content_generation_captions: "[]" } 
            ]
        });

        console.log({ content });

        if (!content) {
            return NextResponse.json({ error: "No content with non-empty voice over URL and empty captions found" }, { status: 404 });
        }

        // Send a request to the Python server for transcription
        const transcriptionResponse = await fetch(`${process.env.PATH_TO_PYTHON_SERVER}/transcribe/word-level`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                voice_over_url: content.content_generation_voice_over_url
            })
        });

        if (!transcriptionResponse.ok) {
            return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
        }

        const transcriptionResult = await transcriptionResponse.json();
        const captions = transcriptionResult.word_transcripts;
        console.log({ captions });
        console.log(`${process.env.PATH_TO_PYTHON_SERVER}/transcribe/word-level`);

        // Update the content with the new captions
        const updatedContent = await Content.updateOne(
            { _id: content._id },
            { content_generation_captions: JSON.stringify(captions) }
        );

        return NextResponse.json(updatedContent, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
