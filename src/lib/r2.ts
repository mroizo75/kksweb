import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2-konfigurasjon mangler (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Last opp en fil til Cloudflare R2 og returner offentlig URL
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder = "uploads"
): Promise<UploadResult> {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!bucket) throw new Error("R2_BUCKET_NAME er ikke satt");
  if (!publicUrl) throw new Error("R2_PUBLIC_URL er ikke satt");

  const key = `${folder}/${fileName}`;
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    url: `${publicUrl}/${key}`,
    key,
  };
}

/**
 * Slett en fil fra Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME er ikke satt");

  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
