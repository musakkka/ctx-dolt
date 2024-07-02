import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream, unlink } from "fs";
import { v4 as uuid } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";
import stream from 'stream';
import { Upload } from "@aws-sdk/lib-storage";



const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_PROJECT_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});





export const createAudioFileFromText = async (text: string): Promise<string> => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      const audio = await client.generate({
        voice: "Paul",
        model_id: "eleven_turbo_v2",
        text,
        voice_settings: {
          stability: 0.9,  // Increase for more consistent output
          similarity_boost: 0.8,  // Adjust for preventing volume drops
          style: 0.5,  // Keeping style exaggeration at 0 for stability
          use_speaker_boost: true,
        },
      });

      const key = `audio-${uuid()}.mp3`;

      const uploadStream = (key: string) => {
        const pass = new stream.PassThrough();
        return {
          writeStream: pass,
          promise: new Upload({
            client: s3Client,
            params: {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
              Body: pass,
              ContentType: "audio/mpeg",
            },
          }).done(),
        };
      };

      const { writeStream, promise } = uploadStream(key);

      audio.pipe(writeStream);

      await promise;

      const audioUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;

      resolve(audioUrl);
    } catch (error) {
      reject(error);
    }
  });
};
export async function GET(request: NextApiRequest, response: NextApiResponse): Promise<any> {
  try {
    await mongooseConnect();

    const content = await Content.findOne({ content_generation_script_approved: true });

    if (!content) {
      return response.status(404).json({ error: "No content found" });
    }

    const voiceOverUrl = await createAudioFileFromText(content.content_generation_script);


    content.content_generation_voice_over_url = voiceOverUrl;
    await content.save();


    return NextResponse.json("Voice Over Created Succesfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
