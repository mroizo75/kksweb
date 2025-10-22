"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import {
  generateProductLicenseKey,
  generateValidationToken,
  getFeaturePreset,
} from "@/lib/product-license-generator";

const productLicenseSchema = z.object({
  customerName: z.string().min(1, "Kundenavn er påkrevd"),
  customerEmail: z
    .string()
    .email("Ugyldig e-postadresse")
    .min(1, "E-post er påkrevd"),
  customerCompany: z.string().optional(),
  customerDomain: z.string().optional(),
  productName: z.string().min(1, "Produktnavn er påkrevd"),
  productVersion: z.string().optional(),
  expirationMonths: z.string().optional(),
  preset: z.enum(["BASIC", "STANDARD", "PREMIUM"]).optional(),
  maxUsers: z.string().optional(),
  maxBookingsPerMonth: z.string().optional(),
  allowedDomain: z.string().optional(),
  notes: z.string().optional(),
});

export async function createProductLicense(
  data: z.infer<typeof productLicenseSchema>
) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Valider input
    const validatedData = productLicenseSchema.parse(data);

    // Opprett eller finn kunde
    let customer = await db.productCustomer.findUnique({
      where: { email: validatedData.customerEmail },
    });

    if (!customer) {
      customer = await db.productCustomer.create({
        data: {
          name: validatedData.customerName,
          email: validatedData.customerEmail,
          company: validatedData.customerCompany || null,
          domain: validatedData.customerDomain || null,
        },
      });
    }

    // Generer lisenskode og token basert på produktnavn
    const productPrefix = validatedData.productName
      .toUpperCase()
      .replace(/\s+/g, "")
      .substring(0, 10);
    const licenseKey = generateProductLicenseKey(productPrefix);
    const validationToken = generateValidationToken();

    // Beregn utløpsdato
    let expiresAt = null;
    if (
      validatedData.expirationMonths &&
      parseInt(validatedData.expirationMonths) > 0
    ) {
      expiresAt = new Date();
      expiresAt.setMonth(
        expiresAt.getMonth() + parseInt(validatedData.expirationMonths)
      );
    }

    // Hent feature preset (default til STANDARD hvis ikke satt)
    const features = getFeaturePreset(
      validatedData.productName,
      validatedData.preset || "STANDARD"
    );

    // Opprett lisens
    const license = await db.productLicense.create({
      data: {
        licenseKey,
        validationToken,
        customerId: customer.id,
        productName: validatedData.productName,
        productVersion: validatedData.productVersion || null,
        isActive: true,
        expiresAt,
        features: JSON.stringify(features),
        maxUsers: validatedData.maxUsers
          ? parseInt(validatedData.maxUsers)
          : null,
        maxBookingsPerMonth: validatedData.maxBookingsPerMonth
          ? parseInt(validatedData.maxBookingsPerMonth)
          : null,
        allowedDomain: validatedData.allowedDomain || null,
        notes: validatedData.notes || null,
      },
      include: {
        customer: true,
      },
    });

    return { success: true, license };
  } catch (error) {
    console.error("Error creating product license:", error);

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    return { success: false, error: "Kunne ikke opprette produktlisens" };
  }
}

export async function toggleProductLicenseStatus(licenseId: string) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    // Hent lisensen
    const license = await db.productLicense.findUnique({
      where: { id: licenseId },
    });

    if (!license) {
      return { success: false, error: "Lisens ikke funnet" };
    }

    // Toggle status
    const updatedLicense = await db.productLicense.update({
      where: { id: licenseId },
      data: {
        isActive: !license.isActive,
      },
    });

    return { success: true, license: updatedLicense };
  } catch (error) {
    console.error("Error toggling product license status:", error);
    return { success: false, error: "Kunne ikke oppdatere lisensstatus" };
  }
}

export async function deleteProductLicense(licenseId: string) {
  try {
    const session = await auth();

    if (!session || (session.user as any).role !== "ADMIN") {
      return { success: false, error: "Ikke autorisert" };
    }

    await db.productLicense.delete({
      where: { id: licenseId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting product license:", error);
    return { success: false, error: "Kunne ikke slette produktlisens" };
  }
}

