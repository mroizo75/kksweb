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
  const bucket = process.env.R2_BUCKET ?? process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2 bucket mangler. Sett R2_BUCKET (eller legacy R2_BUCKET_NAME).");
  }
  return bucket;
}

function getR2Client(): S3Client {
  const explicitEndpoint = process.env.R2_ENDPOINT?.replace(/\/$/, "");
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
    // R2 fungerer stabilt med path-style i mange Node-runtime-miljøer.
    forcePathStyle: true,
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

function getR2PublicBaseUrl(): string {
  const raw =
    process.env.R2_PUBLIC_URL ??
    process.env.R2_PUBLIC_BASE_URL ??
    process.env.R2_CUSTOM_DOMAIN;

  if (!raw) {
    throw new Error(
      "R2 public URL mangler. Sett R2_PUBLIC_URL (evt. R2_PUBLIC_BASE_URL/R2_CUSTOM_DOMAIN)."
    );
  }

  const withProtocol = raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : `https://${raw}`;

  return withProtocol.replace(/\/$/, "");
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
  const publicBaseUrl = getR2PublicBaseUrl();

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
    url: `${publicBaseUrl}/${key}`,
    key,
  };
}

/**
 * Rewrites stale R2 API-endpoint URLs to the configured public URL.
 * Handles URLs saved before R2_PUBLIC_URL was correctly configured.
 */
export function normalizeR2ImageUrl(url: string | null | undefined): string {
  if (!url) return "";

  const r2ApiMatch = url.match(
    /^https?:\/\/[a-f0-9]+\.r2\.cloudflarestorage\.com\/(.+)$/
  );
  if (!r2ApiMatch) return url;

  const publicBaseUrl =
    process.env.R2_PUBLIC_URL ??
    process.env.R2_PUBLIC_BASE_URL ??
    process.env.R2_CUSTOM_DOMAIN;

  if (!publicBaseUrl) return url;

  const base = (
    publicBaseUrl.startsWith("http") ? publicBaseUrl : `https://${publicBaseUrl}`
  ).replace(/\/$/, "");

  let pathAfterEndpoint = r2ApiMatch[1];
  const bucket = process.env.R2_BUCKET ?? process.env.R2_BUCKET_NAME;
  if (bucket && pathAfterEndpoint.startsWith(`${bucket}/`)) {
    pathAfterEndpoint = pathAfterEndpoint.slice(bucket.length + 1);
  }

  return `${base}/${pathAfterEndpoint}`;
}

/**
 * Slett en fil fra Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  const bucket = getR2BucketName();

  const client = getR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
