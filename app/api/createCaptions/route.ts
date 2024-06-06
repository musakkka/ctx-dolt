import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        await mongooseConnect();

        // Find content with voice over URL approved and captions empty
        const content = await Content.findOne({ 
            content_generation_voice_over_url: { $ne: "" },
            content_generation_voice_over_url_approved: true,
            $or: [
                { content_generation_captions: { $exists: false } },
                { content_generation_captions: "" }
            ]
        });

        console.log({content})

        if (!content) {
            return NextResponse.json({ error: "No content with approved voice over and empty captions found" }, { status: 404 });
        }

        // Send a request to the Python server for transcription
        const transcriptionResponse = await fetch('http://75.101.181.150/transcribe/', {
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
        console.log({captions});

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
