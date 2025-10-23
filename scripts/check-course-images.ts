import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const db = new PrismaClient();

async function checkCourseImages() {
  const courses = await db.course.findMany({
    where: {}, // Hent ALLE kurs (både published og upublished)
    select: {
      id: true,
      slug: true,
      title: true,
      image: true,
      code: true,
      published: true,
    },
    orderBy: { title: 'asc' },
  });

  const publishedCount = courses.filter(c => c.published).length;
  
  console.log('\n🔍 SJEKKER KURS-BILDER\n');
  console.log(`Totalt ${courses.length} kurs (${publishedCount} publiserte, ${courses.length - publishedCount} upubliserte)\n`);
  console.log('─'.repeat(100));

  const publicCoursesDir = path.join(process.cwd(), 'public', 'courses');
  const availableImages = fs.existsSync(publicCoursesDir) 
    ? fs.readdirSync(publicCoursesDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    : [];

  console.log(`\n📁 Tilgjengelige bilder i /public/courses/: ${availableImages.length}`);
  console.log(availableImages.map(img => `   - ${img}`).join('\n'));
  console.log('\n' + '─'.repeat(100) + '\n');

  let validCount = 0;
  let invalidCount = 0;

  for (const course of courses) {
    const expectedFileName = `${course.slug}.png`;
    const expectedFilePath = path.join(publicCoursesDir, expectedFileName);
    const exists = fs.existsSync(expectedFilePath);

    const status = exists ? '✅' : '❌';
    const imageValue = course.image || '(ingen)';
    const publishedStatus = course.published ? '📢 PUBLISERT' : '🔒 Upublisert';

    console.log(`${status} ${course.title} (${publishedStatus})`);
    console.log(`   ID: ${course.id}`);
    console.log(`   Slug: ${course.slug}`);
    console.log(`   Image DB: ${imageValue}`);
    console.log(`   Forventet fil: ${expectedFileName}`);
    console.log(`   Finnes: ${exists ? 'JA' : 'NEI'}`);
    
    if (exists) {
      validCount++;
      console.log(`   ✓ Korrekt bane: /courses/${expectedFileName}`);
    } else {
      invalidCount++;
      console.log(`   ✗ MANGLER: /public/courses/${expectedFileName}`);
    }
    console.log('');
  }

  console.log('─'.repeat(100));
  console.log(`\n📊 RESULTAT:`);
  console.log(`   ✅ Kurs med gyldige bilder: ${validCount}`);
  console.log(`   ❌ Kurs med manglende bilder: ${invalidCount}`);
  console.log(`\n💡 ANBEFALING: ${invalidCount > 0 ? 'Oppdater alle kurs til å bruke /courses/[slug].png format' : 'Alt ser bra ut!'}\n`);

  await db.$disconnect();
}

checkCourseImages().catch(console.error);

