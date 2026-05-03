// Generate a 1500-pixel-wide *.medium.webp variant for every character
// hero art (`art.webp`). The full file stays for the lightbox; the
// hero panel on the character page loads the medium variant so it
// paints quickly even on slow links.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const PUBLIC_DIR = path.join(ROOT, 'public', 'characters');
const MEDIUM_WIDTH = 1200;
const QUALITY = 80;

let made = 0;
let skipped = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (entry.name !== 'art.webp') continue;
    const target = full.slice(0, -'.webp'.length) + '.medium.webp';
    try {
      const [srcStat, dstStat] = await Promise.all([
        fs.stat(full),
        fs.stat(target).catch(() => null),
      ]);
      if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
        skipped += 1;
        continue;
      }
      await sharp(full)
        .resize({ width: MEDIUM_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(target);
      const newStat = await fs.stat(target);
      made += 1;
      console.log(
        `  ${path.relative(ROOT, target)} (${(newStat.size / 1024).toFixed(0)} KB, ${(
          (newStat.size / srcStat.size) *
          100
        ).toFixed(0)}% of source)`,
      );
    } catch (err) {
      console.error(`! failed: ${full}`, err.message);
    }
  }
}

console.log(`Scanning ${path.relative(ROOT, PUBLIC_DIR)} ...`);
await walk(PUBLIC_DIR);
console.log(`\nMade ${made}, skipped ${skipped}.`);
