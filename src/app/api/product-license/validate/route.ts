import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Hent authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { isValid: false, errorMessage: 'Mangler authorization header' },
        { status: 401 }
      );
    }

    const validationToken = authHeader.replace('Bearer ', '');

    // Parse request body
    const body = await request.json();
    const { licenseKey, domain, appVersion } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { isValid: false, errorMessage: 'Mangler lisenskode' },
        { status: 400 }
      );
    }

    // Hent lisens fra database
    const license = await db.productLicense.findUnique({
      where: { licenseKey },
      include: {
        customer: {
          select: {
            name: true,
            domain: true,
          },
        },
      },
    });

    if (!license) {
      // Logg validering (failed)
      await logValidation({
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisenskode ikke funnet',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisenskode ikke funnet' },
        { status: 404 }
      );
    }

    // Sjekk validerings-token
    if (license.validationToken !== validationToken) {
      // Logg validering (failed)
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Ugyldig validerings-token',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Ugyldig validerings-token' },
        { status: 401 }
      );
    }

    // Sjekk om lisensen er aktiv
    if (!license.isActive) {
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisensen er deaktivert',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisensen er deaktivert' },
        { status: 403 }
      );
    }

    // Sjekk utløpsdato
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisensen har utløpt',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisensen har utløpt' },
        { status: 403 }
      );
    }

    // Sjekk domene (hvis spesifisert)
    if (license.allowedDomain && domain && license.allowedDomain !== domain) {
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: `Lisensen er kun gyldig for domenet: ${license.allowedDomain}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      return NextResponse.json(
        { 
          isValid: false, 
          errorMessage: `Lisensen er kun gyldig for domenet: ${license.allowedDomain}` 
        },
        { status: 403 }
      );
    }

    // Parse features fra JSON
    let features;
    try {
      features = JSON.parse(license.features);
    } catch (error) {
      features = {};
    }

    // Legg til maxUsers og maxBookingsPerMonth i features
    if (license.maxUsers) {
      features.maxUsers = license.maxUsers;
    }
    if (license.maxBookingsPerMonth) {
      features.maxBookingsPerMonth = license.maxBookingsPerMonth;
    }

    // Logg suksessfull validering
    await logValidation({
      licenseId: license.id,
      licenseKey,
      isValid: true,
      domain,
      appVersion,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    // Oppdater activatedAt hvis ikke satt
    if (!license.activatedAt) {
      await db.productLicense.update({
        where: { id: license.id },
        data: { activatedAt: new Date() },
      });
    }

    // Returner gyldig respons
    return NextResponse.json({
      isValid: true,
      expiresAt: license.expiresAt?.toISOString() || null,
      features,
      customerName: license.customer.name,
      customerDomain: license.customer.domain,
      productName: license.productName,
    });

  } catch (error) {
    console.error('Product license validation error:', error);
    return NextResponse.json(
      { isValid: false, errorMessage: 'Server feil' },
      { status: 500 }
    );
  }
}

// Helper function for logging
async function logValidation(data: {
  licenseId?: string;
  licenseKey: string;
  isValid: boolean;
  domain?: string;
  appVersion?: string;
  errorMessage?: string;
  ipAddress?: string | null;
}) {
  try {
    // Hvis vi har licenseId, bruk den
    if (data.licenseId) {
      await db.productLicenseValidation.create({
        data: {
          licenseId: data.licenseId,
          isValid: data.isValid,
          domain: data.domain,
          appVersion: data.appVersion,
          errorMessage: data.errorMessage,
          ipAddress: data.ipAddress,
        },
      });
    }
    // Ellers, bare logg til console (lisensen finnes ikke)
    else {
      console.log('Product license validation attempt:', {
        licenseKey: data.licenseKey.substring(0, 10) + '...',
        isValid: data.isValid,
        errorMessage: data.errorMessage,
      });
    }
  } catch (error) {
    console.error('Error logging validation:', error);
  }
}

