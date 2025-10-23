"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courseSchema, type CourseInput } from "@/lib/validations/course";
import { createCourse, updateCourse } from "@/app/actions/createCourse";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Course } from "@prisma/client";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
}

const categories = [
  { value: "truck", label: "Truck" },
  { value: "kran", label: "Kran" },
  { value: "stillas", label: "Stillas" },
  { value: "hms", label: "HMS" },
  { value: "vei", label: "Arbeid på vei" },
  { value: "graving", label: "Graving" },
  { value: "annet", label: "Annet" },
];

// Available course images from /public/courses/
const availableImages = [
  "arbeidsvarsling-for-arbeid-ved-vei-og-pa-vei.png",
  "batproven.png",
  "behandle-og-sikring-av-data.png",
  "brukerkurs-stilas.png",
  "c1-c2-mobilkran.png",
  "diisocynater.png",
  "fallsikringskurs.png",
  "farlig-handverktoy.png",
  "forstehjelp-bygg-og-anlegg.png",
  "forstehjelp-pa-barn.png",
  "forstehjelp-pa-bygg-og-anlegg.png",
  "fse-instruert-personell.png",
  "fse-lav-og-hoyspenning-med-forstehjelp.png",
  "g11-lofteredskap.png",
  "g4traverskran.png",
  "g8lastebilkran.png",
  "grunnkurs-arbeidsmiljo.png",
  "grunnkurs-hms-for-bygg-og-anleggsbransjen.png",
  "grunnkurs-hms.png",
  "grunnleggende-brannvern.png",
  "gwo-arbeid-i-hoyden.png",
  "gwo-brannsikkerhet.png",
  "gwo-forstehjelp.png",
  "gwo-manuelt-arbeid.png",
  "hms-for-ledere.png",
  "hms-kurs-ledere-40-timer-for-verneombud.png",
  "hoy-hastighetsbevis.png",
  "innforing-datasikkerhet.png",
  "innføring-i-hms.png",
  "komplett-forstehjelp-kurs.png",
  "maskin-pr-1.png",
  "maskinforer-m1-m6.png",
  "modul-1.png",
  "obligatorisk-bht-kurs.png",
  "personlofter.png",
  "regelverk-kompetanse.png",
  "sosial-manipulering.png",
  "stilas-2-9-meter.png",
  "stilas-over-9-meter.png",
  "truckforerkurs.png",
  "varme-arbeidere.png",
];

export function CourseDialog({ open, onOpenChange, course }: CourseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      slug: "",
      code: "",
      category: "truck",
      description: "",
      durationDays: 1,
      price: 0,
      image: "",
      published: true,
    },
  });

  // Oppdater form verdier når dialogen åpnes med et kurs
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          title: course.title,
          slug: course.slug,
          code: course.code,
          category: course.category,
          description: course.description || "",
          durationDays: course.durationDays,
          price: course.price,
          image: course.image || "",
          published: course.published,
        });
      } else {
        form.reset({
          title: "",
          slug: "",
          code: "",
          category: "truck",
          description: "",
          durationDays: 1,
          price: 0,
          image: "",
          published: true,
        });
      }
    }
  }, [open, course, form]);

  const onSubmit = async (data: CourseInput) => {
    setIsSubmitting(true);

    try {
      const result = course
        ? await updateCourse(course.id, data)
        : await createCourse(data);

      if (result.success) {
        toast.success(course ? "Kurs oppdatert" : "Kurs opprettet");
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Noe gikk galt");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generer slug fra title
  const handleTitleChange = (title: string) => {
    form.setValue("title", title);
    if (!course) {
      const slug = title
        .toLowerCase()
        .replace(/æ/g, "ae")
        .replace(/ø/g, "o")
        .replace(/å/g, "a")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Rediger kurs" : "Opprett nytt kurs"}</DialogTitle>
          <DialogDescription>
            {course
              ? "Oppdater kursinformasjonen nedenfor"
              : "Fyll inn informasjon om det nye kurset"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kurstittel</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Truckfører kurs - Truck T1-T4"
                      {...field}
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="truck-t1-t4" {...field} />
                    </FormControl>
                    <FormDescription>Brukes i URL-en</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kurskode</FormLabel>
                    <FormControl>
                      <Input placeholder="TRUCK-T1T4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Beskrivelse av kurset..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Varighet (dager)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pris (kr)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kursbilde</FormLabel>
                  <Tabs defaultValue="gallery" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="gallery">Velg fra galleri</TabsTrigger>
                      <TabsTrigger value="manual">Manuell URL</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="gallery" className="space-y-2">
                      <FormDescription>
                        Velg bilde fra /public/courses/ mappen (brukes også i Google Merchant)
                      </FormDescription>
                      {field.value && (
                        <div className="mb-2 p-2 border rounded-md">
                          <p className="text-sm font-medium mb-2">Valgt bilde:</p>
                          <div className="flex items-center gap-2">
                            <img 
                              src={field.value} 
                              alt="Preview" 
                              className="h-16 w-auto rounded object-cover"
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
                        {availableImages.map((imgName) => {
                          const imgPath = `/courses/${imgName}`;
                          const isSelected = field.value === imgPath;
                          return (
                            <button
                              key={imgName}
                              type="button"
                              onClick={() => field.onChange(imgPath)}
                              className={`relative rounded-md overflow-hidden border-2 transition-all hover:border-primary ${
                                isSelected ? "border-primary ring-2 ring-primary" : "border-transparent"
                              }`}
                            >
                              <img
                                src={imgPath}
                                alt={imgName}
                                className="w-full h-24 object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="bg-primary text-white rounded-full p-1">
                                    ✓
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="manual">
                      <FormDescription>
                        Eller lim inn en ekstern bilde-URL
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="/courses/kurs-navn.png eller https://..."
                          {...field}
                        />
                      </FormControl>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Publisert (synlig for kunder)</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Lagrer...
                  </>
                ) : course ? (
                  "Oppdater kurs"
                ) : (
                  "Opprett kurs"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

