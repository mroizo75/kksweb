import { Suspense } from "react";
import { db } from "@/lib/db";
import { BulkEnrollmentClient } from "./client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Bulk-påmelding | KKS Admin",
  description: "Meld på flere personer til kurs samtidig",
};

async function BulkEnrollmentPage() {
  // Hent alle aktive kurs med sesjoner
  const courses = await db.course.findMany({
    where: {
      published: true,
    },
    include: {
      sessions: {
        where: {
          status: {
            in: ["OPEN"],
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  // Hent alle bedrifter for dropdown
  const companies = await db.company.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      orgNo: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bulk-påmelding</h1>
        <p className="text-muted-foreground">
          Meld på flere personer til kurs samtidig via CSV-import eller manuell input
        </p>
      </div>

      <BulkEnrollmentClient courses={courses} companies={companies} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <BulkEnrollmentPage />
    </Suspense>
  );
}

