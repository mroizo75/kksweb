import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EnrollmentWizard } from "@/components/EnrollmentWizard";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
    sessionId: string;
  }>;
}

export default async function EnrollmentPage(props: PageProps) {
  const params = await props.params;
  const session = await db.courseSession.findUnique({
    where: { id: params.sessionId },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: {
            where: {
              status: { in: ["PENDING", "CONFIRMED", "ATTENDED"] },
            },
          },
        },
      },
    },
  });

  if (!session || session.course.slug !== params.slug) {
    notFound();
  }

  const availableSpots = session.capacity - session._count.enrollments;
  const isFull = availableSpots <= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/kurs/${params.slug}`}
            className="inline-flex items-center text-sm hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til kurset
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {isFull ? (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Dette kurset er fullt</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Dessverre er det ingen ledige plasser på dette kurset. Du kan prøve
              en annen dato eller kontakte oss for å bli satt på venteliste.
            </p>
            <Link
              href={`/kurs/${params.slug}`}
              className="inline-flex items-center text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Se andre datoer
            </Link>
          </div>
        ) : (
          <EnrollmentWizard
            sessionId={session.id}
            courseName={session.course.title}
            courseDate={format(session.startsAt, "EEEE d. MMMM yyyy 'kl.' HH:mm", {
              locale: nb,
            })}
            location={session.location}
          />
        )}
      </div>
    </div>
  );
}

