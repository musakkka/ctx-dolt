import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';
import { subMinutes } from 'date-fns';

export const maxDuration = 59; // This function can run for a maximum of 5 seconds


export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        const body = await request.json();
  
        if (!body.permissions || body.permissions !== 'allowed') {
            return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
        }
        await mongooseConnect();

        const tenMinutesAgo = subMinutes(new Date(), 10);

        // Find content with a non-empty final video URL, non-empty metadata, updated more than 10 minutes ago, and no YouTube URL
        const content = await Content.findOne({
            content_publishing_final_video_url: { $ne: "" },
            content_publishing_title: { $ne: "" },
            content_publishing_description: { $ne: "" },
            tags: { $ne: [] },
            keywords: { $ne: "" },
            final_publishing_youtube_url: { $in: [null, ""] },
            updated_at: { $lte: tenMinutesAgo }
        });

        if (!content) {
            return NextResponse.json({ message: "No content found" }, { status: 404 });
        }

        const {
            content_publishing_final_video_url,
            content_publishing_title,
            content_publishing_description,
            tags,
            keywords,
            category,
            account_id // Assume account_id is used as the channel ID
        } = content;

        const payload = {
            file: content_publishing_final_video_url,
            title: content_publishing_title || "Default Title", // Ensure non-empty title
            description: content_publishing_description || "Default Description", // Ensure non-empty description
            tags: tags.length > 0 ? tags.join(", ") : "default, tags", // Convert tags array to string
            keywords: keywords || "default, keywords",
            category: category || "22", // Default category if not provided
            privacyStatus: "public",
            channelId: account_id // Send the channel ID
        };
        
        console.log("Making request to Python server with data:", JSON.stringify(payload));

        const uploadToYoutubeResponse = await fetch(`${process.env.PATH_TO_PYTHON_SERVER}/uploadToYouTube`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!uploadToYoutubeResponse.ok) {
            const errorText = await uploadToYoutubeResponse.text();
            console.error("Failed to upload to YouTube:", errorText);
            throw new Error("Failed to upload to YouTube");
        }

        const uploadData = await uploadToYoutubeResponse.json();

        // Assume the YouTube ID is returned in uploadData.id
        const youtubeUrl = `https://www.youtube.com/watch?v=${uploadData.id}`;

        const updatedContent = await Content.updateOne(
            { _id: content._id },
            { final_publishing_youtube_url: youtubeUrl }
        );

        return NextResponse.json({ message: "Video Uploaded to YouTube successfully", content: uploadData });
    } catch (err) {
        console.error("Internal Server Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
