/**
 * Schema.org Structured Data Generator
 * For maksimal SEO og Google Rich Snippets
 */

import { Course, CourseSession } from "@prisma/client";

const KKS_NAME = "KKS AS";
const KKS_PHONE = "+47 91 54 08 24";
const KKS_EMAIL = "post@kksas.no";

export interface SchemaOrgCourse extends Course {
  sessions?: (CourseSession & { instructor?: { name: string | null } | null })[];
}

/**
 * Generer Course Schema.org markup
 * Dette gjør at kurset vises som rikt kort i Google Search
 */
export function generateCourseSchema(course: SchemaOrgCourse, baseUrl: string) {
  const courseUrl = `${baseUrl}/kurs/${course.slug}`;
  const imageUrl = course.image
    ? course.image.startsWith("http")
      ? course.image
      : `${baseUrl}${course.image}`
    : `${baseUrl}/placeholder-kurs.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description || `${course.title} - Profesjonell kursing fra ${KKS_NAME}`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": KKS_NAME,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": KKS_PHONE,
        "contactType": "customer service",
        "email": KKS_EMAIL,
        "areaServed": "NO",
        "availableLanguage": ["Norwegian"],
      },
    },
    "url": courseUrl,
    "image": imageUrl,
    "courseCode": course.code,
    "hasCourseInstance": course.sessions?.map((session) => ({
      "@type": "CourseInstance",
      "name": `${course.title} - ${new Date(session.startsAt).toLocaleDateString("no-NO")}`,
      "courseMode": "onsite",
      "location": {
        "@type": "Place",
        "name": session.location,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NO",
          "addressLocality": session.location,
        },
      },
      "startDate": session.startsAt.toISOString(),
      "endDate": session.endsAt.toISOString(),
      "instructor":
        session.instructor?.name
          ? {
              "@type": "Person",
              "name": session.instructor.name,
            }
          : undefined,
    })) || [],
    "offers": {
      "@type": "Offer",
      "category": "Paid",
      "price": course.price,
      "priceCurrency": "NOK",
      "availability": "https://schema.org/InStock",
      "url": courseUrl,
      "validFrom": new Date().toISOString(),
    },
    "educationalLevel": "Professional",
    "inLanguage": "no",
    "timeRequired": `P${course.durationDays}D`,
    "coursePrerequisites": "Ingen forutsetninger",
    "educationalCredentialAwarded": {
      "@type": "EducationalOccupationalCredential",
      "name": `${course.title} kompetansebevis`,
      "credentialCategory": "certificate",
    },
  };
}

/**
 * Generer Event Schema for kurssesjon
 * Gjør at sesjonen kan vises i Google Events
 */
export function generateEventSchema(
  course: Course,
  session: CourseSession,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `${course.title} - Kurssesjon`,
    "description": course.description || `${course.title} kurssesjon`,
    "startDate": session.startsAt.toISOString(),
    "endDate": session.endsAt.toISOString(),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": session.location,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NO",
        "addressLocality": session.location,
      },
    },
    "image": course.image
      ? course.image.startsWith("http")
        ? course.image
        : `${baseUrl}${course.image}`
      : `${baseUrl}/placeholder-kurs.jpg`,
    "organizer": {
      "@type": "Organization",
      "name": KKS_NAME,
      "url": baseUrl,
    },
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "NOK",
      "availability":
        session.capacity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      "url": `${baseUrl}/kurs/${course.slug}/pamelding/${session.id}`,
      "validFrom": new Date().toISOString(),
    },
  };
}

/**
 * Generer Organization Schema
 * Vises i Knowledge Graph
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": KKS_NAME,
    "alternateName": "KKS",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 200,
      "height": 60,
    },
    "description":
      "KKS AS er en ledende norsk kurstilbyder innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring. Vi tilbyr sertifisert opplæring i hele Norge med erfarne instruktører.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NO",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": KKS_PHONE,
      "contactType": "customer service",
      "email": KKS_EMAIL,
      "areaServed": "NO",
      "availableLanguage": ["Norwegian"],
    },
    "areaServed": {
      "@type": "Country",
      "name": "Norway",
    },
    "sameAs": [
      "https://www.facebook.com/kursogkompetansesystemer",
      "https://www.linkedin.com/company/kurs-og-kompetansesystemer-as/",
    ],
  };
}

/**
 * Generer FAQ Schema
 * Vises direkte i Google Search
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generer Breadcrumb Schema
 * Vises i søkeresultater
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generer Product Schema for Google Merchant Center
 * Gjør at kurset kan vises i Google Shopping
 */
export function generateProductSchema(course: Course, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": course.title,
    "description": course.description || `${course.title} - Profesjonell kursing`,
    "image": course.image
      ? course.image.startsWith("http")
        ? course.image
        : `${baseUrl}${course.image}`
      : `${baseUrl}/placeholder-kurs.jpg`,
    "sku": course.code,
    "brand": {
      "@type": "Brand",
      "name": KKS_NAME,
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/kurs/${course.slug}`,
      "priceCurrency": "NOK",
      "price": course.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": KKS_NAME,
      },
    },
  };
}

/**
 * Generer WebSite Schema
 * For Google Site Search
 */
export function generateWebSiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": KKS_NAME,
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/kurs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generer LocalBusiness Schema for lokasjonssider
 */
export function generateLocalBusinessSchema(
  baseUrl: string,
  locationSlug: string,
  locationName: string,
  region: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `${KKS_NAME} - Kurs i ${locationName}`,
    "image": `${baseUrl}/logo.png`,
    "url": `${baseUrl}/lokasjon/${locationSlug}`,
    "telephone": KKS_PHONE,
    "email": KKS_EMAIL,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locationName,
      "addressRegion": region,
      "addressCountry": "NO",
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": region,
    },
    "priceRange": "kr kr",
    "openingHours": "Mo-Fr 08:00-16:00",
    "description": `KKS AS tilbyr profesjonell kursing i ${locationName} og ${region}. Truck, kran, stillas, HMS og BHT-kurs med sertifiserte instruktører.`,
    "parentOrganization": {
      "@type": "EducationalOrganization",
      "name": KKS_NAME,
      "url": baseUrl,
    },
  };
}

/**
 * Generer ItemList Schema for kursoversiktsside
 */
export function generateCourseListSchema(
  courses: Array<{ title: string; slug: string; description?: string | null; price: number }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Kursoversikt — KKS AS",
    "description": "Komplett oversikt over alle kurs fra KKS AS innen truck, kran, stillas, HMS og BHT.",
    "url": `${baseUrl}/kurs`,
    "numberOfItems": courses.length,
    "itemListElement": courses.map((course, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Course",
        "name": course.title,
        "url": `${baseUrl}/kurs/${course.slug}`,
        "description": course.description || course.title,
        "provider": {
          "@type": "EducationalOrganization",
          "name": KKS_NAME,
          "url": baseUrl,
        },
        "offers": {
          "@type": "Offer",
          "price": course.price,
          "priceCurrency": "NOK",
          "availability": "https://schema.org/InStock",
        },
      },
    })),
  };
}

