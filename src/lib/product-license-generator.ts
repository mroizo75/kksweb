import crypto from 'crypto';

/**
 * Generer en unik lisenskode for produkter
 */
export function generateProductLicenseKey(productPrefix: string = 'SVAMPEN'): string {
  const year = new Date().getFullYear();
  const randomPart1 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const randomPart2 = crypto.randomBytes(4).toString('hex').toUpperCase();
  const randomPart3 = crypto.randomBytes(4).toString('hex').toUpperCase();
  
  return `${productPrefix}-${year}-${randomPart1}-${randomPart2}-${randomPart3}`;
}

/**
 * Generer et validerings-token
 */
export function generateValidationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Standard feature flags for Svampen Booking System
 */
export const SVAMPEN_DEFAULT_FEATURES = {
  smsNotifications: true,
  emailNotifications: true,
  invoicing: true,
  multiVehicleBooking: true,
  adminDashboard: true,
  reporting: true,
  calendarView: true,
  customBranding: false,
};

/**
 * Feature presets for Svampen
 */
export const SVAMPEN_FEATURE_PRESETS = {
  BASIC: {
    smsNotifications: false,
    emailNotifications: true,
    invoicing: false,
    multiVehicleBooking: true,
    adminDashboard: true,
    reporting: false,
    calendarView: true,
    customBranding: false,
  },
  STANDARD: {
    smsNotifications: true,
    emailNotifications: true,
    invoicing: true,
    multiVehicleBooking: true,
    adminDashboard: true,
    reporting: true,
    calendarView: true,
    customBranding: false,
  },
  PREMIUM: {
    smsNotifications: true,
    emailNotifications: true,
    invoicing: true,
    multiVehicleBooking: true,
    adminDashboard: true,
    reporting: true,
    calendarView: true,
    customBranding: true,
  },
};

/**
 * Feature presets for TaskGuild
 */
export const TASKGUILD_FEATURE_PRESETS = {
  BASIC: {
    taskManagement: true,
    timeTracking: false,
    invoicing: false,
    reporting: false,
    teamCollaboration: true,
    mobileApp: true,
  },
  STANDARD: {
    taskManagement: true,
    timeTracking: true,
    invoicing: true,
    reporting: true,
    teamCollaboration: true,
    mobileApp: true,
  },
  PREMIUM: {
    taskManagement: true,
    timeTracking: true,
    invoicing: true,
    reporting: true,
    teamCollaboration: true,
    mobileApp: true,
    apiAccess: true,
    customBranding: true,
  },
};

/**
 * Hent feature preset basert på produkt og nivå
 */
export function getFeaturePreset(productName: string, preset: 'BASIC' | 'STANDARD' | 'PREMIUM') {
  if (productName.toLowerCase().includes('svampen')) {
    return SVAMPEN_FEATURE_PRESETS[preset];
  } else if (productName.toLowerCase().includes('taskguild')) {
    return TASKGUILD_FEATURE_PRESETS[preset];
  }
  
  // Default til Svampen
  return SVAMPEN_FEATURE_PRESETS[preset];
}

