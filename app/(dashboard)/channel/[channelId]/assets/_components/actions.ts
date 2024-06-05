"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_PROJECT_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "video/mp4",
  "video/quicktime",
];

const generateFileName = (originalName: string, bytes = 32) => {
  const extension = originalName.split('.').pop();
  const fileName = crypto.randomBytes(bytes).toString("hex");
  return `${fileName}.${extension}`;
};

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string, key: string } }
  | { failure: string; success?: undefined }
>;

type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  originalName: string;
  checksum: string;
};

export const getSignedURL = async ({
  fileType,
  fileSize,
  originalName,
  checksum,
}: GetSignedURLParams): SignedURLResponse => {
  console.log("getSignedURL called with params:", { fileType, fileSize, originalName, checksum });

  if (!allowedFileTypes.includes(fileType)) {
    console.error("File type not allowed:", fileType);
    return { failure: "File type not allowed" };
  }

  const fileName = generateFileName(originalName);
  console.log("Generated file name1:", fileName);

  console.log("AWS_BUCKET_REGION1:", process.env.AWS_BUCKET_REGION);
console.log("AWS_ACCESS_KEY1:", process.env.AWS_PROJECT_ACCESS_KEY);
console.log("AWS_SECRET_ACCESS_KEY1:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_BUCKET_NAME1:", process.env.AWS_BUCKET_NAME);


  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
  });

  try {
    console.log("Attempting to get signed URL...");
    const url = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60, // 60 seconds
    });
    console.log("Successfully obtained signed URL:", url);
    return { success: { url, key: fileName } };
  } catch (error) {
    console.error("Error obtaining signed URL:", error);
    return { failure: "Error obtaining signed URL" };
  }
};

export async function createPost({
  content,
  fileId,
}: {
  content: string;
  fileId?: number;
}): Promise<{ failure: string } | undefined> {
  // Add your MongoDB insert logic here
  // For example:
  // await mongodb.collection('posts').insertOne({ content, fileId });

  // For now, just return success for testing purposes
  return undefined;
}
