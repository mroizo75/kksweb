import Head from "next/head";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "course";
  schema?: object | object[];
  noindex?: boolean;
}

/**
 * SEO Head Component
 * Automatisk generering av alle SEO meta-tags
 */
export function SEOHead({
  title,
  description,
  canonical,
  ogImage = "/og-image.jpg",
  ogType = "website",
  schema,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = `${title} | KKS Kurs & HMS`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kkskurs.no";
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="KKS AS" />
      <meta property="og:locale" content="nb_NO" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional Meta Tags */}
      <meta name="language" content="Norwegian" />
      <meta name="geo.region" content="NO" />
      <meta name="geo.placename" content="Norge" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              Array.isArray(schema) ? schema : [schema]
            ),
          }}
        />
      )}
    </Head>
  );
}

