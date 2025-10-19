-- Legg til lisenssystem for bedrifter
-- Dette lar KKS styre tilgang på bedriftsnivå

-- Først, legg til lisens-felter på Company
ALTER TABLE `companies` 
ADD COLUMN `licenseStatus` ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'TRIAL') DEFAULT 'TRIAL',
ADD COLUMN `licenseStartDate` DATETIME NULL,
ADD COLUMN `licenseEndDate` DATETIME NULL,
ADD COLUMN `gracePeriodDays` INT DEFAULT 14,
ADD COLUMN `maxUsers` INT NULL,
ADD COLUMN `suspendedAt` DATETIME NULL,
ADD COLUMN `suspendedReason` TEXT NULL,
ADD COLUMN `notes` TEXT NULL;

-- Opprett License-tabell for historikk og fakturaer
CREATE TABLE `licenses` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  
  -- Lisensinfo
  `status` ENUM('ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED', 'TRIAL') NOT NULL DEFAULT 'TRIAL',
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `gracePeriodDays` INT NOT NULL DEFAULT 14,
  
  -- Begrensninger
  `maxUsers` INT NULL,
  `maxEnrollments` INT NULL,
  
  -- Pris
  `monthlyPrice` DECIMAL(10, 2) NULL,
  `annualPrice` DECIMAL(10, 2) NULL,
  
  -- Metadata
  `suspendedAt` DATETIME NULL,
  `suspendedBy` VARCHAR(191) NULL,
  `suspendedReason` TEXT NULL,
  `cancelledAt` DATETIME NULL,
  `cancelledBy` VARCHAR(191) NULL,
  `cancelledReason` TEXT NULL,
  `notes` TEXT NULL,
  
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  INDEX `licenses_companyId_idx` (`companyId`),
  INDEX `licenses_status_idx` (`status`),
  INDEX `licenses_endDate_idx` (`endDate`),
  
  CONSTRAINT `licenses_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Opprett LicenseActivity-tabell for audit log
CREATE TABLE `license_activities` (
  `id` VARCHAR(191) NOT NULL,
  `licenseId` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  
  `action` ENUM('CREATED', 'RENEWED', 'SUSPENDED', 'RESUMED', 'CANCELLED', 'EXPIRED', 'EXTENDED') NOT NULL,
  `performedBy` VARCHAR(191) NULL,
  `reason` TEXT NULL,
  `metadata` JSON NULL,
  
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  INDEX `license_activities_licenseId_idx` (`licenseId`),
  INDEX `license_activities_companyId_idx` (`companyId`),
  INDEX `license_activities_createdAt_idx` (`createdAt`),
  
  CONSTRAINT `license_activities_licenseId_fkey` FOREIGN KEY (`licenseId`) REFERENCES `licenses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `license_activities_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Indekser for ytelse
CREATE INDEX `companies_licenseStatus_idx` ON `companies` (`licenseStatus`);
CREATE INDEX `companies_licenseEndDate_idx` ON `companies` (`licenseEndDate`);

