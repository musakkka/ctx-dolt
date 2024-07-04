import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import ytdl from "ytdl-core";
import { Asset } from "@/models/Asset";
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } from "@azure/storage-blob";
import { PassThrough } from 'stream';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_CONTAINER_NAME!;

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
  expiresOn.setFullYear(expiresOn.getFullYear() + 10);  // Set the SAS token to expire in 10 years

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

    // Download video and pipe directly to Azure Blob Storage
    const videoStream = ytdl(videoUrl, { quality: 'highest' });

    const pass = new PassThrough();
    const uploadPromise = blockBlobClient.uploadStream(pass, 4 * 1024 * 1024, 20);  // Buffer size and concurrency

    videoStream.pipe(pass);

    await uploadPromise;

    const fileUrl = await generateSasToken(key, containerClient);

    const newAsset = new Asset({
      description,
      type: "video",
      url: fileUrl,
      account_id: channelId,
    });

    await newAsset.save();

    console.log("Video downloaded, uploaded to Azure Blob Storage, and asset created successfully");

    // Revalidate the path to ensure the updated data is reflected
    revalidatePath(`/channel/${channelId}`);

    return NextResponse.json({ message: "Video downloaded, uploaded to Azure Blob Storage, and asset created successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
