import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import ytdl from "ytdl-core";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Asset } from "@/models/Asset";
import { v4 as uuidv4 } from 'uuid';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { description, videoUrl, channelId } = await request.json();
    console.log({ description, videoUrl, channelId });

    await mongooseConnect();

    const key = `${channelId}-${Date.now()}-${uuidv4()}.mp4`;

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
            ContentType: "video/mp4",
          },
        }).done(),
      };
    };

    const { writeStream, promise } = uploadStream(key);

    await pipeline(ytdl(videoUrl), writeStream);
    await promise;

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;

    const newAsset = new Asset({
      description,
      type: "video",
      url: fileUrl,
      account_id: channelId,
    });
// TEST COMMIT
    await newAsset.save();

    console.log("Video downloaded, uploaded to S3, and asset created successfully");

    return NextResponse.json({ message: "Video downloaded, uploaded to S3, and asset created successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
