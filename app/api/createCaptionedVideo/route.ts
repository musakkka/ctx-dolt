import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';
import axios from "axios";

export async function GET(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        await mongooseConnect();

        // Find content with content_generation_background_video_url updated more than 10 minutes ago
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const content = await Content.findOne({
            content_generation_background_video_url: { $ne: "" },
            // updated_at: { $lt: tenMinutesAgo },
        });

        if (!content) {
            return NextResponse.json({ error: "No content available" }, { status: 404 });
        }

        const backgroundVideoUrl = content.content_generation_background_video_url;
        const captions = content.content_generation_captions;

        const apiUrl = `${process.env.PATH_TO_PYTHON_SERVER}/create-captioned-videos`;
        const postData = {
            background_video_url: backgroundVideoUrl,
            captions: captions,
        };
        const apiResponse = await axios.post(apiUrl, postData);
        
        // Store the final video URL in the database
        content.content_publishing_final_video_url = apiResponse.data.expected_output_video_url;
        await content.save();

        return NextResponse.json({ message: "Captioned Video Created Successfully", output_video_url: apiResponse.data.expected_output_video_url }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
