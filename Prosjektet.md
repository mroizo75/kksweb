# KKS Kurs & HMS – Systemarkitektur og Cursor‑plan (Next.js + MySQL)

Denne planen beskriver en ende‑til‑ende løsning for:

1. Nettside for salg av kurs (truckfører, maskinfører, kranfører, personløfter, løfteredskap, stillasbruker, arbeid på vei, graving 1.25m+, diisocyanater, HMS‑ledere, førstehjelp m.fl.).
2. Påmeldingssystem.
3. BHT‑samarbeid (DR Drop‑in), inkl. salg av HMS Nova.
4. CRM for kundeoppfølging.
5. «Sentralregister»‑lignende modul for sertifiserte kort + diplom/midlertidig sertifikat/kursbevis + malstyring.
6. API‑kobling mot Bransjekurs.no (import av digitale kursresultater med mulighet for kortproduksjon).

Stack: **Next.js (App Router)**, **TypeScript**, **Prisma** (MySQL), **NextAuth (Auth.js)**, **shadcn/ui**, **Resend** (e‑post), **Zod**, **Stripe** (valgfritt for betaling), **pdf-lib** (PDF), **qrcode** (QR), **S3‑kompatibel lagring** (R2/S3/MinIO), **Vitest/Playwright**, **ESLint/Prettier**.

---

## 1) Målbilde og krav

* **Kurskalender med repeterende oppsett**: Sett opp kursserier med intervaller (ukentlig, annenhver uke, månedlig) og mønstre (ukedager, helg). Auto‑generering av sesjoner med start/slutt, sted, instruktør.
* **Bulk‑påmelding for bedrifter**: Bedrifter kan melde på flere ansatte i én operasjon (CSV/utfyllingsskjema).
* **Gyldighetsregler per kurs**: Støtte for «ingen utløp» (sertifiserte kurs/bedriftsopplæring) og tidsbestemt gyldighet (f.eks. Diisocyanater 5 år, YSK 5 år). Systemet skal håndheve gyldighetslogikk pr. kurskode.
* **Automatiske fornyelsespåminnelser**: CRM‑motor som sender varsel **6 mnd før utløp**, med lenke til passende oppfriskningskurs og mulighet for ett‑klikk‑påmelding.

(Original tekst fortsetter nedenfor.)

## 1) Målbilde og krav

* **Multitenant SaaS**: Superadmin kan opprette «Foretak» (tenants), invitere brukere, definere roller/tilganger. Hver tenant har sine kurs, arrangement, deltakere, ordre, dokumenter, maler og kort.
* **Kurskatalog**: Kurs med varianter (digitalt, klasserom, bedriftsintern), kompetansekoder, lov/forskrift‑referanser, varighet, forkunnskaper, gyldighet.
* **Påmelding & kapasitet**: Sesjoner (dato/sted/instruktør/kvoter), ventelister, rabattkoder, faktura/kortbetaling, kvittering, automatisk e‑postflyt.
* **Kompetansebevis**: Generere diplom, midlertidig sertifikat, kursbevis, og **sertifiserte plastkort**. Støtte for **malopplasting** (PDF/PNG) og dynamiske variabler; QR‑kode og verifikasjons‑URL.
* **Register**: Søkbar base for verifikasjon (kort‑ID/QR), historikk (kurs, bestått/ikke‑bestått, gyldighet/utløp), eksport (CSV/PDF), rapporter.
* **CRM**: Leads, kontoer (bedrifter), kontakter, oppfølging (oppgaver, påminnelser), e‑postmaler, pipeline, avtaler.
* **BHT & HMS Nova**: Pakker og add‑ons, timebestilling, henvisning, dokumentdeling; kryss‑salg av HMS Nova abonnement fra samme tenant.
* **Integrasjoner**: Import av digitale kursresultater fra Bransjekurs.no via API + webhooks. Felles ident (Person/Bedrift) og deduplisering.
* **Sikkerhet**: RBAC per tenant, datasegregering, audit‑logg, personvern (GDPR), mva‑kompatibel fakturering.

---

## 2) Informasjonsarkitektur (domene‑modeller)

**Kjerne**

* `Tenant` (for single‑tenant distribusjon byttes denne ut med `Instance` eller utelates; én DB pr. kunde)
* `User` — personprofil (navn, fødselsdato*, kontaktinfo)
* `Membership` — (user ↔ rolle) i én instans
* `Person` — kandidat/deltaker (kan være koblet til `User` eller stå alene)
* `Company` — kunde/arbeidsgiver (CRM «Account»)

**Kurs & arrangement**

* `Course` — tittel, kode(r), kategori (truck/kran/stillas/…)
* `CourseVariant` — type (digital/klasserom/bedriftsintern), prisoppsett
* `SessionPattern` — **ny**: tilbakevendende mønster (RRULE‑likt): frekvens (WEEKLY/BIWEEKLY/MONTHLY), byDay (MO,TU,…), bySetPos (1., 2., 3. helg), startTime, duration, locationId, instructorId (valgfritt), activeFrom/Until, timezone
* `Session` — enkeltforekomst generert fra pattern eller manuelt: start/slutt, sted, instruktør, kapasitet, status
* `Enrollment` — (person, session), status (påmeldt, venteliste, bestått, strøket), poeng, dokumentasjon
* `Assessment` — tester, oppmøte, signaturer, bilder

**Gyldighet & kompetanse**

* `ValidityPolicy` — **ny**: per `Course`/kode: `kind` (NONE | FIXED_YEARS | CUSTOM_RULE), `years` (f.eks. 5), `graceDays` (valgfritt), `renewalCourseId` (valgfritt)
* `Credential` — (Person, Course) `validFrom`, `validTo` (nullable ved NONE), `policyId`

**Bestilling & betaling**

* `Order`, `OrderItem`, `Invoice`/`Payment`

**Dokumenter & maler**

* `Template`, `Document`, `Card`

**Register & verifikasjon**

* `Credential` + `VerificationLog`

**CRM**

* `Lead`, `Deal`, `Activity` (oppgave, påminnelse), `Note`
* **RenewalTask** — **ny**: generert automatisk 6 mnd før `validTo`

**Integrasjoner**

* `ExternalSystem`, `SyncJob`, `WebhookEvent`

**Kjerne**

* `Tenant` (Foretak) — orgnr, navn, innstillinger, locale, logo
* `User` — personprofil (navn, fødselsdato*, kontaktinfo)
* `Membership` — (user ↔ tenant) + `role` = superadmin | admin | instruktør | koordinator | salg | les | kandidat
* `Person` — kandidat/deltaker (kan være koblet til `User` eller stå alene)
* `Company` — kunde/arbeidsgiver (CRM «Account»)

**Kurs & arrangement**

* `Course` — tittel, kode(r), kategori (truck/kran/stillas/…)
* `CourseVariant` — type (digital/klasserom/bedriftsintern), prisoppsett
* `Session` — start/slutt, sted, instruktør, kapasitet, status
* `Enrollment` — (person, session), status (påmeldt, venteliste, bestått, strøket), poeng, dokumentasjon
* `Assessment` — tester, oppmøte, signaturer, bilder

**Bestilling & betaling**

* `Order` — tenant, kunde (Company/Person), totalsum, mva, status
* `OrderItem` — referanse til Course/Session/Produkt (HMS Nova/BHT)
* `Invoice`/`Payment` — integrasjon (eFaktura/Stripe/Visma) – *kan legges til senere*

**Dokumenter & maler**

* `Template` — type (Diplom, Midlertidig, Kursbevis, Kort), fil (PDF/PNG), variabler, versjon
* `Document` — generert PDF med referanse til Template + payload (serialisert)
* `Card` — plastkortbestilling (layout, batch, status, kortnummer, QR/URL)

**Register & verifikasjon**

* `Credential` — (Person, Course) gyldighet fra/til, status; offentlig verifiserbar kode
* `VerificationLog` — oppslag historikk

**CRM**

* `Lead`, `Deal`, `Activity` (oppgave, samtale, e‑post), `Note`
* `Contact` — person knyttet til `Company`

**Integrasjoner**

* `ExternalSystem` — (Bransjekurs, DR Drop‑in, HMS Nova)
* `SyncJob` — type, payload, status, retry, feillogger
* `WebhookEvent` — mottatte hendelser og kvittert status

---

## 3) Multitenancy & tilgang

* **Database‑strategi**: *Single DB, shared schema* med `tenantId` på alle «eierskaps‑tabeller». Prisma «middleware» sikrer automatisk `where: { tenantId }`.
* **RBAC**: Rolle per `Membership`. Funksjons‑flagg pr. rolle (CRUD rettigheter), og «scopes» (f.eks. kursmodul/CRM/kortproduksjon).
* **Audit**: `AuditLog` med (actor, action, entity, before/after, ip, userAgent).
* **Verifikasjon**: Offentlig `verify/{code}` viser navn, kurs, dato, gyldighet (kun nødvendige felt).

---

## 4) API‑kontrakter (App Router /route.ts)

`/api/scheduling/*`

* POST `/api/scheduling/patterns` — opprett/oppdater **SessionPattern** (frekvens, byDay, helg/uke, tidsrom)
* POST `/api/scheduling/materialize` — generer sesjoner fra pattern innen gitt datoperiode
* PATCH `/api/sessions/{id}` — endre enkeltinstans (overstyring)

`/api/validity/*`

* POST `/api/validity/policies` — opprette/endre **ValidityPolicy** (NONE/FIXED_YEARS/CUSTOM_RULE)
* GET `/api/validity/policies` — liste

`/api/renewals/*`

* POST `/api/renewals/scan` — kjør jobb som finner `Credential.validTo` innen 6 mnd og lager **RenewalTask** + e‑post
* GET `/api/renewals/tasks` — liste/filtrer oppgaver (åpne/gjort)

(Øvrige API‑ruter beholdes som tidligere: kurs, sesjoner, påmeldinger, dokumenter/kort, CRM, integrasjoner, verify).

`/api/tenants/*`

* POST `/api/tenants` — opprett foretak
* POST `/api/tenants/{id}/invite` — inviter bruker

`/api/courses/*`

* GET `/api/courses` — liste/filtre
* POST `/api/courses` — opprett/oppdater kurs (+varianter)
* GET `/api/sessions` — søk i sesjoner, kapasitet, sted
* POST `/api/sessions` — opprett/endre/kanseller

`/api/enrollments/*`

* POST `/api/enrollments` — påmelding (person + session)
* PATCH `/api/enrollments/{id}` — status, resultater

`/api/orders/*`

* POST `/api/orders` — opprett (kurs, BHT, HMS Nova)
* POST `/api/payments/intent` — forberede betaling (Stripe valgfritt)

`/api/templates/*`

* POST `/api/templates` — last opp mal (PDF/PNG), definér variabler
* GET `/api/templates` — liste/versjoner

`/api/documents/*`

* POST `/api/documents/generate` — render PDF fra template + payload
* GET `/api/documents/{id}` — hent PDF (signert URL)

`/api/cards/*`

* POST `/api/cards/batch` — opprett bestilling for plastkort
* GET `/api/cards/{id}` — status, printfil (PDF)

`/api/verify/*`

* GET `/api/verify/{code}` — offentlig verifikasjon

`/api/crm/*`

* CRUD på `Lead`, `Deal`, `Activity`, `Company`, `Contact`

`/api/integrations/*`

* POST `/api/integrations/bransjekurs/webhook` — motta resultater
* POST `/api/integrations/drdropin/webhook` — avtaler/rapporter
* POST `/api/integrations/hmsnova/webhook` — status/sync
* POST `/api/sync/run` — manuell sync (admin)

---

## 5) PDF, plastkort og malmotor

* **Maldefinisjon**: Last opp *bakgrunnsmal* (PDF/PNG). Definér *lag* (tekst/bilde/QR) med posisjon (x/y), font, størrelse, farge, datoformat og binding (f.eks. `{{person.fullName}}`, `{{course.title}}`, `{{credential.validTo}}`).
* **Render‑pipeline**: `pdf-lib` kombinerer mal + payload → kapsles i `Document`. QR genereres fra verifikasjons‑URL. Batch‑generering for kort, med *print‑ready* PDF (CMYK‑profil kan vurderes via ekstern konvertering).
* **Midlertidig sertifikat**: Auto‑utløp (f.eks. 14/30 dager) med tydelig watermark.
* **Journal**: Alle genereringer logges (hvem, når, hvilket grunnlag).

---

## 6) Integrasjoner (adaptere)

* **Kalender/Repetering**: Intern planlegger «materialiserer» sesjoner fra `SessionPattern` ukentlig (cron) + ved lagring.
* **Bransjekurs.no**: (uendret) → oppdaterer Enrollment/Credential.
* **DR Drop‑in (BHT)**: (uendret) → henvisning/status.
* **HMS Nova**: (uendret) → provisioning/SSO.
* **E‑post (Resend)**: Maler for påminnelse 6 mnd før utløp + 3 mnd + 30 dager (kan konfigureres).

**Bransjekurs.no**

* *Pull*: API‑nøkler per tenant. Endepunkt for «Result feed» (fullførte moduler, tester, score, tid). Deduplisering via `externalId`.
* *Webhook*: Når kurs fullføres digitalt → `Enrollment` oppdateres, `Credential` opprettes, `Document`/`Card` kan trigges.

**DR Drop‑in (BHT)**

* *Booking*: Opprett henvisning / avtale (type: helseundersøkelser, vaksinering, legebesøk). Hent status/dokumenter via webhook/polling.
* *Samtykke*: Person samtykker i deling til arbeidsgiver/tenant. Journaltilgang logges.

**HMS Nova**

* *Provisioning*: Opprett abonnement/space. SSO eller «magic link». Synk kunder/kontakter.

> Alle adaptere bygges i et felles grensesnitt: `src/integrations/{provider}/{client.ts, webhooks.ts, mappers.ts}`.

---

## 7) UI/UX (shadcn/ui + Tailwind)

* **Publikum**: Landingsside, kurskatalog, filtrering (kategori, sted, dato), produktkort, kursdetalj, påmeldingsflyt (person/bedrift, fakturainfo, betaling), kvittering.
* **Backoffice (tenant)**: Dashboard (nøkkeltall, neste kurs), Kurs & Sesjoner, Påmeldinger, Deltakere, Dokumenter & Maler, Kortproduksjon, CRM, Integrasjoner, Innstillinger.
* **Komponenter**: DataTable (kolonner/filtre/eksport), Form (Zod + React Hook Form), Dialog/Wizard for påmelding, Uploader, PDF‑preview, QR‑preview, Calendar, Kanban (CRM).

---

## 8) Sikkerhet, personvern, etterlevelse

* **Auth**: NextAuth (e‑post magic link + OIDC for bedrifter). 2FA valgfritt.
* **Rollevern**: Server Actions/route handlers sjekker `session` + `membership.role` + `tenantId`.
* **Data**: Kun nødvendige personopplysninger. Krypter fødselsdato og fødselsnummer hvis lagres (helst unngå fnr).
* **Logging**: Audit‑logg + tilgangslogg. Skjerming av sensitive felter i logger.
* **DPA/avtaler**: Databehandleravtale, slette‑policy (retention), eksport/self‑service for kandidat.

---

## 9) Ytelse og drift

* **DB**: MySQL (utf8mb4), indekser på `(tenantId, foreignKey, status, date)`.
* **Cache**: Oppslag som kurskatalog og verifikasjon kan caches (ISR/Cache‑Tagging). Rate‑limit på verifikasjons‑API.
* **Lagring**: S3‑kompatibel for maler og genererte PDF. Signerte URLer.
* **Jobbkø**: Batch kortproduksjon og masserendering via kø (BullMQ/Cloud Queue) – alternativt cron‑API.
* **Observability**: Healthchecks, pino‑logger, metrikker (Prometheus/OpenTelemetry).

---

## 10) Database (Prisma skjelett)

```prisma
model User { id String @id @default(cuid()) email String @unique name String? phone String? image String? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt memberships Membership[] }
model Membership { id String @id @default(cuid()) userId String role Role @default(USER) user User @relation(fields: [userId], references: [id]) @@index([userId]) }

enum Role { SUPERADMIN ADMIN INSTRUCTOR COORDINATOR SALES VIEWER CANDIDATE }

model Person { id String @id @default(cuid()) firstName String lastName String email String? phone String? birthDate DateTime? companyId String? company Company? @relation(fields: [companyId], references: [id]) credentials Credential[] }

model Company { id String @id @default(cuid()) name String orgno String? contacts Contact[] }

model Course { id String @id @default(cuid()) title String category String codes String[] validityPolicyId String? validityPolicy ValidityPolicy? @relation(fields: [validityPolicyId], references: [id]) variants CourseVariant[] }

model ValidityPolicy { id String @id @default(cuid()) kind ValidityKind years Int? graceDays Int? renewalCourseId String? renewalCourse Course? @relation("RenewalFor", fields: [renewalCourseId], references: [id]) courses Course[] }

enum ValidityKind { NONE FIXED_YEARS CUSTOM_RULE }

model CourseVariant { id String @id @default(cuid()) courseId String type VariantType price Int @default(0) course Course @relation(fields: [courseId], references: [id]) sessions Session[] patterns SessionPattern[] }

enum VariantType { DIGITAL CLASSROOM ONSITE }

model SessionPattern { id String @id @default(cuid()) courseVariantId String freq RecurrenceFreq byDay String[]? bySetPos Int? startTime DateTime durationMinutes Int location String instructorId String? timezone String @default("Europe/Oslo") activeFrom DateTime? activeUntil DateTime? courseVariant CourseVariant @relation(fields: [courseVariantId], references: [id]) sessions Session[] }

enum RecurrenceFreq { WEEKLY BIWEEKLY MONTHLY }

model Session { id String @id @default(cuid()) courseId String courseVariantId String? startsAt DateTime endsAt DateTime location String capacity Int @default(12) instructorId String? status SessionStatus @default(PLANNED) patternId String? course Course @relation(fields: [courseId], references: [id]) variant CourseVariant? @relation(fields: [courseVariantId], references: [id]) pattern SessionPattern? @relation(fields: [patternId], references: [id]) enrollments Enrollment[] }

enum SessionStatus { PLANNED OPEN CLOSED CANCELED }

model Enrollment { id String @id @default(cuid()) sessionId String personId String status EnrollmentStatus @default(REGISTERED) score Int? resultAt DateTime? session Session @relation(fields: [sessionId], references: [id]) person Person @relation(fields: [personId], references: [id]) }

enum EnrollmentStatus { REGISTERED WAITLIST PASSED FAILED NO_SHOW }

model Credential { id String @id @default(cuid()) personId String courseId String code String @unique validFrom DateTime validTo DateTime? policyId String? person Person @relation(fields: [personId], references: [id]) course Course @relation(fields: [courseId], references: [id]) policy ValidityPolicy? @relation(fields: [policyId], references: [id]) }

model Template { id String @id @default(cuid()) kind TemplateKind fileKey String variables String[] version Int @default(1) }

enum TemplateKind { DIPLOMA TEMP_CERT CERTIFICATE CARD }

model Document { id String @id @default(cuid()) templateId String payload Json fileKey String createdAt DateTime @default(now()) template Template @relation(fields: [templateId], references: [id]) }

model Card { id String @id @default(cuid()) personId String credentialId String batchId String? number String @unique fileKey String? status CardStatus @default(PENDING) person Person @relation(fields: [personId], references: [id]) credential Credential @relation(fields: [credentialId], references: [id]) }

enum CardStatus { PENDING RENDERED PRINTING SHIPPED FAILED }

model Lead { id String @id @default(cuid()) source String? name String? email String? phone String? status LeadStatus @default(NEW) }

enum LeadStatus { NEW QUALIFIED PROPOSAL WON LOST }

model Contact { id String @id @default(cuid()) companyId String firstName String lastName email String? phone String? company Company @relation(fields: [companyId], references: [id]) }

model RenewalTask { id String @id @default(cuid()) credentialId String dueAt DateTime status TaskStatus @default(OPEN) assignedToId String? credential Credential @relation(fields: [credentialId], references: [id]) }

enum TaskStatus { OPEN DONE SKIPPED }
```

> *Alle tabeller som «eies» av tenant har `tenantId` + indekser på hyppig filtrerte kolonner.*

---

## 11) Cursor‑plan (arbeidsflyt og regler)

**Nye steg**

* Implementér `SessionPattern` CRUD + «materialize» service for ukentlig/månedlig auto‑generering.
* Legg til `ValidityPolicy` og koble inn i dokument/credential‑pipeline.
* Skriv «Renewal Engine» som kjører daglig: finner kommende utløp (180 dager), oppretter `RenewalTask` + sender e‑post med lenke til passende kurs/oppfriskning.
* Bygg B2B bulk‑påmelding (CSV + skjema) og koble til CRM (Company/Contact).

(Øvrige regler beholdes som før.)

**Repo‑struktur**

```
apps/web (Next.js)
packages/ui (designsystem med shadcn‑komponenter)
packages/config (eslint, tsconfig, tailwind)
packages/lib (felles domene‑/utils – pdf, qr, templates)
prisma/schema.prisma
```

**Cursor User Rules (kortversjon)**

* Bruk **App Router** med **Server Actions** for skriveoperasjoner. Ingen «blandingsmønstre».
* All DB‑tilgang går via `@/lib/db` + Prisma‑middleware som **automatisk injiserer `tenantId`**.
* Valider alltid input med **Zod**. Ingen utypede `any`.
* UI‑komponenter i `packages/ui`. Gjenbruk, ingen duplisering.
* API‑kontrakter beskrives i `@/lib/contracts` (zod‑schemas). Server og klient **deler** kontrakt.
* PDF/QR‑rendering skjer i jobbkø, ikke i HTTP‑request.
* Logging via `@/lib/log` med feltbasert struktur. Ikke logg personfølsomt innhold.

**Steg‑for‑steg**

1. Init monorepo, Next.js app, Tailwind/shadcn, Prisma + MySQL, NextAuth, Resend.
2. Implementer multitenancy (middleware + session → `tenantId`).
3. Lag data‑modeller og migrasjoner.
4. Bygg kurskatalog + påmelding (publikumssider) med betalingsstub.
5. Bygg backoffice: Kurs, Sesjoner, Påmeldinger.
6. Legg til CRM‑modul (Lead/Company/Contact/Deal/Activity).
7. Malmotor + dokument‑rendering (pdf‑lib + qrcode) + kortbatch.
8. Verifikasjonsportal (`/verify/{code}`) + offentlig søk.
9. Integrasjoner: Bransjekurs webhook + import; DR Drop‑in adapter; HMS Nova provisioning.
10. Auditlogg, rapporter, eksport/import.
11. Test (Vitest), E2E (Playwright), seed‑data.

**CI/CD**

* Lint, typecheck, test, prisma migrate, deploy.
* Miljøer: `dev` (preview), `prod` (blue/green).

---

## 12) Skjermbilder & nøkkelflyter (kort)

* **Påmelding**: Kurs → Velg dato/sted → Person/Bedrift → Betaling/Faktura → Kvittering → E‑post (Resend).
* **Instruktør**: Ta oppmøte, vurdering, legg inn resultater → Generer dokumenter → Kortbatch.
* **Admin**: Oversikt, pipeline (CRM), integrasjonsstatus, auditlogg.
* **Verifikasjon**: Skann QR → lander på `verify` med grønn/gyldig/utløpt.

---

## 13) Malvariabler (eksempler)

```
{{tenant.name}}
{{person.fullName}}
{{person.birthDate:dd.MM.yyyy}}
{{course.title}}
{{session.startsAt:dd.MM.yyyy}}
{{credential.validFrom:dd.MM.yyyy}}
{{credential.validTo:dd.MM.yyyy}}
{{credential.code}}
{{qr(verifyUrl)}}
```

---

## 14) Datakvalitet og samsvar

* Deduplisering på `email + birthDate` eller ekstern ID.
* Utløpsjobber: varsle 90/30/0 dager før gyldighet utløper.
* Eksport: «Min side» for kandidater (egen data, dokumenter, sletteforespørsel).

---

## 15) Videreutvikling (opsjoner)

* Fakturering/økonomi (Tripletex/Visma, EHF/Peppol).
* Stripe Connect for kursarrangører/partnere.
* E‑signatur av oppmøtelister (BankID/Signicat).
* BI‑dashboards og API for partnere.

---

## 16) Akseptansekriterier (utdrag)

* [ ] Superadmin kan opprette foretak, invitere bruker, definere roller.
* [ ] Tenant‑admin kan opprette kurs/sesjoner og ta imot påmeldinger.
* [ ] Kandidat kan melde seg på og motta kvittering på e‑post.
* [ ] Instruktør kan registrere resultat og trigge dokument/kort.
* [ ] Verifikasjons‑URL viser gyldighet + historikk uten innlogging.
* [ ] CRM har lead→deal flyt + e‑postmaler via Resend.
* [ ] Bransjekurs webhook oppdaterer Enrollment/Credential automatisk.
* [ ] Alle SQL‑spørringer er tenant‑scopet via middleware + tester.

---

## 16b) Utvidede akseptansekriterier (full liste v1)

### Kurs & påmelding

* [ ] Publikums‑katalog med filtrering (kategori, sted, dato) og SEO‑vennlige URLer.
* [ ] Påmelding støtter privatperson og bedrift (orgnr‑oppslag), med faktura/kortbetaling (stub/Stripe).
* [ ] Kapasitetsstyring med venteliste, manuell overstyring for admin.
* [ ] **Repeterende kurs**: Admin kan opprette `SessionPattern` for «uke», «helg», «annenhver uke»; systemet genererer sesjoner automatisk i valgt periode.
* [ ] E‑postflyt via Resend: bekreftelse, påminnelse (T‑3/T‑1), oppmøtekvittering.
* [ ] Instruktør kan registrere oppmøte/resultat offline (fallback) og synke senere.

### Dokumenter & kort

* [ ] Opplasting av mal (PDF/PNG), definisjon av variabler, forhåndsvisning, versjonering.
* [ ] Generering av diplom/midlertidig sertifikat/kursbevis som PDF med QR‑kode.
* [ ] Kortbatch produserer print‑klar PDF (for‑/bakside), statusløp: Pending→Rendered→Printing→Shipped.
* [ ] Offentlig verifikasjon via `verify/{code}` med grønn/gul/rød status og gyldighetsdato.

### Register & gyldighet

* [ ] **Gyldighetspolicy** kan settes per kurs: «ingen utløp» eller «fast x år» (f.eks. Diisocyanater = 5 år, YSK = 5 år).
* [ ] Når resultat registreres → `Credential.validFrom/validTo` settes etter policy.
* [ ] Systemet støtter egendefinerte regler (CUSTOM_RULE) for særtilfeller.

### CRM & fornyelser

* [ ] **Renewal Engine** oppretter `RenewalTask` og sender e‑post **6 mnd før utløp**, med lenke til anbefalt kurs.
* [ ] Mulighet for eskalering på 3 mnd og 30 dager.
* [ ] Oversikt i CRM over kunder/ansatte som er nær utløp; ett‑klikk bulk‑påmelding.

### Integrasjoner

* [ ] Bransjekurs webhook oppretter/oppdaterer Enrollment + Credential automatisk (idempotent på `externalId`).
* [ ] DR Drop‑in: opprett henvisning og motta status via webhook, med audit‑logg og samtykkeflyt.
* [ ] HMS Nova provisioning av abonnement + SSO/magic link.

### Roller/tilgang

* [ ] Admin kan definere patterns, policies og skru på/av fornyelsesvarsler.
* [ ] Instruktør har begrenset tilgang (oppmøte/resultat) og ser kun egne sesjoner.
* [ ] Kandidat kan logge inn på "Min side" og hente egne dokumenter.

### Rapporter & varsling

* [ ] Varsling 90/30/0 dager før utløp kan aktiveres i tillegg til 6 mnd standard.
* [ ] Dashboards pr. instans med nøkkeltall (påmeldinger, bestått, utløper neste 90/180 dager).

## 17) Ikke‑funksjonelle krav (NFR)

* **Ytelse**: 95‑percentil < 300 ms for lesende API; batch 100 kort rendres < 60 s i kø.
* **Skalering**: Horisontal skalering av web + jobbkø; DB med riktige indekser og read‑replica opsjon.
* **Tilgjengelighet**: 99.5 % pr. kvartal. Graceful degradation for PDF/kort (retry + dead‑letter).
* **Sikkerhet**: 2FA valgfritt, rate‑limiting, OWASP ASVS L2 kontroller.
* **Personvern**: Dataminimering; kryptering i ro (KMS) for sensitive felter; separasjon av nøkkelmateriale.
* **WCAG**: 2.2 AA på alle offentlige sider + backoffice kjerner.
* **Lokaliseringsstøtte**: nb‑NO som default, støtte for en_US med dato/valuta‑formatter.

---

## 18) Sikkerhet & compliance sjekkliste

* **GDPR**: Behandlingsgrunnlag, DPIA (BHT), databehandleravtaler, rett til innsyn/sletting.
* **Logging**: AuditLog (CRUD, innlogging, dokument‑/journaltilgang), skjerming av PII i logger.
* **E‑post**: SPF/DKIM/DMARC for Resend‑domener.
* **Cookies**: Samtykke (CMP), nødvendige vs. analyse, transparens.
* **Retention**: Standardpolicy (f.eks. kursdata 5 år; BHT etter fagkrav), automatisk anonymisering.
* **Nøkkelhåndtering**: Rotasjon av API‑nøkler, secrets i vault (.env bare i dev), nøkkelkompromiss‑rutine.

---

## 19) Datadetaljer

* **ID‑standard**: `cuid2`/ULID for entiteter, `CRD‑XXXX‑YYYY` for Credential‑koder.
* **Person**: Unngå fødselsnummer; bruk fødselsdato + e‑post/telefon. Felt for samtykke.
* **Validering**: Zod‑skjemaer i `@/lib/contracts` som deles mellom server/klient.

---

## 20) API‑versjonering & feilmodell

* **Versjonering**: Header `x-api-version` (initialt `1`), semver ved breaking changes.
* **Feil**: Ensartet JSON `{ error: { code, message, details } }`, korrekte HTTP‑koder.
* **Rate‑limit**: Per API‑nøkkel og IP; `429` med Retry‑After.

---

## 21) Integrasjonskontrakter (skisser)

* **Bransjekurs → Webhook**: `{ externalId, person: {name,email,birthDate}, courseCode, completedAt, score }`.
* **DR Drop‑in**: `POST /referrals` (type, person, employer) → `200 { referralId }`; Webhook `status=booked|completed|report-ready`.
* **HMS Nova**: `POST /provision` (tenantId, plan) → SSO‑link.

---

## 22) Kortproduksjon – tekniske spesifikasjoner

* **Format**: ISO/IEC 7810 ID‑1 (85.60×53.98 mm). Sikker marg 3 mm.
* **Filer**: PDF/X‑1a eller høyoppløst PDF, 300 DPI. Separate layers for data/kunst.
* **Koder**: QR med `https://…/verify/{code}`; valgfri Code‑128 strekkode for intern logistikk.
* **Personvern**: Minimal synlig PII på kort; tydelig gyldig‑til dato.

---

## 23) Drift & observability

* **Monitoring**: Metrix (Prometheus/OpenTelemetry), alarmer på kø‑etterslep, feilrate, DB‑latens.
* **Backups**: Daglig full + 15‑min binlog; test restore månedlig (game day).
* **RTO/RPO**: 4h/15m.
* **IaC**: Terraform for DB, lagring, kø, secrets.

---

## 24) Migrasjoner & dataflyt

* **Prisma Migrate** med tydelig versjonslogg.
* **Seed**: Demo‑tenant, testdata for kurs/sesjoner/personer.
* **Import/Export**: CSV‑maler; import‑assistent med validering og tørkekjøring (dry‑run).

---

## 25) Tilgjengelighet & i18n

* Skjermleser‑etiketter, tastaturnavigasjon, kontraster, fokusstyring.
* Dato/klokkeslett og tallformat etter locale; oversettelser via i18next.

---

## 26) Lisensiering & betaling (SaaS)

* **Planer**: Basic/Pro/Enterprise med kvoter (aktive kurs, brukere, API‑kall).
* **Billing**: Stripe (subscriptions + metered for kort/PDF), faktura EHF (senere).
* **Feature‑flags**: Per plan (CRM, kort, BHT, integrasjoner).

---

## 27) Teststrategi

* **Unit** (Vitest) for domene/mappere.
* **Contract‑tester** for webhooks og API‑klienter.
* **E2E** (Playwright) for påmelding→dokument→verifikasjon.
* **Sikkerhetstester**: RBAC‑gates, tenant‑lekkasje, rate‑limit.

---

## 28) Dokumentasjon & support

* "Admin‑håndbok" (onboarding tenant), instruktørguide, person/kandidat‑FAQ.
* Endringslogg (semver), status‑side, meldingsmaler for hendelser.
