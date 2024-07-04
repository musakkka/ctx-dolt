import { Content } from "@/models/Content";
import { NextResponse } from "next/server";
import { mongooseConnect } from "@/libs/mongoose";
import { ElevenLabsClient } from "elevenlabs";
import { v4 as uuid } from "uuid";
import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";
import stream from 'stream';
import { NextApiRequest, NextApiResponse } from "next";

export const maxDuration = 59; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic'


const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME!;

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

async function generateSasToken(containerClient: any, blobName: string): Promise<string> {
  const expiresOn = new Date();
  expiresOn.setFullYear(expiresOn.getFullYear() + 10);  // Set the SAS token to expire in 10 years

  const sasOptions = {
    containerName: containerClient.containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"),  // Read permissions
    expiresOn,
  };

  const sharedKeyCredential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY);
  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  return sasToken;
}

async function uploadStreamToAzure(containerClient: any, blobName: string, inputStream: stream.Readable, contentType: string): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const pass = new stream.PassThrough();

  const uploadStream = async () => {
    await blockBlobClient.uploadStream(pass, 4 * 1024 * 1024, 20, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
  };

  inputStream.pipe(pass);
  await uploadStream();

  const sasToken = await generateSasToken(containerClient, blobName);
  return `${blockBlobClient.url}?${sasToken}`;
}

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
      const containerClient = await getOrCreateContainer(AZURE_CONTAINER_NAME);

      const audioUrl = await uploadStreamToAzure(containerClient, key, audio, "audio/mpeg");

      resolve(audioUrl);
    } catch (error) {
      reject(error);
    }
  });
};

export async function POST(request: NextApiRequest, response: NextApiResponse): Promise<any> {
  try {
      const body = await request.json();

      if (!body.permissions || body.permissions !== 'allowed') {
          return NextResponse.json({ error: "Permissions not allowed" }, { status: 403 });
      }
    await mongooseConnect();

    const content = await Content.findOne({
      content_generation_script_approved: true,
      content_generation_voice_over_url: ""
    });

    if (!content) {
      return NextResponse.json({ error: "No content found or voice-over already created" }, { status: 404 });
    }

    const voiceOverUrl = await createAudioFileFromText(content.content_generation_script);

    content.content_generation_voice_over_url = voiceOverUrl;
    await content.save();

    return NextResponse.json({ message: "Voice Over Created Successfully", voiceOverUrl }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
