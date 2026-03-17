import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { code: "MISSING_FILE", message: "Ingen fil ble sendt" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { code: "INVALID_TYPE", message: "Kun JPEG, PNG, WebP og GIF er tillatt" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { code: "TOO_LARGE", message: "Filen er for stor (maks 5 MB)" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const slug = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const fileName = `${slug}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { url } = await uploadToR2(buffer, fileName, file.type, "courses");

    return NextResponse.json({ path: url });
  } catch (error) {
    console.error("Feil ved bildeopplasting:", {
      error,
      storageType: process.env.STORAGE_TYPE,
      r2Endpoint: process.env.R2_ENDPOINT,
      r2Bucket: process.env.R2_BUCKET ?? process.env.R2_BUCKET_NAME,
    });
    return NextResponse.json(
      { code: "UPLOAD_FAILED", message: "Opplasting feilet, prøv igjen" },
      { status: 500 }
    );
  }
}
