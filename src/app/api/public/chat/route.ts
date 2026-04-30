import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/chatbot-system-prompt";
import { getCourseCategoryLabel } from "@/lib/course-categories";
import { checkFormRateLimit, getApiRouteIp } from "@/lib/rate-limit";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

const actionSchema = z.array(
  z.object({
    type: z.enum(["enroll", "callback", "link", "quick_reply"]),
    label: z.string(),
    payload: z.string().optional(),
  })
);

async function buildCourseContext(): Promise<string> {
  try {
    const courses = await db.course.findMany({
      where: { published: true },
      select: {
        title: true,
        slug: true,
        category: true,
        price: true,
        durationDays: true,
        priceIncludes: true,
        targetAudience: true,
        validityYears: true,
        sessions: {
          where: {
            status: { in: ["OPEN", "DRAFT"] },
            startsAt: { gte: new Date() },
          },
          select: {
            id: true,
            status: true,
            startsAt: true,
            endsAt: true,
            location: true,
            capacity: true,
            _count: {
              select: {
                enrollments: {
                  where: { status: { notIn: ["CANCELLED"] } },
                },
              },
            },
          },
          orderBy: { startsAt: "asc" },
          take: 6,
        },
      },
      orderBy: { title: "asc" },
    });

    if (courses.length === 0) {
      return "Ingen publiserte kurs tilgjengelig akkurat nå. Henvis til telefon +47 91 54 08 24.";
    }

    const lines = courses.map((course) => {
      const categoryLabel = getCourseCategoryLabel(course.category);
      const priceStr =
        course.price > 0
          ? `${course.price.toLocaleString("nb-NO")} kr inkl. mva`
          : "Pris på forespørsel";
      const validityStr = course.validityYears
        ? `Gyldighet: ${course.validityYears} år.`
        : "";
      const includesStr = course.priceIncludes
        ? `Inkluderer: ${course.priceIncludes}.`
        : "";

      let sessionStr = "Ingen planlagte datoer ennå — tilby ring-meg.";

      if (course.sessions.length > 0) {
        const sessionLines = course.sessions.map((s) => {
          const available = s.capacity - s._count.enrollments;
          const statusNote = s.status === "DRAFT" ? " (planlagt, åpner snart)" : "";
          const startDate = s.startsAt.toLocaleDateString("nb-NO", {
            day: "numeric", month: "long", year: "numeric",
          });
          const endDate = s.endsAt.toLocaleDateString("nb-NO", {
            day: "numeric", month: "long", year: "numeric",
          });
          const dateRange = startDate === endDate ? startDate : `${startDate} – ${endDate}`;
          return `  - ${dateRange} i ${s.location}${statusNote} (${available} ledige plasser) [sessionId: ${s.id}]`;
        });
        sessionStr = `Kommende datoer:\n${sessionLines.join("\n")}`;
      }

      return `### ${course.title}
Kategori: ${categoryLabel} | Varighet: ${course.durationDays} dag(er) | Pris: ${priceStr}
${validityStr} ${includesStr}
Lenke: www.kksas.no/kurs/${course.slug}
${sessionStr}`;
    });

    return lines.join("\n\n");
  } catch (dbError) {
    // DB-feil skal ikke drepe hele chat-funksjonen
    console.error("[chat] buildCourseContext feilet:", dbError);
    return "Kursinformasjon midlertidig utilgjengelig. Henvis kunden til telefon +47 91 54 08 24 eller post@kksas.no for fullstendig kursliste.";
  }
}

function parseActionsFromReply(raw: string): {
  reply: string;
  actions?: z.infer<typeof actionSchema>;
} {
  const actionsMatch = raw.match(/ACTIONS:\s*(\[[\s\S]*?\])\s*$/);
  if (!actionsMatch) {
    return { reply: raw.trim() };
  }

  const reply = raw.slice(0, actionsMatch.index).trim();

  try {
    const parsed = JSON.parse(actionsMatch[1]);
    const actions = actionSchema.parse(parsed);
    return { reply, actions };
  } catch {
    return { reply: raw.trim() };
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[chat] OPENAI_API_KEY mangler i miljøvariabler");
      return NextResponse.json(
        { error: "Chat er midlertidig utilgjengelig" },
        { status: 503 }
      );
    }

    const ip = getApiRouteIp(req);
    const limit = checkFormRateLimit(ip, "chat");
    if (!limit.allowed) {
      return NextResponse.json(
        { error: limit.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages } = chatRequestSchema.parse(body);

    const courseContext = await buildCourseContext();
    const systemPrompt = buildSystemPrompt(courseContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      console.error("[chat] OpenAI returnerte tomt svar");
      return NextResponse.json({ error: "Fikk ingen respons" }, { status: 500 });
    }

    const { reply, actions } = parseActionsFromReply(raw);
    return NextResponse.json({ reply, actions });
  } catch (error) {
    console.error("[chat] Ukjent feil:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ugyldig forespørsel" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Noe gikk galt. Prøv igjen." },
      { status: 500 }
    );
  }
}
