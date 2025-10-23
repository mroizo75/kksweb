import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

async function fixCourseImages() {
  console.log('\n🔧 FIKSER KURS-BILDER\n');
  console.log('─'.repeat(100));

  const publicCoursesDir = path.join(process.cwd(), 'public', 'courses');
  const availableImages = fs.existsSync(publicCoursesDir) 
    ? fs.readdirSync(publicCoursesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    : [];

  console.log(`\n📁 Tilgjengelige bilder i /public/courses/: ${availableImages.length}\n`);

  // Hent alle kurs
  const courses = await db.course.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      image: true,
      published: true,
    },
  });

  console.log(`📚 Totalt ${courses.length} kurs i databasen\n`);
  console.log('─'.repeat(100) + '\n');

  let updatedCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const course of courses) {
    const expectedPngFile = `${course.slug}.png`;
    const expectedJpgFile = `${course.slug}.jpg`;
    
    const pngExists = fs.existsSync(path.join(publicCoursesDir, expectedPngFile));
    const jpgExists = fs.existsSync(path.join(publicCoursesDir, expectedJpgFile));

    if (pngExists || jpgExists) {
      const correctImagePath = pngExists 
        ? `/courses/${expectedPngFile}` 
        : `/courses/${expectedJpgFile}`;

      // Sjekk om kurset allerede har riktig image-verdi
      if (course.image === correctImagePath) {
        console.log(`⏭️  ${course.title}`);
        console.log(`   Allerede korrekt: ${correctImagePath}\n`);
        skippedCount++;
        continue;
      }

      // Oppdater kurset
      await db.course.update({
        where: { id: course.id },
        data: { image: correctImagePath },
      });

      console.log(`✅ ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Gammel verdi: ${course.image || '(ingen)'}`);
      console.log(`   Ny verdi: ${correctImagePath}`);
      console.log(`   Status: ${course.published ? '📢 PUBLISERT' : '🔒 Upublisert'}\n`);
      updatedCount++;
    } else {
      console.log(`❌ ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Forventet: ${expectedPngFile} eller ${expectedJpgFile}`);
      console.log(`   Status: IKKE FUNNET\n`);
      notFoundCount++;
    }
  }

  console.log('─'.repeat(100));
  console.log(`\n📊 RESULTAT:`);
  console.log(`   ✅ Oppdaterte kurs: ${updatedCount}`);
  console.log(`   ⏭️  Hoppet over (allerede korrekt): ${skippedCount}`);
  console.log(`   ❌ Kurs uten matchende bilder: ${notFoundCount}`);
  
  if (notFoundCount > 0) {
    console.log(`\n⚠️  ADVARSEL: ${notFoundCount} kurs mangler bilder i /public/courses/`);
    console.log(`   Disse vil IKKE vises i Google Merchant feed fordi Google krever bilder.\n`);
  } else {
    console.log(`\n🎉 Alle kurs har nå gyldige bilder!\n`);
  }

  await db.$disconnect();
}

fixCourseImages().catch(console.error);

