import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Opprett kun admin bruker
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@kkskurs.no" },
    update: {},
    create: {
      email: "admin@kkskurs.no",
      name: "Admin Bruker",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Opprett instruktør
  const instructorPassword = await bcrypt.hash("instructor123", 10);
  
  const instructor = await prisma.user.upsert({
    where: { email: "instruktor@kkskurs.no" },
    update: {},
    create: {
      email: "instruktor@kkskurs.no",
      name: "Kari Instruktør",
      hashedPassword: instructorPassword,
      role: "INSTRUCTOR",
    },
  });

  console.log("Created instructor user:", instructor.email);

  // CRM Testdata

  // Opprett noen Leads
  const lead1 = await prisma.lead.create({
    data: {
      name: "Ola Nordmann",
      email: "ola@example.com",
      phone: "12345678",
      companyName: "Nordmann AS",
      source: "Nettside",
      status: "NEW",
      assignedToId: admin.id,
      notes: "Interessert i førstehjelpskurs for 10 personer",
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: "Kari Hansen",
      email: "kari@bedrift.no",
      phone: "98765432",
      companyName: "Hansen Bygg AS",
      source: "Telefon",
      status: "CONTACTED",
      assignedToId: instructor.id,
      notes: "Ringte og spurte om HMS-kurs",
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      name: "Per Olsen",
      email: "per@firma.no",
      companyName: "Olsen Transport",
      source: "E-post",
      status: "QUALIFIED",
      assignedToId: admin.id,
    },
  });

  console.log(`Created ${3} leads`);

  // Opprett noen Deals
  const deal1 = await prisma.deal.create({
    data: {
      title: "Førstehjelpskurs for Nordmann AS",
      value: 35000,
      stage: "QUALIFIED",
      probability: 70,
      expectedCloseDate: new Date("2025-11-15"),
      assignedToId: admin.id,
      notes: "10 deltakere, ønsker kurs i november",
    },
  });

  const deal2 = await prisma.deal.create({
    data: {
      title: "HMS-opplæring Hansen Bygg",
      value: 50000,
      stage: "PROPOSAL",
      probability: 50,
      expectedCloseDate: new Date("2025-12-01"),
      assignedToId: instructor.id,
    },
  });

  const deal3 = await prisma.deal.create({
    data: {
      title: "Årlig HMS-avtale Olsen Transport",
      value: 120000,
      stage: "NEGOTIATION",
      probability: 80,
      expectedCloseDate: new Date("2025-11-30"),
      assignedToId: admin.id,
    },
  });

  console.log(`Created ${3} deals`);

  // Opprett noen Activities
  await prisma.activity.create({
    data: {
      type: "TASK",
      subject: "Følg opp Nordmann AS",
      description: "Ring og bekreft interesse for november-kurs",
      status: "PENDING",
      dueDate: new Date("2025-10-20"),
      dealId: deal1.id,
      assignedToId: admin.id,
      createdById: admin.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "CALL",
      subject: "Samtale med Kari Hansen",
      description: "Diskuterte HMS-behov og kursdatoer",
      status: "COMPLETED",
      completedAt: new Date(),
      leadId: lead2.id,
      createdById: instructor.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "EMAIL",
      subject: "Tilbud sendt til Olsen Transport",
      description: "Sendt tilbud på årlig HMS-avtale",
      status: "COMPLETED",
      emailTo: "per@firma.no",
      emailFrom: "admin@kkskurs.no",
      emailSentAt: new Date(),
      completedAt: new Date(),
      dealId: deal3.id,
      createdById: admin.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "MEETING",
      subject: "Møte med Hansen Bygg",
      description: "Presentasjon av HMS-kurs",
      status: "PENDING",
      dueDate: new Date("2025-10-25T10:00:00"),
      dealId: deal2.id,
      assignedToId: instructor.id,
      createdById: instructor.id,
    },
  });

  console.log(`Created ${4} activities`);

  // Opprett notater
  await prisma.note.create({
    data: {
      content: "Kunde ønsker fleksible datoer grunnet prosjektfremdrift",
      leadId: lead1.id,
      createdById: admin.id,
    },
  });

  await prisma.note.create({
    data: {
      content: "Veldig interessert, høy prioritet å følge opp",
      dealId: deal3.id,
      createdById: admin.id,
    },
  });

  console.log(`Created ${2} notes`);

  console.log("Seed completed with CRM data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
