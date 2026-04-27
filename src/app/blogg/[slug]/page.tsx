import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { normalizeR2ImageUrl } from "@/lib/r2";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return db.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true, image: true } } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.metaTitle || `${post.title} — KKS AS`;
  const description = post.metaDesc || post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/blogg/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/blogg/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      ...(post.image && { images: [{ url: normalizeR2ImageUrl(post.image), width: 1200, height: 630 }] }),
    },
  };
}

function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BloggArtikkelPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const readTime = estimateReadTime(post.content);

  const relatedPosts = await db.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      category: post.category,
      id: { not: post.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      title: true,
      slug: true,
      image: true,
      excerpt: true,
      category: true,
      publishedAt: true,
    },
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${BASE_URL}/blogg/${post.slug}#article`,
    "headline": post.title,
    "description": post.excerpt,
    "url": `${BASE_URL}/blogg/${post.slug}`,
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "inLanguage": "nb",
    "author": {
      "@type": "Person",
      "name": post.author?.name ?? "KKS AS",
      "url": `${BASE_URL}/om-oss`,
      "worksFor": {
        "@type": "Organization",
        "name": "KKS AS",
        "url": BASE_URL,
      },
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "KKS AS",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo-black-kks.png`,
        "width": 200,
        "height": 80,
      },
    },
    ...(post.image && {
      "image": {
        "@type": "ImageObject",
        "url": normalizeR2ImageUrl(post.image),
        "width": 1200,
        "height": 630,
      },
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blogg/${post.slug}`,
    },
    "isPartOf": {
      "@type": "Blog",
      "name": "KKS AS Blogg",
      "url": `${BASE_URL}/blogg`,
    },
    "about": [
      { "@type": "Thing", "name": "HMS-opplæring" },
      { "@type": "Thing", "name": "Sertifisering og kurs" },
      { "@type": "Thing", "name": "Arbeidsmiljø Norge" },
    ],
    "wordCount": Math.ceil(post.content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length),
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/blogg"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake til bloggen
            </Link>
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author?.name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(post.publishedAt, "d. MMMM yyyy", { locale: nb })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readTime} min lesetid
              </span>
            </div>
          </div>
        </section>

        {/* Featured image */}
        {post.image && (
          <section className="container mx-auto px-4 max-w-4xl -mt-6 mb-8 relative z-10">
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={normalizeR2ImageUrl(post.image)}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </section>
        )}

        {/* Content */}
        <article className="container mx-auto px-4 max-w-4xl py-8 md:py-12">
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="border-t bg-muted/30 py-12 md:py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center">
                Relaterte artikler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blogg/${related.slug}`}
                    className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {related.image ? (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={normalizeR2ImageUrl(related.image)}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800" />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Trenger du kurs?</h2>
            <p className="text-muted-foreground mb-6">
              KKS AS tilbyr godkjent opplæring innen truck, kran, stillas, HMS og BHT
              i hele Norge. Se våre ledige kurs og meld deg på i dag.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/kurs"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Se alle kurs
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                Kontakt oss
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
