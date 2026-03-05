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
 * Vises i Knowledge Graph og brukes av AI-systemer for entity-forståelse
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${baseUrl}/#organization`,
    "name": KKS_NAME,
    "alternateName": ["KKS", "Kurs og Kompetansesystemer AS"],
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 200,
      "height": 60,
    },
    "description":
      "KKS AS (Kurs og Kompetansesystemer AS) er en ISO 9001- og ISO 27001-sertifisert norsk kursleverandør godkjent av Arbeidstilsynet. Vi tilbyr truck-, kran-, stillas-, arbeid på vei-, HMS- og BHT-opplæring i hele Norge med sertifiserte instruktører.",
    "foundingDate": "2020",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NO",
      "addressRegion": "Norge",
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": KKS_PHONE,
        "contactType": "customer service",
        "email": KKS_EMAIL,
        "areaServed": "NO",
        "availableLanguage": ["Norwegian"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "08:00",
          "closes": "16:00",
        },
      },
      {
        "@type": "ContactPoint",
        "telephone": "+47 99 11 29 16",
        "contactType": "technical support",
        "email": KKS_EMAIL,
        "areaServed": "NO",
      },
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Norway",
    },
    "knowsAbout": [
      "Truckkurs og truckfører-sertifisering",
      "Krankurs og kranfører-sertifisering",
      "Stillasmontørkurs og stillasopplæring",
      "HMS-opplæring og grunnkurs HMS",
      "Arbeid på vei og vegopplæring",
      "BHT-opplæring og bedriftshelsepersonell",
      "Maskinførerkurs og maskinoperatøropplæring",
      "Arbeidsmiljølov og Arbeidstilsynets krav",
      "ISO 9001 kvalitetsledelse",
      "Sertifisering av arbeidsoperatører i Norge",
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Kurskatalog KKS AS",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Truckfører kurs (T1-T8)" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Kranfører kurs (G4, G8, G11)" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Stillasbruker og stillasmontørkurs" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "HMS grunnkurs og verneombud" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Arbeid på vei og arbeidsvarslingskurs" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "BHT obligatorisk kurs" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Maskinføreropplæring (M1-M6)" } },
        { "@type": "Offer", "itemOffered": { "@type": "Course", "name": "Personløfter og fallsikringskurs" } },
      ],
    },
    "award": [
      "ISO 9001:2015 — Kvalitetsledelsessystem",
      "ISO 27001:2013 — Informasjonssikkerhet",
      "Godkjent kursleverandør av Arbeidstilsynet",
    ],
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
 * Generer HowTo Schema — vises i AI-svar og Google Featured Snippets
 * Brukes for å forklare påmeldingsprosessen
 */
export function generateHowToSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Slik melder du deg på kurs hos KKS AS",
    "description": "Steg-for-steg guide for å melde deg på et kurs hos KKS AS. Fra å finne riktig kurs til å motta ditt kompetansebevis.",
    "totalTime": "PT10M",
    "tool": [
      { "@type": "HowToTool", "name": "Internett-tilgang" },
      { "@type": "HowToTool", "name": "E-postadresse" },
    ],
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Finn riktig kurs",
        "text": "Gå til kursoversikten på kksas.no og velg kurstype (truck, kran, stillas, HMS, arbeid på vei eller BHT). Filtrer på kategori for å finne akkurat det kurset du trenger.",
        "url": `${baseUrl}/kurs`,
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Velg dato og sted",
        "text": "Klikk på ønsket kurs og velg en kursdato fra listen over kommende sesjoner. Vi har kurs i Oslo, Bergen, Trondheim, Stavanger og ellers i hele Norge.",
        "url": `${baseUrl}/kurs`,
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Fyll ut påmeldingsskjema",
        "text": "Fyll ut ditt navn, e-postadresse og eventuell bedrift i påmeldingsskjemaet. For bedrifter kan vi fakturere direkte.",
        "url": `${baseUrl}/kurs`,
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Motta bekreftelse",
        "text": "Du mottar en bekreftelse på e-post med kursinformasjon, adresse og eventuelle forberedelser.",
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Gjennomfør kurset og få kompetansebevis",
        "text": "Etter bestått kurs mottar du et offisielt kompetansebevis fra KKS AS. Beviset er godkjent av Arbeidstilsynet og dokumenterer din sertifisering.",
      },
    ],
  };
}

/**
 * Generer Speakable Schema — markerer innhold som AI-assistenter og voice search kan sitere
 */
export function generateSpeakableSchema(cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": cssSelectors,
    },
  };
}

/**
 * Generer DefinedTerm Schema — forklarer bransjebegreper for AI-systemer
 */
export function generateDefinedTermSchema(
  terms: Array<{ name: string; description: string }>
) {
  return terms.map((term) => ({
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.name,
    "description": term.description,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Kursvilkår og sertifiseringer — KKS AS",
    },
  }));
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

