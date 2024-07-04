import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';
import axios from "axios";

export const maxDuration = 59; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'


export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        const body = await request.json();

        if (!body.permissions || body.permissions !== 'allowed') {
            return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
        }
        await mongooseConnect();

        // Find content with the specified conditions
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const content = await Content.findOne({
            content_generation_background_video_url: { $ne: "" },
            content_publishing_final_video_url: { $in: [null, ""] },
            $and: [
                { content_generation_captions: { $ne: "" } },
                { content_generation_captions: { $ne: "[]" } }
            ],
            // updated_at: { $lt: tenMinutesAgo }
        });
        if (!content) {
            return NextResponse.json({ error: "No content available that has non-empty background video URL, an empty final video URL, non-empty captions, and the content being updated more than 10 minutes ago." }, { status: 404 });
        }

        const backgroundVideoUrl = content.content_generation_background_video_url;
        const captions = content.content_generation_captions;

        const apiUrl = `${process.env.PATH_TO_PYTHON_SERVER}/create-captioned-semantic-videos-v2`;
        const postData = {
            background_video_url: backgroundVideoUrl,
            captions: captions,
        };
        const apiResponse = await axios.post(apiUrl, postData);

        // Store the final video URL in the database
        content.content_publishing_final_video_url = apiResponse.data.expected_output_video_url;
        await content.save();

        return NextResponse.json({ message: "Captioned Semantic Video Created Successfully", output_video_url: apiResponse.data.expected_output_video_url }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
