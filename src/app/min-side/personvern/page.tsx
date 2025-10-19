import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, Trash2, FileText, Lock, Info } from "lucide-react";
import { redirect } from "next/navigation";
import { GDPRActions } from "./client";

export default async function PersonvernPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect("/min-side/logg-inn");
  }

  // Hent persondata
  const person = await db.person.findFirst({
    where: { email: session.user.email! },
    include: {
      _count: {
        select: {
          enrollments: true,
          credentials: true,
          assessments: true,
        },
      },
    },
  });

  if (!person) {
    return (
      <div className="p-6">
        <p>Ingen persondata funnet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personvern & GDPR</h1>
        <p className="text-muted-foreground">
          Administrer dine personopplysninger og rettigheter
        </p>
      </div>

      {/* GDPR-rettigheter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Dine rettigheter (GDPR)</CardTitle>
          </div>
          <CardDescription>
            I henhold til personvernforordningen (GDPR) har du følgende rettigheter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-3 p-4 border rounded-lg">
              <Download className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rett til innsyn</h3>
                <p className="text-sm text-muted-foreground">
                  Du har rett til å få kopi av alle dine personopplysninger vi har lagret
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border rounded-lg">
              <FileText className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rett til retting</h3>
                <p className="text-sm text-muted-foreground">
                  Du har rett til å få rettet uriktige eller ufullstendige opplysninger
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border rounded-lg">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rett til sletting</h3>
                <p className="text-sm text-muted-foreground">
                  Du har rett til å få slettet dine personopplysninger under visse vilkår
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border rounded-lg">
              <Lock className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rett til begrensning</h3>
                <p className="text-sm text-muted-foreground">
                  Du har rett til å begrense behandlingen av dine opplysninger
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dine data */}
      <Card>
        <CardHeader>
          <CardTitle>Dine personopplysninger</CardTitle>
          <CardDescription>
            Oversikt over data vi har lagret om deg
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{person._count.enrollments}</div>
              <div className="text-sm text-muted-foreground">Påmeldinger</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{person._count.credentials}</div>
              <div className="text-sm text-muted-foreground">Kompetansebevis</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{person._count.assessments}</div>
              <div className="text-sm text-muted-foreground">Vurderinger</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Navn</span>
              <span className="font-medium">{person.firstName} {person.lastName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">E-post</span>
              <span className="font-medium">{person.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Telefon</span>
              <span className="font-medium">{person.phone || "Ikke angitt"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Adresse</span>
              <span className="font-medium">{person.address || "Ikke angitt"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handlinger */}
      <GDPRActions personId={person.id} />

      {/* Informasjon */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Viktig informasjon</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-blue-800 space-y-2 text-sm">
          <p>
            <strong>Dataansvarlig:</strong> KKS Kurs & HMS AS
          </p>
          <p>
            <strong>Personvernombud:</strong> kontakt@kkskurs.no
          </p>
          <p>
            <strong>Lagringsperiode:</strong> Persondata lagres i 5 år etter siste aktivitet,
            eller så lenge vi er pålagt av lov å oppbevare opplysningene.
          </p>
          <p>
            <strong>Klagerett:</strong> Du har rett til å klage til Datatilsynet hvis du mener
            vi ikke overholder personvernregelverket.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

