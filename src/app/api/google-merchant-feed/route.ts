import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Google Merchant Center Product Feed
 * Automatisk feed av alle kurs til Google Shopping
 * 
 * URL: https://www.kksas.no/api/google-merchant-feed
 * Format: RSS 2.0 XML
 * Oppdateres: Dynamisk (hver gang Google fetcher)
 */
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";
    
    // Hent alle publiserte kurs med sesjoner
    const courses = await db.course.findMany({
      where: { published: true },
      include: {
        sessions: {
          where: {
            status: "OPEN",
            startsAt: { gte: new Date() },
          },
          take: 1, // Ta først kommende sesjon
        },
      },
    });

    // Generer produkter
    const items = courses.map((course) => {
      const hasAvailableSessions = course.sessions.length > 0;
      const imageUrl = course.image 
        ? course.image.startsWith('http') 
          ? course.image 
          : `${baseUrl}${course.image}`
        : `${baseUrl}/default-course.jpg`;

      return {
        id: course.id,
        title: course.title.substring(0, 150), // Max 150 chars
        description: (course.description || "Profesjonelt kurs fra KKS AS").substring(0, 5000),
        link: `${baseUrl}/kurs/${course.slug}`,
        image_link: imageUrl,
        price: `${course.price} NOK`,
        availability: hasAvailableSessions ? "in stock" : "out of stock",
        condition: "new",
        brand: "KKS AS",
        mpn: course.code || course.id, // Manufacturer Part Number (kurskode)
        product_type: getCategoryName(course.category),
        google_product_category: "469", // Education > Training & Instruction
      };
    });

    // Generer XML feed (Google Shopping format)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>KKS AS - Kurs og Kompetansesystemer</title>
    <link>${baseUrl}</link>
    <description>Profesjonelle kurs innen truck, kran, stillas, HMS og mer fra KKS AS</description>
    ${items
      .map(
        (item) => `
    <item>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.description)}</g:description>
      <g:link>${escapeXml(item.link)}</g:link>
      <g:image_link>${escapeXml(item.image_link)}</g:image_link>
      <g:price>${escapeXml(item.price)}</g:price>
      <g:availability>${item.availability}</g:availability>
      <g:condition>${item.condition}</g:condition>
      <g:brand>${item.brand}</g:brand>
      <g:mpn>${escapeXml(item.mpn)}</g:mpn>
      <g:product_type>${escapeXml(item.product_type)}</g:product_type>
      <g:google_product_category>${item.google_product_category}</g:google_product_category>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating merchant feed:", error);
    return NextResponse.json(
      { error: "Failed to generate product feed" },
      { status: 500 }
    );
  }
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Map category to readable product type
 */
function getCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    truck: "Truckfører Kurs",
    kran: "Kranfører Kurs",
    stillas: "Stillas Kurs",
    hms: "HMS Kurs",
    vei: "Arbeid på Vei Kurs",
    graving: "Graving Kurs",
    annet: "Annet Kurs",
  };
  return categoryMap[category] || "Profesjonelt Kurs";
}

