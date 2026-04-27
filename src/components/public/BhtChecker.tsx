"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Building2,
  ExternalLink,
  Users,
  ChevronDown,
} from "lucide-react";

// NACE-koder pålagt BHT etter Forskrift om organisering, ledelse og medvirkning § 13-1
// Sist oppdatert 7. oktober 2025 (nr. 1993)
const BHT_REQUIRED_PREFIXES: string[] = [
  "02",
  "03.2", "03.3",
  "05", "07", "08", "09.9",
  "10", "11", "12", "13", "14", "15", "16", "17",
  "18.1",
  "19", "20", "21", "22", "23", "24", "25",
  "26.1", "26.2", "26.3", "26.4", "26.51", "26.6", "26.7",
  "27", "28", "29", "30", "31",
  "32.3", "32.4", "32.5", "32.990",
  "33",
  "35.1", "35.21", "35.22", "35.23", "35.3", "35.4",
  "36", "37", "38", "39",
  "41", "42",
  "43.1", "43.2", "43.3", "43.4", "43.5", "43.9",
  "46.87",
  "49",
  "52.21", "52.22", "52.23", "52.24",
  "53.1", "53.2",
  "55.1",
  "56.11", "56.22", "56.3",
  "61",
  "75",
  "77.1",
  "80.01", "80.09",
  "81.2",
  "84.23", "84.24", "84.25",
  "85.1", "85.2", "85.3", "85.4", "85.5", "85.69",
  "86.1", "86.2", "86.91", "86.92", "86.93", "86.94", "86.95", "86.96", "86.99",
  "87.1", "87.2", "87.3", "87.99",
  "88",
  "91.3",
  "95.23", "95.24", "95.29", "95.31", "95.32",
  "96.1", "96.21", "96.91",
];

function isNaceRequiredForBht(naceCode: string): boolean {
  const normalized = naceCode.replace(",", ".").trim();
  return BHT_REQUIRED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isOrgNr(value: string): boolean {
  return /^\d[\d\s]{7,10}$/.test(value.trim());
}

function formatOrgNr(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

interface BrregCompany {
  navn: string;
  organisasjonsnummer: string;
  naeringskode1?: { kode: string; beskrivelse: string };
  antallAnsatte?: number;
  forretningsadresse?: { poststed: string; kommunenavn: string };
}

type CheckResult =
  | { status: "required_with_employees"; company: BrregCompany }
  | { status: "required_no_employees"; company: BrregCompany }
  | { status: "required_unknown_employees"; company: BrregCompany }
  | { status: "not_required"; company: BrregCompany }
  | { status: "unknown_industry"; company: BrregCompany }
  | { status: "error"; message: string };

export function BhtChecker() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<BrregCompany[]>([]);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (raw: string) => {
    const looksLikeOrgNr = /^\d[\d\s]*$/.test(raw);
    const formatted = looksLikeOrgNr ? formatOrgNr(raw) : raw;
    setInput(formatted);
    setResult(null);
    setShowSuggestions(false);

    if (looksLikeOrgNr) {
      setSuggestions([]);
      return;
    }

    if (raw.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const res = await fetch(
          `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(raw)}&size=7&konkurs=false`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        const hits: BrregCompany[] = data._embedded?.enheter ?? [];
        setSuggestions(hits);
        setShowSuggestions(hits.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, 300);
  };

  const lookupCompany = async (orgNr: string) => {
    setIsLoading(true);
    setResult(null);
    setShowSuggestions(false);
    try {
      const clean = orgNr.replace(/\D/g, "");
      const res = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${clean}`,
        { headers: { Accept: "application/json" } }
      );
      if (res.status === 404) {
        setResult({ status: "error", message: "Fant ingen virksomhet med dette organisasjonsnummeret." });
        return;
      }
      if (!res.ok) {
        setResult({ status: "error", message: "Klarte ikke å hente data fra Brønnøysundregistrene. Prøv igjen." });
        return;
      }
      const company: BrregCompany = await res.json();
      setResult(buildResult(company));
    } catch {
      setResult({ status: "error", message: "Nettverksfeil. Sjekk tilkoblingen og prøv igjen." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (company: BrregCompany) => {
    const formatted = formatOrgNr(company.organisasjonsnummer);
    setInput(formatted);
    setSuggestions([]);
    setShowSuggestions(false);
    lookupCompany(company.organisasjonsnummer);
  };

  const handleCheck = () => {
    const digits = input.replace(/\D/g, "");
    if (isOrgNr(input) && digits.length === 9) {
      lookupCompany(digits);
    }
  };

  function buildResult(company: BrregCompany): CheckResult {
    if (!company.naeringskode1) return { status: "unknown_industry", company };
    const required = isNaceRequiredForBht(company.naeringskode1.kode);
    if (!required) return { status: "not_required", company };
    const employees = company.antallAnsatte;
    if (typeof employees === "number" && employees === 0) return { status: "required_no_employees", company };
    if (typeof employees === "number" && employees > 0) return { status: "required_with_employees", company };
    return { status: "required_unknown_employees", company };
  }

  const digits = input.replace(/\D/g, "");
  const canSearch = isOrgNr(input) && digits.length === 9;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="relative" ref={suggestRef}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            {isSuggesting ? (
              <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500 animate-spin" />
            ) : (
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            )}
            <Input
              ref={inputRef}
              type="text"
              inputMode="text"
              placeholder="Firmanavn eller organisasjonsnummer"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSearch) handleCheck();
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="pl-10 h-12 text-base border-slate-200 focus:ring-amber-400 focus:border-amber-400"
              autoComplete="off"
            />
          </div>
          <Button
            onClick={handleCheck}
            disabled={isLoading || !canSearch}
            className="h-12 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex-shrink-0 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sjekk"}
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((c) => (
              <button
                key={c.organisasjonsnummer}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-slate-100 last:border-0"
                onMouseDown={() => handleSuggestionClick(c)}
              >
                <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{c.navn}</p>
                  <p className="text-xs text-slate-400">
                    {c.organisasjonsnummer.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}
                    {c.forretningsadresse?.kommunenavn && ` · ${c.forretningsadresse.kommunenavn}`}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 -rotate-90 ml-auto" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      {result && <ResultCard result={result} />}

      <p className="text-xs text-slate-400 leading-relaxed">
        Data hentes fra{" "}
        <a href="https://www.brreg.no" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
          Brønnøysundregistrene
        </a>{" "}
        og sjekkes mot{" "}
        <a
          href="https://lovdata.no/dokument/SF/forskrift/2011-12-06-1355/KAPITTEL_13"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-slate-600"
        >
          Forskrift om organisering § 13-1
        </a>
        . Arbeidstilsynet kan pålegge BHT uavhengig av bransje dersom risikoforhold tilsier det.
      </p>
    </div>
  );
}

function ResultCard({ result }: { result: CheckResult }) {
  if (result.status === "error") {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{result.message}</p>
      </div>
    );
  }

  const { company } = result;
  const orgNrFormatted = company.organisasjonsnummer.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

  return (
    <div className={`rounded-xl border p-5 ${
      result.status === "required_with_employees"
        ? "border-amber-300 bg-amber-50"
        : result.status === "required_no_employees"
        ? "border-blue-200 bg-blue-50"
        : result.status === "required_unknown_employees"
        ? "border-amber-200 bg-amber-50"
        : "border-green-200 bg-green-50"
    }`}>
      {/* Company card */}
      <div className="flex items-start gap-3 pb-4 mb-4 border-b border-black/5">
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-slate-500" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{company.navn}</p>
          <p className="text-xs text-slate-500">
            Org.nr. {orgNrFormatted}
            {company.forretningsadresse?.poststed && ` · ${company.forretningsadresse.poststed}`}
          </p>
          {company.naeringskode1 && (
            <p className="text-xs text-slate-500 mt-0.5">
              Næringskode {company.naeringskode1.kode} — {company.naeringskode1.beskrivelse}
            </p>
          )}
          {typeof company.antallAnsatte === "number" && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3" />
              {company.antallAnsatte} registrerte ansatte
            </p>
          )}
        </div>
      </div>

      {/* Verdict */}
      {(result.status === "required_with_employees" || result.status === "required_unknown_employees") && (
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">
              Dere er i en bransje som er lovpålagt BHT
            </p>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
              Bransjen til{" "}
              <strong>{company.navn}</strong> er lovpålagt å ha en godkjent
              bedriftshelsetjeneste, så lenge dere har ansatte. Husk at dere også er pålagt
              et fungerende HMS-system med internkontroll — uavhengig av BHT.
            </p>
            <a
              href="#pamelding"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-amber-800 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Få tilbud fra oss
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}

      {result.status === "required_no_employees" && (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800">
              Bransjen er pålagt BHT — men dere har ingen ansatte nå
            </p>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              <strong>{company.navn}</strong> er i en bransje som er lovpålagt BHT, men siden
              dere ikke har registrerte ansatte er dere ikke pålagt per nå. Så snart dere
              ansetter noen, inntrer plikten. Vi anbefaler likevel å ha et HMS-system på plass
              fra dag én.
            </p>
          </div>
        </div>
      )}

      {result.status === "not_required" && (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">Ikke i lovpålagt BHT-bransje</p>
            <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
              Bransjen til <strong>{company.navn}</strong> faller ikke under næringskodene med
              automatisk BHT-plikt. Merk at Arbeidstilsynet likevel kan pålegge BHT dersom
              risikoforholdene i virksomheten tilsier det. Et godt HMS-system er uansett
              pålagt for alle med ansatte.
            </p>
          </div>
        </div>
      )}

      {result.status === "unknown_industry" && (
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-700">Næringskode ikke registrert</p>
            <p className="text-sm text-slate-600 mt-1">
              Vi fant ingen næringskode for denne virksomheten i Enhetsregisteret. Kontakt oss
              for en manuell vurdering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
