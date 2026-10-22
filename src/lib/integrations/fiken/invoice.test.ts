import assert from "node:assert/strict";
import test from "node:test";
import { buildAuthorizeUrl, parseTokenResponse } from "./oauth";
import { buildFikenInvoiceRequest } from "./invoice";
import { decryptSecret, encryptSecret } from "./secrets";
import { fikenMessage, idFromLocation, toContactSummary } from "./map";
import { InvoiceInputError, lineAmounts, nokToOre, parseQuantity } from "./money";
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
