import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Hent klient-IP
    const clientIp = getClientIp(request);

    // Parse request body først for å få lisenskode
    const body = await request.json();
    const { licenseKey, domain, appVersion } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { isValid: false, errorMessage: 'Mangler lisenskode' },
        { status: 400 }
      );
    }

    // Rate limiting basert på IP
    const ipRateLimit = await checkRateLimit(clientIp, 'ip');
    if (!ipRateLimit.allowed) {
      await logValidation({
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: `Rate limit overskredet: ${ipRateLimit.message}`,
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { isValid: false, errorMessage: ipRateLimit.message || 'For mange forsøk' },
        { status: 429 }
      );
    }

    // Rate limiting basert på lisenskode (maks 60 valideringer per time)
    const licenseRateLimit = await checkRateLimit(`license:${licenseKey}`, 'email');
    if (!licenseRateLimit.allowed) {
      await recordFailedAttempt(clientIp, 'ip');
      await logValidation({
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'For mange valideringsforsøk på denne lisensen',
        ipAddress: clientIp,
      });
      return NextResponse.json(
        { isValid: false, errorMessage: 'For mange valideringsforsøk på denne lisensen' },
        { status: 429 }
      );
    }

    // Hent authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      return NextResponse.json(
        { isValid: false, errorMessage: 'Mangler authorization header' },
        { status: 401 }
      );
    }

    const validationToken = authHeader.replace('Bearer ', '');

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
      // Registrer mislykket forsøk
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      
      // Logg validering (failed)
      await logValidation({
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisenskode ikke funnet',
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisenskode ikke funnet' },
        { status: 404 }
      );
    }

    // Sjekk validerings-token
    if (license.validationToken !== validationToken) {
      // Registrer mislykket forsøk
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      
      // Logg validering (failed)
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Ugyldig validerings-token',
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Ugyldig validerings-token' },
        { status: 401 }
      );
    }

    // Sjekk om lisensen er aktiv
    if (!license.isActive) {
      // Registrer mislykket forsøk
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisensen er deaktivert',
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisensen er deaktivert' },
        { status: 403 }
      );
    }

    // Sjekk utløpsdato
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      // Registrer mislykket forsøk
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: 'Lisensen har utløpt',
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { isValid: false, errorMessage: 'Lisensen har utløpt' },
        { status: 403 }
      );
    }

    // Sjekk domene (hvis spesifisert)
    if (license.allowedDomain && domain && license.allowedDomain !== domain) {
      // Registrer mislykket forsøk
      await recordFailedAttempt(clientIp, 'ip');
      await recordFailedAttempt(`license:${licenseKey}`, 'email');
      
      await logValidation({
        licenseId: license.id,
        licenseKey,
        isValid: false,
        domain,
        appVersion,
        errorMessage: `Lisensen er kun gyldig for domenet: ${license.allowedDomain}`,
        ipAddress: clientIp,
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

    // Reset rate limiting ved vellykket validering
    await resetRateLimit(clientIp);
    await resetRateLimit(`license:${licenseKey}`);

    // Logg suksessfull validering
    await logValidation({
      licenseId: license.id,
      licenseKey,
      isValid: true,
      domain,
      appVersion,
      ipAddress: clientIp,
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

