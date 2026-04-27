"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createBlogPost, updateBlogPost } from "@/app/actions/admin/blog";
import { toast } from "sonner";
import { Loader2, Upload, X, Image as ImageIcon, ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "HMS",
  "Truckkurs",
  "Krankurs",
  "Stillas",
  "Sertifisering",
  "Sikkerhet",
  "Regelverk",
  "Tips & Råd",
  "Nyhet",
];

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  status: string;
  metaTitle: string | null;
  metaDesc: string | null;
}

interface BlogEditorProps {
  post?: BlogPostData;
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(post?.metaDesc ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/æ/g, "ae")
      .replace(/ø/g, "o")
      .replace(/å/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing || slug === generateSlug(post?.title ?? "")) {
      setSlug(generateSlug(value));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-blog", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
        toast.success("Bilde lastet opp");
      } else {
        toast.error(data.message ?? "Opplasting feilet");
      }
    } catch {
      toast.error("Kunne ikke laste opp bilde");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim() || !category) {
      toast.error("Fyll ut alle påkrevde felter (tittel, slug, ingress, innhold og kategori)");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      image: image || null,
      category,
      status,
      metaTitle: metaTitle.trim() || null,
      metaDesc: metaDesc.trim() || null,
    };

    try {
      const result = isEditing
        ? await updateBlogPost(post.id, payload)
        : await createBlogPost(payload);

      if (result.success) {
        toast.success(
          status === "PUBLISHED" ? "Artikkel publisert!" : "Utkast lagret",
        );
        router.push("/admin/blogg");
        router.refresh();
      } else {
        toast.error(result.error ?? "Noe gikk galt");
      }
    } catch {
      toast.error("En feil oppstod");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Link href="/admin/blogg">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <CardTitle>Innhold</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tittel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="F.eks. Alt du trenger å vite om trucksertifikat T1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL-slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/blogg/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="alt-du-trenger-vite-trucksertifikat-t1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ingress / Sammendrag *</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Kort beskrivelse som vises i artikkeloversikten og søkeresultater..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{excerpt.length}/300 tegn</p>
            </div>

            <div className="space-y-2">
              <Label>Innhold *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Skriv artikkelen din her..."
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="text-base">SEO-innstillinger</CardTitle>
              <span className="text-sm text-muted-foreground">{showSeo ? "Skjul" : "Vis"}</span>
            </button>
          </CardHeader>
          {showSeo && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta-tittel (valgfri)</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Overstyrer standard tittel i søkeresultater"
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 tegn — {metaTitle.length > 60 ? "for lang!" : "OK"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta-beskrivelse (valgfri)</Label>
                <Textarea
                  id="metaDesc"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  placeholder="Overstyrer ingress i søkeresultater"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDesc.length}/160 tegn — {metaDesc.length > 160 ? "for lang!" : "OK"}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publisering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => handleSave("PUBLISHED")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Oppdater og publiser" : "Publiser"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSave("DRAFT")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lagre som utkast
            </Button>
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kategori *</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Velg kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hovedbilde</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {image ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Hovedbilde"
                  className="object-cover w-full h-full"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setImage("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last opp bilde</span>
                  </>
                )}
              </button>
            )}
            {image && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Laster opp..." : "Bytt bilde"}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
