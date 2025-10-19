// TODO: Implementeres i Fase 2
// TypeScript types for Bransjekurs.no API

export interface BransjekursParticipant {
  externalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string;
}

export interface BransjekursCourse {
  courseCode: string;
  courseName: string;
  category: string;
}

export interface BransjekursResult {
  externalId: string;
  participant: BransjekursParticipant;
  course: BransjekursCourse;
  completedAt: string;
  score?: number;
  passed: boolean;
  certificateUrl?: string;
}

export interface BransjekursWebhookPayload {
  event: "course.completed" | "course.failed" | "course.updated";
  timestamp: string;
  result: BransjekursResult;
}

