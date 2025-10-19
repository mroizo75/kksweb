"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Key, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { check2FARequired, verify2FALogin } from "@/app/actions/auth/verify-2fa-login";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sjekk om 2FA er påkrevd
      const result = await check2FARequired(email, password);

      if (!result.success) {
        toast.error(result.error || "Ugyldig e-post eller passord");
        setIsLoading(false);
        return;
      }

      if (result.requires2FA) {
        // Gå til 2FA-steg
        setStep("2fa");
        setIsLoading(false);
      } else {
        // Ingen 2FA - logg inn direkte
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error("Ugyldig e-post eller passord");
        } else {
          const from = searchParams.get("from") || "/admin/dashboard";
          router.push(from);
          router.refresh();
        }
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("En feil oppstod under innlogging");
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (twoFactorToken.length !== 6 && twoFactorToken.length !== 9) {
      toast.error("Oppgi en 6-sifret kode eller backup-kode");
      return;
    }

    setIsLoading(true);

    try {
      const result = await verify2FALogin(email, password, twoFactorToken);

      if (result.success && result.user) {
        // 2FA verifisert - logg inn
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error("En feil oppstod");
        } else {
          if (result.usedBackupCode) {
            toast.success(
              `Innlogget med backup-kode. ${result.backupCodesRemaining} koder gjenstår.`
            );
          } else {
            toast.success("Innlogget!");
          }

          const from = searchParams.get("from") || "/admin/dashboard";
          router.push(from);
          router.refresh();
        }
      } else {
        toast.error(result.error || "Ugyldig 2FA-kode");
      }
    } catch (error) {
      toast.error("En feil oppstod under verifisering");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setTwoFactorToken("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Tilbake til forsiden */}
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tilbake til forsiden
          </Button>
        </Link>

        <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {step === "credentials" ? (
              <ShieldCheck className="h-6 w-6 text-primary" />
            ) : (
              <Key className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {step === "credentials" ? "Admin-innlogging" : "To-faktor autentisering"}
          </CardTitle>
          <CardDescription>
            {step === "credentials"
              ? "Logg inn for å administrere kurssystemet"
              : "Oppgi 6-sifret kode fra autentiserings-appen"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kkskurs.no"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifiserer...
                  </>
                ) : (
                  "Fortsett"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Oppgi koden fra Google Authenticator eller en backup-kode
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="token">2FA-kode</Label>
                <Input
                  id="token"
                  value={twoFactorToken}
                  onChange={(e) =>
                    setTwoFactorToken(e.target.value.replace(/[^0-9-]/g, "").slice(0, 9))
                  }
                  placeholder="000000 eller XXXX-XXXX"
                  maxLength={9}
                  className="text-center text-xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  6 siffer fra appen eller 8 tegn backup-kode
                </p>
              </div>

              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Hvis du har mistet tilgang til autentiserings-appen, bruk en av backup-kodene dine.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifiserer...
                    </>
                  ) : (
                    "Verifiser og logg inn"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBackToCredentials}
                  disabled={isLoading}
                >
                  Tilbake
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
