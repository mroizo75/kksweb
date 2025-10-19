/**
 * Standardiserte sikkerhetspolitikker for ISO 27001
 * 
 * Disse er ferdige maler som kan aktiveres direkte og tilpasses etter behov.
 */

import { PolicyCategory } from "@prisma/client";

export interface PolicyTemplate {
  title: string;
  category: PolicyCategory;
  description: string;
  purpose: string;
  scope: string;
  policy: string;
  procedures?: string;
  reviewSchedule: string;
  applicableTo: string;
}

export const POLICY_TEMPLATES: PolicyTemplate[] = [
  // ========================================
  // 1. TILGANGSKONTROLL
  // ========================================
  {
    title: "Policy for tilgangskontroll",
    category: "ACCESS_CONTROL",
    description: "Definerer retningslinjer for kontroll av tilgang til IT-systemer og informasjon",
    purpose: "Sikre at kun autoriserte personer har tilgang til systemer og informasjon basert på forretningsbehov og roller",
    scope: "Gjelder alle ansatte, konsulenter og eksterne parter som har tilgang til KKS sine IT-systemer",
    policy: `
# Tilgangskontroll

## 1. Generelle prinsipper
- Tilgang til systemer skal baseres på "need-to-know" og "least privilege"
- Alle brukere skal ha unike brukerkontoer
- Deling av brukernavn og passord er strengt forbudt
- Tilgang skal fjernes umiddelbart ved oppsigelse eller rolleendring

## 2. Brukeradministrasjon
- Nye brukere: Tilgang opprettes først etter godkjent søknad fra leder
- Rollebasert tilgang: Tilganger styres gjennom definerte roller (Admin, Instructor, User)
- Gjennomgang: Alle brukerkontoer gjennomgås kvartalsvis
- Sletting: Inaktive kontoer deaktiveres etter 90 dager

## 3. Passordkrav
- Minimum 12 tegn
- Kombinasjon av store/små bokstaver, tall og spesialtegn
- Passord skal byttes hver 90. dag
- Tidligere passord kan ikke gjenbrukes (siste 5)

## 4. Multi-faktor autentisering (2FA)
- Påkrevd for alle administratorer
- Anbefalt for alle brukere
- Obligatorisk ved ekstern tilgang

## 5. Tilgangskontroll til persondata
- Ekstra restriksjoner for tilgang til kompetansebevis og personopplysninger
- Logging av all tilgang til sensitive data
- Kryptering av persondata i database

## 6. Fysisk tilgang
- Sikkert lagring av bærbare enheter
- Automatisk skjermlås etter 5 minutter inaktivitet
- Clean desk policy ved arbeidsdagens slutt
    `,
    procedures: `
# Prosedyrer for tilgangshåndtering

## Søknad om tilgang
1. Ansatt/konsulent sender forespørsel til sin leder
2. Leder godkjenner basert på rolle og behov
3. IT-ansvarlig oppretter bruker med korrekt rolle
4. Bruker mottar midlertidig passord som må endres ved første innlogging

## Endring av tilgang
1. Ved rolleendring: Leder sender melding til IT-ansvarlig
2. IT-ansvarlig oppdaterer tilganger innen 24 timer
3. Endring logges i audit log

## Fjerning av tilgang
1. Ved oppsigelse: HR varsler IT-ansvarlig umiddelbart
2. Tilgang fjernes samme dag eller senest ved arbeidsdagens slutt
3. Fjerning logges i audit log

## Kvartalsvis gjennomgang
1. IT-ansvarlig eksporterer liste over alle brukere
2. Hver leder gjennomgår sine medarbeidere
3. Ugyldige tilganger rapporteres og fjernes
    `,
    reviewSchedule: "Quarterly",
    applicableTo: "Alle ansatte, konsulenter og eksterne parter",
  },

  // ========================================
  // 2. DATABESKYTTELSE (GDPR)
  // ========================================
  {
    title: "Policy for databeskyttelse og personvern",
    category: "DATA_PROTECTION",
    description: "Retningslinjer for håndtering av personopplysninger i henhold til GDPR",
    purpose: "Sikre at KKS håndterer personopplysninger på en lovlig, trygg og etisk måte i tråd med GDPR-kravene",
    scope: "Gjelder all behandling av personopplysninger i KKS sine systemer",
    policy: `
# Databeskyttelse og personvern

## 1. Behandlingsgrunnlag
- Persondata lagres kun med gyldig behandlingsgrunnlag (samtykke, kontrakt, rettslig forpliktelse)
- Formålet med datainnsamling skal være klart definert
- Data skal ikke brukes til andre formål uten nytt samtykke

## 2. Datainnsamling
- Kun nødvendige opplysninger samles inn ("data minimization")
- Bruker skal informeres om hva dataene brukes til
- Samtykke skal være aktivt og informert

## 3. Lagring og sikkerhet
- Persondata krypteres i database
- Tilgang til persondata kun for autorisert personell
- All tilgang til persondata logges
- Sikker sikkerhetskopiering daglig

## 4. Dataportabilitet
- Registrerte har rett til å få utlevert sine data i strukturert format
- Eksport kan gjøres via "Min side"
- Eksporten inkluderer: personopplysninger, kurspåmeldinger, kompetansebevis

## 5. Retten til å bli glemt
- Registrerte kan be om sletting av sine data
- Vurdering av slettekrav innen 30 dager
- Ved sletting: anonymisering av data som må beholdes for regnskapsformål

## 6. Retten til innsyn
- Registrerte kan få innsyn i hvilke data vi lagrer
- Svar på innsynsforespørsel innen 30 dager

## 7. Databrudd
- Personvernbrudd rapporteres til Datatilsynet innen 72 timer
- Berørte personer varsles umiddelbart ved høy risiko
- Alle databrudd dokumenteres

## 8. Tredjeparter
- Databehandleravtaler med alle leverandører som behandler persondata
- Regelmessig gjennomgang av leverandørers sikkerhetstiltak

## 9. Oppbevaring
- Persondata oppbevares kun så lenge det er nødvendig
- Automatisk sletting etter 5 år uten aktivitet (med forbehold for regnskapslov)
    `,
    procedures: `
# Prosedyrer for GDPR-forespørsler

## Innsynsforespørsel
1. Motta forespørsel (e-post eller skriftlig)
2. Verifiser identitet til forespører
3. Samle inn all relevant data fra systemet
4. Utarbeid rapport i lesbart format
5. Send rapport innen 30 dager

## Slettingsforespørsel
1. Motta forespørsel
2. Verifiser identitet
3. Vurder om det foreligger rettslig grunn til å beholde data
4. Ved sletting: Anonymiser data som må beholdes
5. Bekreft sletting til forespører

## Dataeksport (portabilitet)
1. Bruker logger inn på "Min side"
2. Velger "Eksporter mine data"
3. Systemet genererer strukturert fil (JSON)
4. Fil sendes til brukerens e-post

## Databrudd
1. Oppdage brudd → rapporter umiddelbart til IT-ansvarlig
2. IT-ansvarlig vurderer alvorlighetsgrad
3. Ved høy risiko: Varsle Datatilsynet innen 72 timer
4. Varsle berørte personer
5. Dokumenter hendelsen i sikkerhetshendelser
6. Gjennomfør rotårsaksanalyse
7. Implementer forebyggende tiltak
    `,
    reviewSchedule: "Annually",
    applicableTo: "Alle ansatte som behandler personopplysninger",
  },

  // ========================================
  // 3. PASSORDPOLICY
  // ========================================
  {
    title: "Passordpolicy",
    category: "PASSWORD_POLICY",
    description: "Krav til passord og autentisering",
    purpose: "Sikre at passord er sterke nok til å beskytte mot uautorisert tilgang",
    scope: "Gjelder alle brukere av KKS sine systemer",
    policy: `
# Passordpolicy

## 1. Passordkrav
- **Minimum lengde:** 12 tegn
- **Kompleksitet:** Minimum 3 av følgende:
  - Store bokstaver (A-Z)
  - Små bokstaver (a-z)
  - Tall (0-9)
  - Spesialtegn (!@#$%^&*)

## 2. Passordhistorikk
- De 5 siste passordene kan ikke gjenbrukes
- Passord skal endres hver 90. dag
- Tvungen passordendring ved første innlogging

## 3. Passord-administrasjon
- Passord skal ALDRI deles med andre
- Passord skal IKKEskrives ned på papir
- Bruk passordadministrator for lagring av passord
- Ved mistanke om kompromittert passord: Bytt umiddelbart

## 4. Multi-faktor autentisering (2FA)
- **Påkrevd for:**
  - Alle administratorer
  - Tilgang til sensitive persondata
  - Ekstern tilgang
- **Anbefalt for:** Alle brukere
- **Metoder:** TOTP (Google Authenticator, Authy) eller backup-koder

## 5. Kontoutsperring
- Konto låses etter 5 mislykkede innloggingsforsøk
- Utestengning varer i 15 minutter
- Ved gjentatte forsøk: Permanent utestengning (krever IT-ansvarlig for gjenåpning)

## 6. Inaktive kontoer
- Kontoer uten aktivitet på 90 dager deaktiveres automatisk
- Varsel sendes 14 dager før deaktivering
- Reaktivering krever godkjenning fra leder

## 7. Passord ved oppsigelse
- Alle passord til systemene endres umiddelbart ved oppsigelse
- Inkluderer også delte kontoer bruker har hatt tilgang til
    `,
    procedures: `
# Prosedyrer

## Opprette nytt passord
1. Systemet tvinger bruker til å opprette sterkt passord
2. Passord valideres mot kravene (lengde, kompleksitet, historikk)
3. Passord hashet før lagring (bcrypt)

## Glemt passord
1. Bruker klikker "Glemt passord"
2. Bekreftelses-e-post sendes
3. Lenke gyldig i 1 time
4. Bruker oppretter nytt passord som oppfyller kravene

## Tvungen passordendring
1. System varsler 14 dager før passord utløper
2. Ved innlogging etter utløp: Må endre passord før tilgang gis
3. Nytt passord må oppfylle alle krav

## Rapportering av kompromittert passord
1. Bruker varsler IT-ansvarlig umiddelbart
2. IT-ansvarlig resetter passord
3. Gjennomgang av aktivitet på kontoen
4. Vurder om sikkerhetshendelse skal rapporteres
    `,
    reviewSchedule: "Annually",
    applicableTo: "Alle brukere",
  },

  // ========================================
  // 4. HENDELSESHÅNDTERING
  // ========================================
  {
    title: "Policy for håndtering av sikkerhetshendelser",
    category: "INCIDENT_MANAGEMENT",
    description: "Retningslinjer for rapportering og håndtering av sikkerhetshendelser",
    purpose: "Sikre at sikkerhetshendelser håndteres raskt, effektivt og konsistent",
    scope: "Gjelder alle typer sikkerhetshendelser i KKS sine systemer",
    policy: `
# Håndtering av sikkerhetshendelser

## 1. Definisjon av sikkerhetshendelse
En sikkerhetshendelse er enhver observert eller mistenkt hendelse som kan true konfidensialitet, integritet eller tilgjengelighet av informasjon eller systemer.

**Eksempler:**
- Uautorisert tilgang til systemer
- Datainnbrudd eller datatap
- Skadelig programvare (malware, virus)
- Phishing-forsøk
- DDoS-angrep
- Brudd på sikkerhetspolicyer

## 2. Alvorlighetsgrader
- **KRITISK:** Umiddelbar trussel, påvirker forretningskritiske systemer eller persondata
- **HØY:** Alvorlig trussel, krever handling innen 24 timer
- **MEDIUM:** Moderat trussel, krever handling innen 1 uke
- **LAV:** Mindre trussel, kan håndteres etter prioritet

## 3. Rapporteringsplikt
- Alle ansatte SKAL umiddelbart rapportere mistenkelig aktivitet
- Rapportering skjer via systemet (Sikkerhet > Hendelser)
- Ved kritiske hendelser: Varsle IT-ansvarlig direkte (telefon)

## 4. Hendelsesrespons
Alle sikkerhetshendelser skal følge denne livssyklusen:
1. **REPORTED** (Rapportert) - Hendelse oppdaget og rapportert
2. **INVESTIGATING** (Utredning) - Under analyse
3. **CONTAINED** (Inneholdt) - Umiddelbare tiltak for å begrense skade
4. **RESOLVED** (Løst) - Rotårsak identifisert og løst
5. **CLOSED** (Lukket) - Dokumentert og forebyggende tiltak implementert

## 5. Responstider (maksimal tid før respons)
- **KRITISK:** Umiddelbar respons (innen 1 time)
- **HØY:** Innen 4 timer
- **MEDIUM:** Innen 24 timer
- **LAV:** Innen 1 uke

## 6. Dokumentasjon
Alle sikkerhetshendelser skal dokumenteres med:
- Hva skjedde og når
- Hvem oppdaget hendelsen
- Påvirkede systemer/data
- Umiddelbare tiltak
- Rotårsak
- Løsning
- Forebyggende tiltak

## 7. Varsling
- **Personvernbrudd:** Datatilsynet varsles innen 72 timer
- **Berørte personer:** Varsles umiddelbart ved høy risiko
- **Ledelsen:** Informeres ved alle kritiske og høye hendelser

## 8. Læring og forbedring
- Rotårsaksanalyse gjennomføres for alle hendelser (medium eller høyere)
- Forebyggende tiltak implementeres
- Kvartalsvis gjennomgang av alle hendelser for å identifisere mønstre
    `,
    procedures: `
# Prosedyrer ved sikkerhetshendelse

## Rapportering
1. Oppdage hendelse
2. Logg inn i admin-panelet
3. Gå til Sikkerhet > Hendelser
4. Klikk "Ny hendelse"
5. Fyll ut: type, alvorlighetsgrad, beskrivelse, tidspunkt
6. Ved KRITISK: Ring også IT-ansvarlig

## Håndtering (IT-ansvarlig)
1. Motta varsel om ny hendelse
2. Vurder alvorlighetsgrad
3. Sett status til "INVESTIGATING"
4. **Innledende tiltak:**
   - Isoler påvirkede systemer
   - Sikre bevis (logs, screenshots)
   - Stopp pågående angrep
5. **Rotårsaksanalyse:**
   - Identifiser hvordan hendelsen oppstod
   - Dokumenter funn
6. **Løsning:**
   - Implementer løsning
   - Test at problemet er løst
   - Sett status til "RESOLVED"
7. **Forebygging:**
   - Implementer forebyggende tiltak
   - Oppdater policyer/prosedyrer hvis nødvendig
   - Sett status til "CLOSED"

## Varsling av personvernbrudd
1. Vurder om brudd påvirker persondata
2. Hvis JA: Vurder risiko for personvern
3. Ved høy risiko: Varsle Datatilsynet innen 72 timer
4. Dokumenter: Hva, når, hvem, påvirkning, tiltak
5. Varsle berørte personer hvis høy risiko
    `,
    reviewSchedule: "Annually",
    applicableTo: "Alle ansatte",
  },

  // ========================================
  // 5. BACKUP OG GJENOPPRETTING
  // ========================================
  {
    title: "Policy for backup og gjenoppretting",
    category: "BACKUP_RECOVERY",
    description: "Sikre at data kan gjenopprettes ved tap eller skade",
    purpose: "Minimere datatap og sikre forretningskontinuitet",
    scope: "Gjelder alle forretningskritiske systemer og data",
    policy: `
# Backup og gjenoppretting

## 1. Backup-strategi
- **Type:** Automatisk backup av database og filer
- **Frekvens:** Daglig (kl 02:00)
- **Oppbevaring:**
  - Daglige backups: 7 dager
  - Ukentlige backups: 4 uker
  - Månedlige backups: 12 måneder
- **Lagring:** Ekstern lokasjon (ikke samme server som prod-data)

## 2. Hva backup dekker
- Database (komplett)
- Kompetansebevis og dokumenter
- Brukerdata og profiler
- Systemkonfigurasjon
- Audit logs

## 3. Testing av backup
- Månedlig: Test gjenoppretting av én tilfeldig backup
- Kvartalsvis: Full disaster recovery test
- Resultat dokumenteres

## 4. Gjenopprettingsprosedyre
1. Identifiser årsak til datatap
2. Velg riktig backup (siste før datatap)
3. Gjenopprett til test-miljø først
4. Verifiser data
5. Gjenopprett til produksjon
6. Dokumenter hendelsen

## 5. Recovery Time Objective (RTO)
- **Kritiske systemer:** 4 timer
- **Viktige systemer:** 24 timer
- **Mindre kritiske:** 72 timer

## 6. Recovery Point Objective (RPO)
- Maksimalt akseptabelt datatap: **24 timer**
- For kritiske transaksjoner: Daglig backup sikrer dette

## 7. Ansvar
- **IT-ansvarlig:** Overvåker backup, tester gjenoppretting
- **Ledelsen:** Godkjenner RTO/RPO og backup-strategi
    `,
    procedures: `
# Prosedyrer

## Overvåking av backup
1. Automatisk backup kjører daglig kl 02:00
2. IT-ansvarlig mottar varsling om status (suksess/feil)
3. Ved feil: Undersøk umiddelbart og kjør manuell backup
4. Logg alle backups i system

## Månedlig test
1. Første mandag i måneden
2. Velg tilfeldig backup fra forrige uke
3. Gjenopprett til test-miljø
4. Verifiser integritet (spot-checks)
5. Dokumenter resultat

## Disaster recovery test (kvartalsvis)
1. Simuler full systemkollaps
2. Gjenopprett hele systemet fra backup
3. Test all kritisk funksjonalitet
4. Mål tid (RTO)
5. Dokumenter resultat og forbedringspunkter

## Gjenoppretting ved datatap
1. Varsle IT-ansvarlig
2. Stopp alle systemendringer
3. Identifiser siste gode backup
4. Gjenopprett til test-miljø
5. Verifiser data med berørte brukere
6. Godkjenning fra ledelsen
7. Gjenopprett til prod
8. Varsle alle brukere
9. Dokumenter i sikkerhetshendelser
    `,
    reviewSchedule: "Annually",
    applicableTo: "IT-ansvarlig",
  },
];

