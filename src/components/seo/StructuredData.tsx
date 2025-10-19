"use client";

interface StructuredDataProps {
  data: object | object[];
}

/**
 * Structured Data Component
 * Rendrer Schema.org JSON-LD
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]),
      }}
    />
  );
}

