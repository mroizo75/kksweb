import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Midlertidig bevis ikke funnet</h1>
        <p className="text-gray-600 mb-6">
          Verifiseringskoden er ugyldig eller beviset finnes ikke i systemet.
        </p>
        <Link href="/">
          <Button>Tilbake til forsiden</Button>
        </Link>
      </div>
    </div>
  );
}

