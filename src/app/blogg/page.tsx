import { db } from "@/lib/db";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Blogg — Fagartikler om kurs, HMS og sikkerhet | KKS AS",
  description:
    "Les fagartikler om truckkurs, krankurs, HMS-opplæring, stillasmontørkurs og sikkerhet på arbeidsplassen. Tips, regelverk og nyheter fra KKS AS.",
  alternates: { canonical: `${BASE_URL}/blogg` },
};

export default async function BloggPage() {
  const posts = await db.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      image: true,
      category: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4">Fagblogg</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kunnskap som gir tryggere arbeidsplasser
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fagartikler om kurs, sertifisering, HMS-regelverk og sikkerhet — skrevet
              av våre erfarne instruktører og rådgivere.
            </p>
          </div>
        </section>

        {/* Category filter */}
        {categories.length > 1 && (
          <section className="border-b">
            <div className="container mx-auto px-4 py-4 flex items-center gap-2 overflow-x-auto">
              <span className="text-sm text-muted-foreground shrink-0">Kategorier:</span>
              {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="shrink-0">
                  {cat}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Ingen artikler publisert ennå</h2>
                <p className="text-muted-foreground">
                  Vi jobber med spennende innhold — kom tilbake snart!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, idx) => (
                  <Link
                    key={post.id}
                    href={`/blogg/${post.slug}`}
                    className={`group block ${idx === 0 ? "md:col-span-2 lg:col-span-2" : ""}`}
                  >
                    <article className="h-full rounded-2xl border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                      {post.image ? (
                        <div className={`relative ${idx === 0 ? "aspect-[2/1]" : "aspect-video"} overflow-hidden`}>
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className={`${idx === 0 ? "aspect-[2/1]" : "aspect-video"} bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 flex items-center justify-center`}>
                          <BookOpen className="h-12 w-12 text-blue-400" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary">{post.category}</Badge>
                          {post.publishedAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(post.publishedAt, "d. MMMM yyyy", { locale: nb })}
                            </span>
                          )}
                        </div>
                        <h2 className={`font-bold mb-2 group-hover:text-primary transition-colors ${idx === 0 ? "text-2xl" : "text-lg"}`}>
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <span className="text-sm font-medium text-primary flex items-center gap-1">
                          Les mer <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
