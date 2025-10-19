import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  Building2,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Kontakt oss - KKS AS",
  description: "Ta kontakt med KKS AS for spørsmål om kurs, bedriftsløsninger eller samarbeid",
};

const contactInfo = [
  {
    icon: Mail,
    title: "E-post",
    value: "post@kksas.no",
    href: "mailto:post@kksas.no",
  },
  {
    icon: Phone,
    title: "Telefon",
    value: "+47 99 11 29 16",
    href: "tel:+4799112916",
  },
  {
    icon: MapPin,
    title: "Adresse",
    value: "Norge", // Oppdater med faktisk adresse
    href: null,
  },
  {
    icon: Clock,
    title: "Åpningstider",
    value: "Man-Fre: 08:00-16:00",
    href: null,
  },
];

const topics = [
  {
    icon: MessageSquare,
    title: "Generelle henvendelser",
    description: "Spørsmål om kurs, påmelding eller informasjon",
  },
  {
    icon: Building2,
    title: "Bedriftsløsninger",
    description: "Skreddersydde kurs for din bedrift",
  },
  {
    icon: Phone,
    title: "Support",
    description: "Hjelp med påmelding eller tekniske spørsmål",
  },
];

export default function KontaktPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-700 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Kontakt oss
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Vi er her for å hjelpe deg! Ta kontakt for spørsmål om kurs eller samarbeid
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {contactInfo.map((info) => (
              <Card key={info.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  {info.href ? (
                    <a 
                      href={info.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{info.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Topics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send oss en melding</h2>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Kontaktskjema</CardTitle>
                  <CardDescription>
                    Fyll ut skjemaet så tar vi kontakt så snart som mulig
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" action="/api/public/contact" method="POST">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Fornavn *</Label>
                        <Input id="firstName" name="firstName" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Etternavn *</Label>
                        <Input id="lastName" name="lastName" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-post *</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input id="phone" name="phone" type="tel" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Bedrift</Label>
                      <Input id="company" name="company" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Emne *</Label>
                      <Input id="subject" name="subject" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Melding *</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={6}
                        required 
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      Send melding
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Topics & Quick Links */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Hva kan vi hjelpe med?</h2>
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <Card key={topic.title} className="border-2">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <topic.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <Card className="border-2 bg-muted/50">
                <CardHeader>
                  <CardTitle>Nyttige lenker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/kurs">
                    <Button variant="outline" className="w-full justify-start">
                      Se alle kurs
                    </Button>
                  </Link>
                  <Link href="/bedrift">
                    <Button variant="outline" className="w-full justify-start">
                      Kurs for bedrifter
                    </Button>
                  </Link>
                  <Link href="/bht-medlem">
                    <Button variant="outline" className="w-full justify-start">
                      BHT-medlemskap
                    </Button>
                  </Link>
                  <Link href="/om-oss">
                    <Button variant="outline" className="w-full justify-start">
                      Om oss
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Social Media / Contact Options */}
              <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader>
                  <CardTitle>Følg oss</CardTitle>
                  <CardDescription>
                    Hold deg oppdatert med siste nytt fra KKS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {/* Legg til faktiske sosiale medier-lenker */}
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://facebook.com/kkskurs" target="_blank" rel="noopener noreferrer">
                        <span className="sr-only">Facebook</span>
                        📘
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://linkedin.com/company/kkskurs" target="_blank" rel="noopener noreferrer">
                        <span className="sr-only">LinkedIn</span>
                        💼
                      </a>
                    </Button>
                  </div>
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

