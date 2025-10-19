"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { CourseDialog } from "@/components/admin/CourseDialog";
import { deleteCourse } from "@/app/actions/createCourse";
import { toast } from "sonner";
import type { Course } from "@prisma/client";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<(Course & { _count: { sessions: number } })[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/courses");
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      toast.error("Kunne ikke laste kurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette dette kurset?")) return;

    const result = await deleteCourse(id);
    if (result.success) {
      toast.success("Kurs slettet");
      loadCourses();
    } else {
      toast.error(result.error || "Kunne ikke slette kurs");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadCourses();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kurs</h1>
          <p className="text-muted-foreground">
            Administrer kurs i katalogen
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Opprett kurs
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laster kurs...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Ingen kurs opprettet ennå
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Opprett ditt første kurs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant={course.published ? "default" : "outline"}>
                    {course.published ? "Publisert" : "Utkast"}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription>Kurskode: {course.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pris:</span>
                    <span className="font-medium">
                      {course.price === 0 ? "Gratis" : `${course.price.toLocaleString("nb-NO")} kr`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Varighet:</span>
                    <span className="font-medium">
                      {course.durationDays} {course.durationDays === 1 ? "dag" : "dager"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sesjoner:</span>
                    <span className="font-medium">{course._count.sessions}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(course)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rediger
                  </Button>
                  <Link href={`/kurs/${course.slug}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      Forhåndsvis
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        course={selectedCourse}
      />
    </div>
  );
}
