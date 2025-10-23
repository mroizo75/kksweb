import fs from 'fs';
import path from 'path';

// Leser alle bilder fra /public/courses/ og foreslår hvilke slug-navn som trengs
function suggestCourseSlugs() {
  console.log('\n💡 FORESLÅTTE KURS-SLUGS\n');
  console.log('─'.repeat(100));

  const publicCoursesDir = path.join(process.cwd(), 'public', 'courses');
  
  if (!fs.existsSync(publicCoursesDir)) {
    console.log('❌ /public/courses/ mappen finnes ikke');
    return;
  }

  const images = fs.readdirSync(publicCoursesDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg'))
    .sort();

  console.log(`\n📁 Fant ${images.length} bilder i /public/courses/\n`);
  console.log('For at Google Merchant skal fungere, må hvert kurs ha:\n');
  console.log('  1. En slug som matcher bildets filnavn (uten .png/.jpg)');
  console.log('  2. image-feltet satt til: /courses/[slug].png');
  console.log('  3. published: true\n');
  console.log('─'.repeat(100) + '\n');

  images.forEach((image, index) => {
    const slug = image.replace(/\.(png|jpg)$/i, '');
    const title = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    console.log(`${index + 1}. ${image}`);
    console.log(`   Slug: ${slug}`);
    console.log(`   Foreslått tittel: ${title}`);
    console.log(`   Image-verdi: /courses/${image}\n`);
  });

  console.log('─'.repeat(100));
  console.log(`\n📝 AKSJON:\n`);
  console.log(`   Hvis du skal opprette ${images.length} kurs, sørg for at hver har:`);
  console.log(`   - slug: [filnavn uten .png]`);
  console.log(`   - image: "/courses/[filnavn].png"`);
  console.log(`   - published: true\n`);
  console.log(`   Da vil Google Merchant godkjenne alle produktene! ✅\n`);
}

suggestCourseSlugs();

