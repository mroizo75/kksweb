"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { COMPETENCE_CODES, groupCodesByCategory } from "@/lib/competence-codes";
import { Badge } from "@/components/ui/badge";
import type { CredentialType } from "@prisma/client";

interface CredentialTypeSelectorProps {
  type: CredentialType;
  competenceCodes: string[];
  onTypeChange: (type: CredentialType) => void;
  onCodesChange: (codes: string[]) => void;
}

export function CredentialTypeSelector({
  type,
  competenceCodes,
  onTypeChange,
  onCodesChange,
}: CredentialTypeSelectorProps) {
  const grouped = groupCodesByCategory(competenceCodes);

  const toggleCode = (code: string) => {
    if (competenceCodes.includes(code)) {
      onCodesChange(competenceCodes.filter((c) => c !== code));
    } else {
      onCodesChange([...competenceCodes, code]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Type kompetansebevis</Label>
        <Select value={type} onValueChange={(value) => onTypeChange(value as CredentialType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DOCUMENTED">
              Dokumentert kompetanse
            </SelectItem>
            <SelectItem value="CERTIFIED">
              Sertifisert kompetanse (med koder)
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {type === "CERTIFIED"
            ? "Gir rett til å føre maskiner/utstyr med spesifikke koder"
            : "Dokumenterer fullført opplæring uten sertifisering"}
        </p>
      </div>

      {type === "CERTIFIED" && (
        <div>
          <Label>Kompetansekoder</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Velg hvilke kompetansekoder som skal utstedes
          </p>

          {/* Valgte koder */}
          {competenceCodes.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {competenceCodes.map((code) => {
                const info = COMPETENCE_CODES.find((c) => c.code === code);
                return (
                  <Badge key={code} variant="default">
                    {code}: {info?.name}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Kode-velger */}
          <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* T-koder */}
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">
                T - Truck (Gaffeltruck)
              </h4>
              <div className="space-y-2">
                {COMPETENCE_CODES.filter((c) => c.category === "T").map((code) => (
                  <div key={code.code} className="flex items-start space-x-2">
                    <Checkbox
                      id={code.code}
                      checked={competenceCodes.includes(code.code)}
                      onCheckedChange={() => toggleCode(code.code)}
                    />
                    <label htmlFor={code.code} className="cursor-pointer flex-1">
                      <div className="font-medium">
                        {code.code} - {code.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {code.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* M-koder */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 text-green-600">
                M - Maskiner (Anleggsmaskiner)
              </h4>
              <div className="space-y-2">
                {COMPETENCE_CODES.filter((c) => c.category === "M").map((code) => (
                  <div key={code.code} className="flex items-start space-x-2">
                    <Checkbox
                      id={code.code}
                      checked={competenceCodes.includes(code.code)}
                      onCheckedChange={() => toggleCode(code.code)}
                    />
                    <label htmlFor={code.code} className="cursor-pointer flex-1">
                      <div className="font-medium">
                        {code.code} - {code.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {code.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* G-koder */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 text-orange-600">
                G - Spesialområder
              </h4>
              <div className="space-y-2">
                {COMPETENCE_CODES.filter((c) => c.category === "G").map((code) => (
                  <div key={code.code} className="flex items-start space-x-2">
                    <Checkbox
                      id={code.code}
                      checked={competenceCodes.includes(code.code)}
                      onCheckedChange={() => toggleCode(code.code)}
                    />
                    <label htmlFor={code.code} className="cursor-pointer flex-1">
                      <div className="font-medium">
                        {code.code} - {code.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {code.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* C-koder */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 text-purple-600">
                C - Kraner
              </h4>
              <div className="space-y-2">
                {COMPETENCE_CODES.filter((c) => c.category === "C").map((code) => (
                  <div key={code.code} className="flex items-start space-x-2">
                    <Checkbox
                      id={code.code}
                      checked={competenceCodes.includes(code.code)}
                      onCheckedChange={() => toggleCode(code.code)}
                    />
                    <label htmlFor={code.code} className="cursor-pointer flex-1">
                      <div className="font-medium">
                        {code.code} - {code.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {code.description}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

