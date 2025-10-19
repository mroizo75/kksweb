// TODO: Implementeres i Fase 2
// Fiken invoice helper functions

import { createFikenClient } from "./client";
import type { FikenInvoice } from "./types";

export async function createInvoiceForEnrollment(enrollmentId: string) {
  // TODO: Implementer i Fase 2
  // 1. Hent enrollment med relaterte data
  // 2. Bygg Fiken invoice object
  // 3. Send til Fiken API
  // 4. Lagre invoice-referanse i databasen
  
  console.log(`TODO: Create Fiken invoice for enrollment ${enrollmentId}`);
  
  return {
    success: false,
    message: "Fiken-integrasjon er ikke implementert ennå",
  };
}

export async function createInvoiceForCompany(
  companyId: string,
  enrollmentIds: string[]
) {
  // TODO: Implementer i Fase 2
  // Opprett samlet faktura for bedrift
  
  console.log(
    `TODO: Create Fiken invoice for company ${companyId} with enrollments`,
    enrollmentIds
  );
  
  return {
    success: false,
    message: "Fiken-integrasjon er ikke implementert ennå",
  };
}

export async function getInvoiceStatus(invoiceId: number) {
  // TODO: Implementer i Fase 2
  
  console.log(`TODO: Get invoice status from Fiken for invoice ${invoiceId}`);
  
  return {
    status: "unknown",
    message: "Fiken-integrasjon er ikke implementert ennå",
  };
}

