# KKS Kurs & HMS - MVP

Et moderne kurssystem for profesjonell kursvirksomhet med fokus på rask og intuitiv brukeropplevelse.

## Funksjoner (Fase 1 MVP)

### Publikumssider
- 🏠 Moderne landingsside med kategorioversikt
- 📚 Kurskatalog med filtrering
- 📝 Enkel påmeldingsflyt (privatperson/bedrift)
- ✉️ Automatisk e-postbekreftelse

### Admin-panel
- 📊 Dashboard med nøkkeltall
- 📖 Kursadministrasjon
- 📅 Sesjonsplanlegging
- 👥 Påmeldingsoversikt
- 🏢 Kunde- og bedriftshåndtering

### Teknisk stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MySQL + Prisma ORM
- **Autentisering**: NextAuth.js
- **UI**: shadcn/ui + Tailwind CSS v4
- **E-post**: Resend + React Email
- **Validering**: Zod + React Hook Form

## Kom i gang

### Forutsetninger
- Node.js 18+ 
- MySQL database
- Resend API-nøkkel (for e-post)

### Installasjon

1. **Klon prosjektet**
```bash
git clone <repo-url>
cd kksweb
```

2. **Installer dependencies**
```bash
npm install
```

3. **Konfigurer miljøvariabler**

Kopier `env.example` til `.env` og fyll inn:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/kkskurs"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generer-med-openssl-rand-base64-32"

# Resend (E-post)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="kurs@kkskurs.no"
```

4. **Sett opp database**

```bash
# Push database schema
npm run db:push

# Seed testdata
npm run db:seed
```

5. **Start utviklingsserver**

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Testbrukere

Etter seeding er følgende brukere tilgjengelige:

**Admin:**
- E-post: `admin@kkskurs.no`
- Passord: `admin123`

**Instruktør:**
- E-post: `instruktor@kkskurs.no`
- Passord: `instructor123`

## Database-kommandoer

```bash
# Push schema endringer til database
npm run db:push

# Åpne Prisma Studio (database GUI)
npm run db:studio

# Kjør seed-script
npm run db:seed
```

## Mappestruktur

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Publikumssider (landing, kurs)
│   ├── admin/             # Admin-panel
│   ├── api/               # API routes
│   └── actions/           # Server Actions
├── components/            # React-komponenter
│   ├── ui/               # shadcn/ui komponenter
│   └── admin/            # Admin-spesifikke komponenter
├── lib/                   # Utilities og konfigurasjon
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # NextAuth config
│   ├── email.ts          # E-post service
│   ├── validations/      # Zod schemas
│   └── integrations/     # Fiken & Bransjekurs (stubs)
├── emails/               # React Email templates
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Seed-script
```

## Fase 2 - Planlagt funksjonalitet

Følgende funksjoner er forberedt som stubs og skal implementeres i Fase 2:

- 📄 Dokumentgenerering (PDF diplom/kursbevis)
- 💰 Automatisk Fiken-fakturering
- 📈 Full CRM (leads, deals, activities)
- 🔗 Bransjekurs.no API-import
- 🔔 Fornyelsespåminnelser (6 mnd før utløp)

## Utvikling

### Legge til nye shadcn/ui komponenter

```bash
npx shadcn@latest add <component-name>
```

### Database schema endringer

1. Oppdater `prisma/schema.prisma`
2. Kjør `npm run db:push`
3. Generer ny Prisma client: `npx prisma generate`

## Deployment

### Build for produksjon

```bash
npm run build
npm start
```

### Miljøvariabler i produksjon

Sørg for at følgende miljøvariabler er satt:

- `DATABASE_URL` - MySQL connection string
- `NEXTAUTH_URL` - Full URL til applikasjonen
- `NEXTAUTH_SECRET` - Sterk secret for JWT
- `RESEND_API_KEY` - Resend API-nøkkel
- `RESEND_FROM_EMAIL` - Avsender e-postadresse

## Lisens

Proprietær - KKS Kurs & HMS

## Support

For spørsmål eller problemer, kontakt utviklingsteamet.
