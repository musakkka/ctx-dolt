import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import ytdl from "ytdl-core";
import { Asset } from "@/models/Asset";
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';
import stream from 'stream';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from "@azure/storage-blob";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const pipeline = promisify(stream.pipeline);

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = "your-container-name";  // Replace with your container name

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

async function getOrCreateContainer(containerName: string) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`Container ${containerName} created`);
  }
  return containerClient;
}

async function generateSasToken(blobName: string, containerClient: any) {
  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + 60);  // Set the SAS token to expire in 60 minutes

  const sasOptions = {
    containerName: containerClient.containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"),  // Read permissions
    expiresOn,
    protocol: SASProtocol.Https,
  };

  const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME!,
    process.env.AZURE_STORAGE_ACCOUNT_KEY!
  );

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  return `${containerClient.url}/${blobName}?${sasToken}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { description, videoUrl, channelId } = await request.json();
    console.log({ description, videoUrl, channelId });

    await mongooseConnect();

    const key = `${channelId}-${Date.now()}-${uuidv4()}.mp4`;

    const containerClient = await getOrCreateContainer(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);

    // Create temporary file paths for audio, video, and final output
    const audioPath = path.join('/tmp', `${uuidv4()}.mp3`);
    const videoPath = path.join('/tmp', `${uuidv4()}.mp4`);
    const outputPath = path.join('/tmp', key);

    // Download audio
    await pipeline(
      ytdl(videoUrl, { quality: 'highestaudio' }),
      fs.createWriteStream(audioPath)
    );

    // Download video
    await pipeline(
      ytdl(videoUrl, { quality: 'highestvideo' }),
      fs.createWriteStream(videoPath)
    );

    // Combine audio and video using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions('-c:v copy')
        .outputOptions('-c:a aac')
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // Upload combined file to Azure Blob Storage
    const uploadStream = (blockBlobClient: any) => {
      const pass = new stream.PassThrough();
      return {
        writeStream: pass,
        promise: blockBlobClient.uploadStream(pass, 4 * 1024 * 1024, 20),  // Buffer size and concurrency
      };
    };

    const { writeStream, promise } = uploadStream(blockBlobClient);

    await pipeline(fs.createReadStream(outputPath), writeStream);
    await promise;

    const fileUrl = await generateSasToken(key, containerClient);

    const newAsset = new Asset({
      description,
      type: "video",
      url: fileUrl,
      account_id: channelId,
    });

    await newAsset.save();

    console.log("Video downloaded, merged, uploaded to Azure Blob Storage, and asset created successfully");

    // Revalidate the path to ensure the updated data is reflected
    revalidatePath(`/channel/${channelId}`);

    // Clean up temporary files
    fs.unlinkSync(audioPath);
    fs.unlinkSync(videoPath);
    fs.unlinkSync(outputPath);

    return NextResponse.json({ message: "Video downloaded, merged, uploaded to Azure Blob Storage, and asset created successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
