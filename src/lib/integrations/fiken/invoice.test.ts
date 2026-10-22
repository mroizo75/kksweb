import assert from "node:assert/strict";
import test from "node:test";
import { buildAuthorizeUrl, parseTokenResponse } from "./oauth";
import { buildFikenInvoiceRequest } from "./invoice";
import { fikenPageForNewestView, newestFirstInvoices } from "./invoice-order";
import { decryptSecret, encryptSecret } from "./secrets";
import { fikenMessage, idFromLocation, toContactSummary, toProductSummary, defaultReceivingAccount } from "./map";
import { InvoiceInputError, lineAmounts, nokToOre, parseQuantity, vatTypeForAccount } from "./money";
import { buildSendInvoiceRequest } from "./send";

test("nokToOre leser norske beløp som heltall i øre", () => {
  assert.equal(nokToOre("1 250,50"), 125050);
  assert.equal(nokToOre("99"), 9900);
});

test("nokToOre avviser negative og tomme beløp", () => {
  assert.throws(() => nokToOre("0"), InvoiceInputError);
  assert.throws(() => nokToOre("-10"), InvoiceInputError);
  assert.throws(() => nokToOre("1.234,50"), InvoiceInputError);
});

test("nokToOre godtar rabatt som negativt beløp", () => {
  assert.equal(nokToOre("-200", { allowNegative: true }), -20000);
  assert.equal(nokToOre("-200,50", { allowNegative: true }), -20050);
  const discount = lineAmounts(-20_000, 1, "HIGH");
  assert.deepEqual(discount, { netOre: -20_000, vatOre: -5_000, grossOre: -25_000 });
});

test("lineAmounts trekker fra rabatt i prosent", () => {
  const amounts = lineAmounts(100_000, 1, "HIGH", 10);
  assert.deepEqual(amounts, { netOre: 90_000, vatOre: 22_500, grossOre: 112_500 });
});

test("lineAmounts regner 25 prosent mva av netto", () => {
  const amounts = lineAmounts(10_000, 2, "HIGH");
  assert.deepEqual(amounts, { netOre: 20_000, vatOre: 5_000, grossOre: 25_000 });
});

test("buildFikenInvoiceRequest krever forfall etter fakturadato", () => {
  assert.throws(
    () =>
      buildFikenInvoiceRequest({
        customerId: 10,
        issueDate: "2026-10-21",
        dueDate: "2026-10-01",
        bankAccountCode: "1920:10001",
        ourReference: "Kari",
        lines: [
          {
            description: "Kurs",
            quantity: 1,
            unitPriceOre: 10000,
            vatType: "HIGH",
            incomeAccount: "3000",
          },
        ],
      }),
    InvoiceInputError
  );
});

test("buildFikenInvoiceRequest sender netto enhetspris i øre", () => {
  const request = buildFikenInvoiceRequest({
    customerId: 10,
    issueDate: "2026-10-21",
    dueDate: "2026-11-04",
    bankAccountCode: "1920:10001",
    ourReference: "Kari",
    lines: [
      {
        description: "Stillas",
        quantity: parseQuantity("1,5"),
        unitPriceOre: nokToOre("800"),
        vatType: "HIGH",
        incomeAccount: "3000",
        productId: 44,
      },
    ],
  });

  assert.equal(request.lines[0]?.unitPrice, 80000);
  assert.equal(request.lines[0]?.quantity, 1.5);
  assert.equal(request.lines[0]?.productId, 44);
  assert.equal(request.cash, false);
});

test("buildFikenInvoiceRequest trekker fra rabattlinje", () => {
  const request = buildFikenInvoiceRequest({
    customerId: 10,
    issueDate: "2026-10-21",
    dueDate: "2026-11-04",
    bankAccountCode: "1920:10001",
    ourReference: "Kari",
    lines: [
      {
        description: "Kurs",
        quantity: 1,
        unitPriceOre: 100000,
        vatType: "HIGH",
        incomeAccount: "3000",
      },
      {
        description: "Rabatt",
        quantity: 1,
        unitPriceOre: nokToOre("-200", { allowNegative: true }),
        vatType: "HIGH",
        incomeAccount: "3000",
      },
    ],
  });

  assert.equal(request.lines[1]?.unitPrice, -20000);
  assert.throws(
    () =>
      buildFikenInvoiceRequest({
        customerId: 10,
        issueDate: "2026-10-21",
        dueDate: "2026-11-04",
        bankAccountCode: "1920:10001",
        ourReference: "Kari",
        lines: [
          {
            description: "Rabatt",
            quantity: 1,
            unitPriceOre: -100,
            vatType: "HIGH",
            incomeAccount: "3000",
          },
        ],
      }),
    InvoiceInputError
  );
});

test("idFromLocation leser siste tall i Location-headeren", () => {
  assert.equal(
    idFromLocation("https://api.fiken.no/api/v2/companies/kks/contacts/2747365"),
    2747365
  );
  assert.equal(idFromLocation(null), null);
});

test("buildSendInvoiceRequest legger til EHF når bedriften skal ha det", () => {
  const both = buildSendInvoiceRequest({
    invoiceId: 12,
    delivery: "email_and_ehf",
    recipientName: "Nord AS",
    recipientEmail: "post@nord.no",
    message: "Faktura",
  });
  assert.deepEqual(both.method, ["email", "ehf"]);
  assert.equal(both.recipientEmail, "post@nord.no");

  const ehf = buildSendInvoiceRequest({
    invoiceId: 12,
    delivery: "ehf",
    recipientName: "Nord AS",
  });
  assert.deepEqual(ehf.method, ["ehf"]);
  assert.equal(ehf.recipientEmail, undefined);
});

test("fikenMessage og kontaktmapping tåler ufullstendige svar", () => {
  assert.equal(fikenMessage([{ message: "Mangler konto" }], "feil"), "Mangler konto");
  assert.equal(toContactSummary({ contactId: 1, name: "  Nord AS  ", email: "a@b.no" })?.name, "Nord AS");
  assert.equal(toContactSummary({ contactId: 1, name: " " }), null);
});

test("buildAuthorizeUrl sender brukeren til Fiken med redirect", () => {
  const url = new URL(
    buildAuthorizeUrl({
      clientId: "client-1",
      redirectUri: "http://localhost:3000/api/admin/fiken/callback",
      state: "state-1",
    })
  );
  assert.equal(url.origin + url.pathname, "https://fiken.no/oauth/authorize");
  assert.equal(url.searchParams.get("redirect_uri"), "http://localhost:3000/api/admin/fiken/callback");
  assert.equal(url.searchParams.get("client_id"), "client-1");
});

test("parseTokenResponse og kryptering beholder token", () => {
  process.env.AUTH_SECRET = "test-secret";
  const token = parseTokenResponse({
    access_token: "access",
    refresh_token: "refresh",
    expires_in: 3600,
  });
  assert.equal(decryptSecret(encryptSecret(token.refreshToken)), "refresh");
  assert.throws(() => parseTokenResponse({ error_description: "Ugyldig kode" }));
});

test("innbetaling går til driftskonto", () => {
  const code = defaultReceivingAccount([
    { name: "Skattetrekk", accountCode: "1950:10001", bankAccountNumber: "111", type: "tax_deduction" },
    { name: "Driftskonto", accountCode: "1920:10002", bankAccountNumber: "222", type: "normal" },
  ]);
  assert.equal(code, "1920:10002");
});

test("varer fra Fiken beholder utenfor som mva-kode", () => {
  const outside = toProductSummary({
    productId: 1,
    name: "Kurs",
    unitPrice: 100_000,
    incomeAccount: "3220",
    vatType: "outside",
  });
  assert.equal(outside?.vatType, "OUTSIDE");

  const fromAccount = toProductSummary({
    productId: 2,
    name: "Overnatting",
    incomeAccount: "3050",
  });
  assert.equal(fromAccount?.vatType, "LOW");
});

test("konto 3220 sender unntatt mva", () => {
  assert.equal(vatTypeForAccount("EXEMPT", "3220"), "OUTSIDE");
  assert.equal(vatTypeForAccount("HIGH", "3000"), "HIGH");
  const request = buildFikenInvoiceRequest({
    customerId: 10,
    issueDate: "2026-10-22",
    dueDate: "2026-11-05",
    bankAccountCode: "1920:10001",
    ourReference: "Test",
    lines: [
      {
        description: "Kurs",
        quantity: 1,
        unitPriceOre: 100_000,
        vatType: "EXEMPT",
        incomeAccount: "3220",
      },
    ],
  });
  assert.equal(request.lines[0]?.vatType, "OUTSIDE");
});

test("nyeste faktura kommer først", () => {
  assert.equal(fikenPageForNewestView(4, 0), 3);
  assert.equal(fikenPageForNewestView(4, 1), 2);
  assert.equal(fikenPageForNewestView(1, 0), 0);
  assert.equal(fikenPageForNewestView(4, 4), null);

  const ordered = newestFirstInvoices([
    { invoiceId: 1, invoiceNumber: 100, issueDate: "2026-01-01" },
    { invoiceId: 3, invoiceNumber: 102, issueDate: "2026-03-01" },
    { invoiceId: 2, invoiceNumber: 101, issueDate: "2026-03-01" },
  ]);
  assert.deepEqual(
    ordered.map((invoice) => invoice.invoiceId),
    [3, 2, 1]
  );
});
