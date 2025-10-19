import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProfileEditForm } from "@/components/public/ProfileEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Min profil | KKS AS",
  description: "Rediger din profilinformasjon",
};

async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/min-side/logg-inn");
  }

  const person = await db.person.findFirst({
    where: { email: session.user.email },
    include: {
      company: true,
    },
  });

  if (!person) {
    redirect("/min-side");
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/min-side">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Min profil</h1>
              <p className="text-muted-foreground">
                Oppdater din kontaktinformasjon
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personlig informasjon</CardTitle>
              <CardDescription>
                Hold informasjonen din oppdatert så vi kan kontakte deg ved behov
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm person={person} />
            </CardContent>
          </Card>

          {person.company && (
            <Card>
              <CardHeader>
                <CardTitle>Bedrift</CardTitle>
                <CardDescription>
                  Din bedriftsinformasjon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Bedriftsnavn</p>
                    <p className="text-sm text-muted-foreground">{person.company.name}</p>
                  </div>
                  {person.company.orgNo && (
                    <div>
                      <p className="text-sm font-medium">Org.nr</p>
                      <p className="text-sm text-muted-foreground">{person.company.orgNo}</p>
                    </div>
                  )}
                  {person.company.email && (
                    <div>
                      <p className="text-sm font-medium">E-post</p>
                      <p className="text-sm text-muted-foreground">{person.company.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;

