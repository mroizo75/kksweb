import { z } from "zod";

export const bookingAddOnSchema = z.object({
  id: z.string().min(1, "Tillegg må ha id"),
  title: z.string().min(2, "Navn på tillegg må være minst 2 tegn"),
  description: z.string().max(180, "Beskrivelse kan maks være 180 tegn").optional(),
  image: z
    .string()
    .max(500, "Bilde-URL er for lang")
    .optional()
    .or(z.literal("")),
  price: z.number().int().min(0, "Pris kan ikke være negativ"),
});

export const bookingAddOnArraySchema = z.array(bookingAddOnSchema).max(20);

export type BookingAddOn = z.infer<typeof bookingAddOnSchema>;

export interface EnrollmentPricing {
  baseUnitPrice: number;
  addOnUnitPrice: number;
  unitTotal: number;
  participantCount: number;
  totalPrice: number;
}

export function parseCourseBookingAddOns(rawValue: unknown): BookingAddOn[] {
  const parsed = bookingAddOnArraySchema.safeParse(rawValue);

  if (!parsed.success) {
    return [];
  }

  return parsed.data;
}

export function calculateEnrollmentPricing(
  baseUnitPrice: number,
  selectedAddOnIds: string[],
  availableAddOns: BookingAddOn[],
  participantCount: number
): EnrollmentPricing {
  if (participantCount < 1) {
    throw new Error("participant_count_must_be_positive");
  }

  const selectedIdSet = new Set(selectedAddOnIds);
  const selectedAddOnTotal = availableAddOns
    .filter((addOn) => selectedIdSet.has(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);

  const unitTotal = baseUnitPrice + selectedAddOnTotal;

  return {
    baseUnitPrice,
    addOnUnitPrice: selectedAddOnTotal,
    unitTotal,
    participantCount,
    totalPrice: unitTotal * participantCount,
  };
}
