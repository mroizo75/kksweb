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

/** Machine tier pricing — used for multi-machine courses (M1–M6) */
export interface MachinePriceTier {
  count: number;
  price: number;
}

export interface MachineMultiSelectAddOn {
  type: "machine_multi_select";
  title: string;
  description?: string;
  options: string[];
  priceTiers: MachinePriceTier[];
}

const machinePriceTierSchema = z.object({
  count: z.number().int().min(1),
  price: z.number().int().min(0),
});

const machineMultiSelectSchema = z.object({
  type: z.literal("machine_multi_select"),
  title: z.string().min(2),
  description: z.string().optional(),
  options: z.array(z.string()).min(1).max(10),
  priceTiers: z.array(machinePriceTierSchema).min(1).max(10),
});

export type MachineMultiSelectAddOnInput = z.infer<typeof machineMultiSelectSchema>;

/** Union type for all add-on shapes stored in bookingAddOns JSON */
export type CourseAddOnConfig =
  | BookingAddOn
  | MachineMultiSelectAddOn;

const courseAddOnConfigSchema = z.union([
  bookingAddOnSchema,
  machineMultiSelectSchema,
]);

const courseAddOnConfigArraySchema = z.array(courseAddOnConfigSchema).max(20);

export interface EnrollmentPricing {
  baseUnitPrice: number;
  addOnUnitPrice: number;
  machinePrice: number;
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

/**
 * Parse all add-on configurations including machine_multi_select types.
 * Falls back to an empty array on any parse error.
 */
export function parseCourseAddOnConfigs(rawValue: unknown): CourseAddOnConfig[] {
  const parsed = courseAddOnConfigArraySchema.safeParse(rawValue);
  if (!parsed.success) {
    return [];
  }
  return parsed.data as CourseAddOnConfig[];
}

/**
 * Extract only the machine_multi_select config from an add-ons array, if present.
 */
export function getMachineMultiSelectConfig(
  addOnConfigs: CourseAddOnConfig[]
): MachineMultiSelectAddOn | null {
  const found = addOnConfigs.find(
    (a): a is MachineMultiSelectAddOn => (a as MachineMultiSelectAddOn).type === "machine_multi_select"
  );
  return found ?? null;
}

/**
 * Calculate price for a given number of machines selected using tier pricing.
 * Chooses the tier whose `count` is >= the number of selected machines, or
 * falls back to the highest tier for over-quota selections.
 */
export function calculateMachinePrice(
  selectedCount: number,
  priceTiers: MachinePriceTier[]
): number {
  if (selectedCount === 0) return 0;
  const sorted = [...priceTiers].sort((a, b) => a.count - b.count);
  const tier = sorted.find((t) => t.count >= selectedCount) ?? sorted[sorted.length - 1];
  return tier?.price ?? 0;
}

export function calculateEnrollmentPricing(
  baseUnitPrice: number,
  selectedAddOnIds: string[],
  availableAddOns: BookingAddOn[],
  participantCount: number,
  machinePrice = 0
): EnrollmentPricing {
  if (participantCount < 1) {
    throw new Error("participant_count_must_be_positive");
  }

  const selectedIdSet = new Set(selectedAddOnIds);
  const selectedAddOnTotal = availableAddOns
    .filter((addOn) => selectedIdSet.has(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);

  const unitTotal = baseUnitPrice + selectedAddOnTotal + machinePrice;

  return {
    baseUnitPrice,
    addOnUnitPrice: selectedAddOnTotal,
    machinePrice,
    unitTotal,
    participantCount,
    totalPrice: unitTotal * participantCount,
  };
}
