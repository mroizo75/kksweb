import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

function parseAccountIdFromEndpoint(endpoint?: string): string | null {
  if (!endpoint) return null;

  try {
    const url = new URL(endpoint);
    const host = url.hostname;
    const suffix = ".r2.cloudflarestorage.com";
    if (!host.endsWith(suffix)) {
      return null;
    }
    return host.slice(0, -suffix.length) || null;
  } catch {
    return null;
  }
}

function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME ?? process.env.R2_BUCKET;
  if (!bucket) {
    throw new Error("R2 bucket mangler. Sett R2_BUCKET_NAME (eller legacy R2_BUCKET).");
  }
  return bucket;
}

function getR2Client(): S3Client {
  const explicitEndpoint = process.env.R2_ENDPOINT;
  const accountId =
    process.env.R2_ACCOUNT_ID ?? parseAccountIdFromEndpoint(explicitEndpoint);
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2-konfigurasjon mangler. Krever R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY og enten R2_ACCOUNT_ID eller R2_ENDPOINT."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint:
      explicitEndpoint ?? `https://${accountId}.r2.cloudflarestorage.com`,
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
  const bucket = getR2BucketName();
  const endpoint =
    process.env.R2_ENDPOINT ??
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined);
  const publicUrl = (
    process.env.R2_PUBLIC_URL ?? (endpoint ? `${endpoint}/${bucket}` : undefined)
  )?.replace(/\/$/, "");

  if (!publicUrl) {
    throw new Error(
      "R2 public URL mangler. Sett R2_PUBLIC_URL (evt. R2_ENDPOINT + bucket)."
    );
  }

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
  const bucket = getR2BucketName();

  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
