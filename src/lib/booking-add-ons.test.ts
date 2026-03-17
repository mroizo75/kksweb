import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEnrollmentPricing,
  parseCourseBookingAddOns,
} from "@/lib/booking-add-ons";

test("calculateEnrollmentPricing computes total with selected add-ons", () => {
  const pricing = calculateEnrollmentPricing(
    5000,
    ["practice", "machine"],
    [
      { id: "practice", title: "Praksis", price: 1500 },
      { id: "machine", title: "Maskin", price: 900 },
      { id: "exam", title: "Eksamen", price: 700 },
    ],
    2
  );

  assert.equal(pricing.baseUnitPrice, 5000);
  assert.equal(pricing.addOnUnitPrice, 2400);
  assert.equal(pricing.unitTotal, 7400);
  assert.equal(pricing.totalPrice, 14800);
});

test("parseCourseBookingAddOns returns empty list for invalid data", () => {
  const parsed = parseCourseBookingAddOns([
    { id: "ok", title: "Gyldig", price: 300 },
    { id: "bad", title: "Ugyldig", price: -10 },
  ]);

  assert.deepEqual(parsed, []);
});
