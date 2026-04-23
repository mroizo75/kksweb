"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const blogPostSchema = z.object({
  title: z.string().min(3, "Tittel må ha minst 3 tegn"),
  slug: z.string().min(3, "Slug må ha minst 3 tegn").regex(/^[a-z0-9-]+$/, "Slug kan bare inneholde a-z, 0-9 og bindestrek"),
  excerpt: z.string().min(10, "Ingress må ha minst 10 tegn"),
  content: z.string().min(20, "Innhold er påkrevd"),
  image: z.string().optional().nullable(),
  category: z.string().min(1, "Kategori er påkrevd"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
});

type BlogPostInput = z.infer<typeof blogPostSchema>;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Ikke autentisert");
  const user = session.user as { id: string; role?: string };
  if (user.role !== "ADMIN") throw new Error("Krever admin-tilgang");
  return user;
}

export async function createBlogPost(input: BlogPostInput) {
  const user = await requireAdmin();
  const data = blogPostSchema.parse(input);

  const existing = await db.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { success: false, error: "Slug er allerede i bruk" };
  }

  const post = await db.blogPost.create({
    data: {
      ...data,
      image: data.image ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDesc: data.metaDesc ?? null,
      authorId: user.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath("/sitemap.xml");

  return { success: true, id: post.id };
}

export async function updateBlogPost(id: string, input: BlogPostInput) {
  await requireAdmin();
  const data = blogPostSchema.parse(input);

  const existing = await db.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) {
    return { success: false, error: "Slug er allerede i bruk" };
  }

  const current = await db.blogPost.findUnique({ where: { id } });
  if (!current) {
    return { success: false, error: "Artikkel ikke funnet" };
  }

  const publishedAt =
    data.status === "PUBLISHED" && !current.publishedAt
      ? new Date()
      : data.status !== "PUBLISHED"
        ? null
        : current.publishedAt;

  await db.blogPost.update({
    where: { id },
    data: {
      ...data,
      image: data.image ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDesc: data.metaDesc ?? null,
      publishedAt,
    },
  });

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${data.slug}`);
  revalidatePath("/sitemap.xml");

  return { success: true };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Artikkel ikke funnet" };

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath("/sitemap.xml");

  return { success: true };
}

export async function toggleBlogPostStatus(id: string) {
  await requireAdmin();

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return { success: false, error: "Artikkel ikke funnet" };

  const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await db.blogPost.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? (post.publishedAt ?? new Date()) : post.publishedAt,
    },
  });

  revalidatePath("/admin/blogg");
  revalidatePath("/blogg");
  revalidatePath(`/blogg/${post.slug}`);
  revalidatePath("/sitemap.xml");

  return { success: true, status: newStatus };
}
