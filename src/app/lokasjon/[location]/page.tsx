import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface PageProps {
  params: Promise<{ location: string }>;
}

// Støttede lokasjoner med metadata
const locations = {
  "oslo": {
    name: "Oslo",
    region: "Oslo og Akershus",
    description: "Profesjonell kursvirksomhet i hovedstaden",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs oslo, maskinførerkurs oslo, truckfører oslo, kranfører oslo, HMS kurs oslo",
    heroText: "Profesjonelle kurs i Oslo og Akershus",
    about: "KKS AS tilbyr et bredt spekter av profesjonelle kurs i Oslo-området. Med over 10 års erfaring og sertifiserte instruktører, er vi din foretrukne partner for truck-, kran-, stillas- og HMS-opplæring i hovedstaden. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Erfarne lokale instruktører",
      "Moderne utstyr og fasiliteter",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  "bergen": {
    name: "Bergen",
    region: "Bergen og Vestland",
    description: "Kurs og kompetanse på Vestlandet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs bergen, maskinførerkurs bergen, truckfører bergen, kranfører bergen, HMS kurs bergen",
    heroText: "Profesjonelle kurs i Bergen og Vestland",
    about: "KKS AS er din lokale kursleverandør i Bergen og på Vestlandet. Vi tilbyr sertifisert opplæring innen truck, kran, stillas og HMS med fokus på sikkerhet og kvalitet. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokalkunnskap i Bergen-området",
      "Erfarne vestlandsinstruktører",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  "trondheim": {
    name: "Trondheim",
    region: "Trondheim og Trøndelag",
    description: "Kvalitetskurs i Midt-Norge",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs trondheim, maskinførerkurs trondheim, truckfører trondheim, kranfører trondheim",
    heroText: "Profesjonelle kurs i Trondheim og Trøndelag",
    about: "I Trondheim og Trøndelag tilbyr KKS AS komplett opplæring innen maskinføring, HMS og sikkerhet. Våre instruktører har lang erfaring fra regionen og kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokale instruktører fra Trøndelag",
      "Tilpasset lokale forhold",
      "Fleksible kurstider og lokasjoner",
      "Spar tid - vi kommer til dere",
    ],
  },
  "stavanger": {
    name: "Stavanger",
    region: "Stavanger og Rogaland",
    description: "Profesjonell opplæring i Rogaland",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs stavanger, maskinførerkurs stavanger, truckfører stavanger, kranfører stavanger",
    heroText: "Profesjonelle kurs i Stavanger og Rogaland",
    about: "KKS AS leverer førsteklasses opplæring i Stavanger og Rogaland-området. Med spesialkompetanse innen offshore-relaterte kurs og tradisjonell maskinføring. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Erfaring med offshore-industrien",
      "Lokale instruktører",
      "Tilpasset Rogalands næringsliv",
      "Rask oppstart og fleksibilitet",
    ],
  },
  "kristiansand": {
    name: "Kristiansand",
    region: "Kristiansand og Agder",
    description: "Kurs og HMS i Sørlandet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs kristiansand, maskinførerkurs kristiansand, truckfører kristiansand",
    heroText: "Profesjonelle kurs i Kristiansand og Agder",
    about: "På Sørlandet tilbyr KKS AS komplett kursportefølje for bedrifter og privatpersoner. Sertifisert opplæring med fokus på sikkerhet. Vi kommer gjerne ut til din bedrift.",
    benefits: [
      "Vi kommer til din bedrift",
      "Lokale instruktører fra Agder",
      "Moderne utstyr",
      "Fleksible kurstider og lokasjoner",
      "God oppfølging",
    ],
  },
  "tromso": {
    name: "Tromsø",
    region: "Tromsø og Nord-Norge",
    description: "Nordnorsk kompetanse og kvalitet",
    phone: "+47 91 54 08 24",
    email: "post@kksas.no",
    keywords: "kurs tromsø, maskinførerkurs tromsø, truckfører tromsø, nord-norge",
    heroText: "Profesjonelle kurs i Tromsø og Nord-Norge",
    about: "KKS AS tilbyr profesjonell opplæring i Tromsø og Nord-Norge. Våre instruktører har erfaring med nordnorske forhold og værforhold. Vi kommer gjerne ut til din bedrift.",
    benefits:[
      "Vi kommer til din bedrift",
      "Tilpasset nordnorske forhold",
      "Erfarne instruktører",
      "Vinteropplæring",
      "Fleksible kurstider og lokasjoner",
    ],
  },
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const location = locations[params.location as keyof typeof locations];

  if (!location) {
    return {
      title: "Lokasjon ikke funnet",
    };
  }

  return {
    title: `Kurs i ${location.name} - Truck, Kran, Stillas, HMS | KKS AS`,
    description: `${location.about.substring(0, 155)}`,
    keywords: location.keywords,
    openGraph: {
      title: `Kurs i ${location.name} - KKS AS`,
      description: location.description,
      url: `https://www.kksas.no/lokasjon/${params.location}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(locations).map((location) => ({
    location,
  }));
}

export default async function LocationPage(props: PageProps) {
  const params = await props.params;
  const location = locations[params.location as keyof typeof locations];

  if (!location) {
    notFound();
  }

  // Hent kommende sesjoner (kan filtreres på lokasjon senere)
  const sessions = await db.courseSession.findMany({
    where: {
      startsAt: { gte: new Date() },
      status: "OPEN",
    },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          category: true,
          price: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
    take: 6,
  });

  // Hent alle kurs for visning
  const courses = await db.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      description: true,
      price: true,
      image: true,
    },
    take: 8,
  });

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <MapPin className="h-3 w-3 mr-1" />
              {location.region}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kurs i {location.name}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {location.heroText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
                <a href="#kurs">
                  Se våre kurs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <a href="#kontakt">
                  Kontakt oss
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Om KKS AS i {location.name}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              {location.about}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {location.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p>{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="kurs" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Våre kurs i {location.name}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                {course.image && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {course.category}
                  </Badge>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description?.substring(0, 80)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      {course.price === 0 ? "Gratis" : `${course.price.toLocaleString("nb-NO")} kr`}
                    </span>
                  </div>
                  <Link href={`/kurs/${course.slug}`}>
                    <Button className="w-full mt-4">
                      Les mer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/kurs">
                Se alle kurs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Sessions */}
      {sessions.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Kommende kursdatoer
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.course.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(session.startsAt, "EEEE d. MMMM yyyy", { locale: nb })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/kurs/${session.course.slug}/pamelding/${session.id}`}>
                      <Button className="w-full">
                        Meld deg på
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="kontakt" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">
                  Kontakt oss i {location.name}
                </CardTitle>
                <CardDescription className="text-lg">
                  Har du spørsmål om våre kurs i {location.name}? Vi hjelper deg gjerne!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <a href={`tel:${location.phone}`} className="text-primary hover:underline">
                        {location.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-post</p>
                      <a href={`mailto:${location.email}`} className="text-primary hover:underline">
                        {location.email}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" asChild>
                    <Link href="/kontakt">
                      Send melding
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" asChild>
                    <Link href="/bedrift">
                      Bedriftsavtale
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Ofte stilte spørsmål i {location.name}
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Hvor holder dere kurs i {location.name}?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Vi kommer gjerne ut til din bedrift hvis dere har egnede lokaler. Hvis ikke, leier vi et kurslokale i nærheten av deres adresse i {location.region}.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Hvor lang tid tar et typisk kurs?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Kurslengden varierer fra 1-5 dager avhengig av kurstype. Se kursoversikten for detaljer.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Tilbyr dere bedriftsavtaler i {location.name}?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ja! Vi tilbyr skreddersydde løsninger for bedrifter i {location.region}. Kontakt oss for tilbud.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

