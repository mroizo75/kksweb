import { db } from "@/lib/db";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ArrowRight, Calendar, BookOpen, ChevronRight } from "lucide-react";
import { normalizeR2ImageUrl } from "@/lib/r2";

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <nav className="mb-6 text-sm text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-400 transition-colors">Hjem</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">Blogg</span>
          </nav>
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Fagblogg
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Kunnskap som gir tryggere arbeidsplasser
            </h1>
            <p className="text-lg text-slate-300">
              Fagartikler om kurs, sertifisering, HMS-regelverk og sikkerhet — skrevet
              av våre erfarne instruktører og rådgivere.
            </p>
          </div>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-medium shrink-0 mr-1">
              Kategori:
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 bg-slate-50"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <section className="py-14 bg-slate-50">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ingen artikler publisert ennå</h2>
              <p className="text-slate-500">Vi jobber med spennende innhold — kom tilbake snart!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, idx) => (
                <Link
                  key={post.id}
                  href={`/blogg/${post.slug}`}
                  className={`group block ${idx === 0 ? "md:col-span-2 lg:col-span-2" : ""}`}
                >
                  <article className="h-full bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-amber-300 hover:shadow-xl transition-all duration-200 flex flex-col">
                    {post.image ? (
                      <div className={`relative overflow-hidden ${idx === 0 ? "aspect-[2/1]" : "aspect-video"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeR2ImageUrl(post.image)}
                          alt={post.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className={`${idx === 0 ? "aspect-[2/1]" : "aspect-video"} bg-slate-100 flex items-center justify-center`}>
                        <BookOpen className="h-10 w-10 text-slate-300" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {post.category}
                        </span>
                        {post.publishedAt && (
                          <span className="shrink-0 text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(post.publishedAt, "d. MMMM yyyy", { locale: nb })}
                          </span>
                        )}
                      </div>
                      <h2 className={`font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors leading-snug ${idx === 0 ? "text-2xl" : "text-lg"}`}>
                        {post.title}
                      </h2>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <span className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
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

      <Footer />
    </div>
  );
}
