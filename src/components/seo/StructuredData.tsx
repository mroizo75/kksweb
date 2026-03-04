interface StructuredDataProps {
  data: object | object[];
}

/**
 * Server-side JSON-LD structured data renderer for Schema.org
 * Rendres av Next.js App Router som del av server HTML
 */
export function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
