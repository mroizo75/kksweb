/**
 * 🔧 SCRIPT: Konverter SVG til PNG
 * 
 * Dette scriptet konverterer alle SVG-filer i public/courses/
 * til PNG-filer som Google Merchant Center støtter.
 * 
 * KRAV:
 * - Node.js 18+
 * - sharp installert (npm install sharp)
 * 
 * BRUK:
 * node scripts/convert-svg-to-png.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COURSES_DIR = path.join(__dirname, '..', 'public', 'courses');

console.log('🎨 SVG til PNG Konvertering');
console.log('============================\n');

// Sjekk om sharp er installert
try {
  require.resolve('sharp');
  console.log('✅ Sharp er installert\n');
} catch (e) {
  console.log('❌ Sharp er IKKE installert!');
  console.log('📦 Installer sharp med: npm install sharp\n');
  process.exit(1);
}

const sharp = require('sharp');

async function convertSvgToPng() {
  // Les alle filer i courses mappen
  const files = fs.readdirSync(COURSES_DIR);
  const svgFiles = files.filter(file => file.endsWith('.svg'));

  if (svgFiles.length === 0) {
    console.log('✅ Ingen SVG-filer funnet! Alle bilder er allerede konvertert.\n');
    return;
  }

  console.log(`📁 Fant ${svgFiles.length} SVG-filer\n`);
  console.log('🔄 Starter konvertering...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const svgFile of svgFiles) {
    const svgPath = path.join(COURSES_DIR, svgFile);
    const pngFile = svgFile.replace('.svg', '.png');
    const pngPath = path.join(COURSES_DIR, pngFile);

    try {
      // Les SVG og konverter til PNG
      await sharp(svgPath, { density: 300 })
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: false 
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(pngPath);

      const stats = fs.statSync(pngPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log(`✅ ${svgFile} → ${pngFile} (${sizeMB} MB)`);
      successCount++;

      // Slett SVG-filen etter vellykket konvertering (VALGFRITT - kan kommenteres ut)
      // fs.unlinkSync(svgPath);
      // console.log(`   🗑️  Slettet ${svgFile}`);

    } catch (error) {
      console.log(`❌ FEIL: ${svgFile} - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n============================');
  console.log(`✅ Vellykket: ${successCount}`);
  console.log(`❌ Feilet: ${errorCount}`);
  console.log('============================\n');

  if (successCount > 0) {
    console.log('🎉 Konvertering fullført!');
    console.log('📝 Husk å:');
    console.log('   1. Sjekk at bildene ser bra ut i public/courses/');
    console.log('   2. Commit og push til GitHub');
    console.log('   3. Deploy til produksjon');
    console.log('   4. Test feed: https://www.kksas.no/api/google-merchant-feed');
    console.log('   5. Refresh Google Merchant Center feed\n');
  }
}

// Kjør konvertering
convertSvgToPng().catch(error => {
  console.error('❌ Kritisk feil:', error);
  process.exit(1);
});

