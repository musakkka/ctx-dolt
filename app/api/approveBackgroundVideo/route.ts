// approveBackgroundVideo.js
import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';

export const maxDuration = 59; // This function can run for a maximum of 59 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        console.log("Callback API Request For Approving Background Video Received");
        const body = await request.json();

        if (!body.contentId || !body.videoPath) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        await mongooseConnect();

        // Find the content by contentId
        const content = await Content.findById(body.contentId);
        if (!content) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 });
        }

        // Update the content with the new background video URL and approve it
        content.content_generation_background_video_url = body.videoPath;
        content.content_generation_background_video_url_approved = true;
        await content.save();

        return NextResponse.json({ message: "Background Video Approved Successfully" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
