"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/min-side";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Ugyldig e-post eller passord");
        setLoading(false);
      } else if (result?.ok) {
        toast.success("Innlogget!");
        window.location.href = callbackUrl;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Noe gikk galt. Prøv igjen.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Logg inn</CardTitle>
              <CardDescription>
                Logg inn for å se dine kurspåmeldinger og kompetansebevis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="din@epost.no"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Passord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ditt passord"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Logg inn
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Har du ikke tilgang?{" "}
                  <a href="mailto:kurs@kkskurs.no" className="text-primary hover:underline">
                    Kontakt oss
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2">Tips:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Bruk samme e-post som du er påmeldt kurs med</li>
              <li>Kontakt oss hvis du ikke har mottatt innloggingsdetaljer</li>
              <li>Admin-brukere logger inn via /admin/login</li>
            </ul>
          </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <Suspense fallback={
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Logg inn</CardTitle>
                <CardDescription>Laster...</CardDescription>
              </CardHeader>
            </Card>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

