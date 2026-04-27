import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EnrollmentWizard } from "@/components/EnrollmentWizard";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { parseCourseBookingAddOns } from "@/lib/booking-add-ons";
import { normalizeR2ImageUrl } from "@/lib/r2";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Button } from "@/components/ui/button";

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
    select: {
      id: true,
      startsAt: true,
      location: true,
      capacity: true,
      course: {
        select: {
          title: true,
          slug: true,
          price: true,
          bookingAddOns: true,
        },
      },
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Top bar */}
      <div className="bg-slate-950 pt-20 pb-8">
        <div className="container mx-auto px-4">
          <Link
            href={`/kurs/${params.slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til kurset
          </Link>
          <h1 className="text-2xl font-bold text-white">{session.course.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {format(session.startsAt, "EEEE d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {session.location}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isFull ? (
          <div className="max-w-xl mx-auto text-center bg-slate-50 rounded-2xl border border-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Dette kurset er fullt</h2>
            <p className="text-slate-500 mb-6">
              Ingen ledige plasser på dette kurset. Du kan prøve en annen dato eller kontakte oss for å bli satt på venteliste.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/kurs/${params.slug}`}>
                <Button variant="outline" className="border-slate-300 text-slate-700 w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Se andre datoer
                </Button>
              </Link>
              <a href="mailto:post@kksas.no">
                <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold w-full sm:w-auto">
                  Be om ventelisteplass
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <EnrollmentWizard
            sessionId={session.id}
            courseName={session.course.title}
            courseDate={format(session.startsAt, "EEEE d. MMMM yyyy 'kl.' HH:mm", { locale: nb })}
            location={session.location}
            basePrice={session.course.price}
            bookingAddOns={parseCourseBookingAddOns(
              (session.course as { bookingAddOns?: unknown }).bookingAddOns
            ).map((addOn) => ({
              ...addOn,
              image: normalizeR2ImageUrl(addOn.image),
            }))}
            rawAddOnConfigs={(session.course as { bookingAddOns?: unknown }).bookingAddOns}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
