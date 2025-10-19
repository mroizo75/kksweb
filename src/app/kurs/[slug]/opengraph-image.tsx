import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

/**
 * Dynamisk Open Graph Image Generator
 * Genererer unike OG-bilder for hvert kurs
 */
// Bruker Node.js runtime for å kunne bruke Prisma
// export const runtime = "edge"; // Fjernet - Edge runtime støtter ikke Prisma
export const alt = "KKS Kurs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({
    where: { slug: params.slug },
  });

  if (!course) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Kurs ikke funnet
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#1a202c",
            }}
          >
            {course.title}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#4a5568",
              marginBottom: "30px",
            }}
          >
            {course.category}
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: 28,
              color: "#667eea",
            }}
          >
            <div>{course.durationDays} dager</div>
            <div>•</div>
            <div>Fra kr {course.price},-</div>
          </div>
          <div
            style={{
              fontSize: 24,
              marginTop: "40px",
              color: "#718096",
              fontWeight: "600",
            }}
          >
              KKS AS
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

