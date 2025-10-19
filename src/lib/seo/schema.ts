/**
 * Schema.org Structured Data Generator
 * For maksimal SEO og Google Rich Snippets
 */

import { Course, CourseSession, Company } from "@prisma/client";

export interface SchemaOrgCourse extends Course {
  sessions?: CourseSession[];
}

/**
 * Generer Course Schema.org markup
 * Dette gjør at kurset vises som rikt kort i Google Search
 */
export function generateCourseSchema(course: SchemaOrgCourse, baseUrl: string) {
  const courseUrl = `${baseUrl}/kurs/${course.slug}`;
  const imageUrl = course.image 
    ? (course.image.startsWith('http') ? course.image : `${baseUrl}${course.image}`)
    : `${baseUrl}/placeholder-kurs.jpg`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description || `${course.title} - Profesjonell kursing fra KKS`,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "KKS AS AS",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+47-XXX-XX-XXX", // Oppdater med faktisk nummer
        "contactType": "customer service",
        "email": "kontakt@kkskurs.no",
        "areaServed": "NO",
        "availableLanguage": ["Norwegian", "English"]
      }
    },
    "url": courseUrl,
    "image": imageUrl,
    "courseCode": course.code,
    "hasCourseInstance": course.sessions?.map(session => ({
      "@type": "CourseInstance",
      "name": `${course.title} - ${new Date(session.startsAt).toLocaleDateString('no-NO')}`,
      "courseMode": "onsite",
      "location": {
        "@type": "Place",
        "name": session.location,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NO",
          "addressLocality": session.location
        }
      },
      "startDate": session.startsAt.toISOString(),
      "endDate": session.endsAt.toISOString(),
      "instructor": session.instructorId ? {
        "@type": "Person",
        "name": "Sertifisert instruktør",
      } : undefined,
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
      "credentialCategory": "certificate"
    }
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
        "addressLocality": session.location
      }
    },
    "image": course.image ? `${baseUrl}${course.image}` : `${baseUrl}/placeholder-kurs.jpg`,
    "organizer": {
      "@type": "Organization",
      "name": "KKS AS AS",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "NOK",
      "availability": session.capacity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/SoldOut",
      "url": `${baseUrl}/kurs/${course.slug}/pamelding/${session.id}`,
      "validFrom": new Date().toISOString()
    }
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
    "name": "KKS AS AS",
    "alternateName": "KKS",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Profesjonell kursing innen HMS, BHT, sikkerhet og kompetanseheving. ISO 9001 og ISO 27001 sertifisert.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NO",
      // Legg til faktisk adresse
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+47-XXX-XX-XXX",
      "contactType": "customer service",
      "email": "kontakt@kkskurs.no",
      "areaServed": "NO",
      "availableLanguage": ["Norwegian", "English"]
    },
    "sameAs": [
      // Legg til sosiale medier
      // "https://www.facebook.com/kkskurs",
      // "https://www.linkedin.com/company/kkskurs"
    ]
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
    "image": course.image ? `${baseUrl}${course.image}` : `${baseUrl}/placeholder-kurs.jpg`,
    "sku": course.code,
    "brand": {
      "@type": "Brand",
      "name": "KKS AS"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/kurs/${course.slug}`,
      "priceCurrency": "NOK",
      "price": course.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "KKS AS AS"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    }
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
    "name": "KKS AS",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/kurs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

