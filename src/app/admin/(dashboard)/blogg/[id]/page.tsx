import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogEditor } from "../BlogEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RedigerArtikkelPage({ params }: Props) {
  const { id } = await params;

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rediger artikkel</h1>
        <p className="text-muted-foreground mt-1">Oppdater innhold og innstillinger</p>
      </div>
      <BlogEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          category: post.category,
          status: post.status,
          metaTitle: post.metaTitle,
          metaDesc: post.metaDesc,
        }}
      />
    </div>
  );
}
