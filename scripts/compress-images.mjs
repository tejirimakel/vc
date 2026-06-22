// One-off asset optimizer. Re-encodes the two oversized landing-page PNGs to
// right-sized WebP. Run with: node scripts/compress-images.mjs
import sharp from 'sharp';
import { statSync } from 'node:fs';

const jobs = [
  // Hero background — covers the viewport at opacity, so modest width is fine.
  { in: 'public/2.png', out: 'public/2.webp', width: 1200 },
  // Phone mockup — rendered at ~288px CSS width; 640px covers retina.
  { in: 'public/26.png', out: 'public/26.webp', width: 640 },
];

const mb = (p) => (statSync(p).size / 1048576).toFixed(2) + 'MB';

for (const job of jobs) {
  const before = mb(job.in);
  await sharp(job.in)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(job.out);
  console.log(`${job.in} (${before}) -> ${job.out} (${mb(job.out)})`);
}
