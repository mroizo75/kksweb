/** Eldre inngang for faktura fra påmelding. Selve utsendingen skjer fra admin under Faktura. */

export async function createInvoiceForEnrollment(_enrollmentId: string) {
  return {
    success: false,
    message: "Bruk Faktura i admin for å sende faktura via Fiken",
  };
}

export async function createInvoiceForCompany(_companyId: string, _enrollmentIds: string[]) {
  return {
    success: false,
    message: "Bruk Faktura i admin for å sende faktura via Fiken",
  };
}

export async function getInvoiceStatus(_invoiceId: number) {
  return {
    status: "unknown",
    message: "Bruk Faktura i admin for å se fakturaer fra Fiken",
  };
}
