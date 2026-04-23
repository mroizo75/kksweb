import { BlogEditor } from "../BlogEditor";

export default function NyArtikkelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ny artikkel</h1>
        <p className="text-muted-foreground mt-1">Skriv og publiser en ny bloggartikkel</p>
      </div>
      <BlogEditor />
    </div>
  );
}
