import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';
import { Asset } from "@/models/Asset";
import axios from "axios";

// List of background music URLs
const backgroundMusicUrls = [
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+a+bar+song+(tipsy)+-+instrumental+(1).mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+a+bar+song+(tipsy)+-+instrumental.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Blade+Runner+2049.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Bundle+of+Joy.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Comptine+d'un+autre+%C3%A9t%C3%A9%2C+l'apr%C3%A8s-midi.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Ice+Dance+(From+_Edward+Scissorhands_).mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Paris.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Pieces.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Runaway+-+Piano+Rendition.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Where+Is+My+Mind_+-+Piano+Rendition.mp3",
    "https://dolt-ctx-test.s3.amazonaws.com/background_music_down_to_us/spotifydown.com+-+Yuri+on+ICE.mp3"
];

export async function GET(request: NextApiRequest, response: NextApiResponse): Promise<any> {
    try {
        await mongooseConnect();
        // Find content with voice over URL approved and captions empty
        const content = await Content.findOne({
            content_generation_voice_over_url: { $ne: "" },
            // content_generation_voice_over_url_approved: true,
        });
        if (!content) {
            return NextResponse.json({ error: "No content available" }, { status: 404 });
        }
        const voice_over_url = content.content_generation_voice_over_url;
        const channel_id = content.account_id;
        const assets = await Asset.aggregate([
            { $match: { account_id: channel_id } }, // Match assets by channel_id
            { $sample: { size: 10 } } // Select 10 random documents
        ]);
        const assetUrls = assets.map(asset => asset.url);

        // Select a random background music URL
        const background_music_url = backgroundMusicUrls[Math.floor(Math.random() * backgroundMusicUrls.length)];


        const apiUrl = `${process.env.PATH_TO_PYTHON_SERVER}/create-video`; // Replace with your API URL
        const postData = {
            audio_url: voice_over_url,  // Make sure this key matches the one in FastAPI
            assetUrls: assetUrls,
            background_music_url: background_music_url  // Add background music URL to the request
        };
        const apiResponse = await axios.post(apiUrl, postData);
        const videoPath = apiResponse.data.video_path; // Get the URL from the response

        // Update the content with the new background video URL
        content.content_generation_background_video_url = videoPath;
        await content.save();

        return NextResponse.json({ message: "Video created successfully", video_path: videoPath }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
