import { db } from "@/lib/db";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Eye, Pencil } from "lucide-react";
import { BlogActions } from "./BlogActions";

export default async function AdminBloggPage() {
  const posts = await db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const publishedCount = posts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blogg</h1>
          <p className="text-muted-foreground mt-1">
            {publishedCount} publisert · {draftCount} utkast · {posts.length} totalt
          </p>
        </div>
        <Link href="/admin/blogg/ny">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ny artikkel
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">Ingen artikler ennå</CardTitle>
            <p className="text-muted-foreground mb-6">
              Kom i gang med å skrive din første bloggartikkel.
            </p>
            <Link href="/admin/blogg/ny">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Skriv artikkel
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alle artikler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tittel</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Forfatter</TableHead>
                  <TableHead>Dato</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === "PUBLISHED"
                            ? "default"
                            : post.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {post.status === "PUBLISHED"
                          ? "Publisert"
                          : post.status === "DRAFT"
                            ? "Utkast"
                            : "Arkivert"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.author?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(
                        post.publishedAt ?? post.createdAt,
                        "d. MMM yyyy",
                        { locale: nb },
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === "PUBLISHED" && (
                          <Link href={`/blogg/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" title="Vis">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/blogg/${post.id}`}>
                          <Button variant="ghost" size="icon" title="Rediger">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <BlogActions postId={post.id} status={post.status} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
