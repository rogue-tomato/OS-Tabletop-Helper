// Walk public/ recursively. For every .png / .jpg / .jpeg, write a
// .webp sibling at quality 85 (lossy). Skip files where an up-to-date
// .webp already exists (newer than the source). Originals are left in
// place so a manual cleanup pass can decide what to delete.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const QUALITY = 85;

let converted = 0;
let skipped = 0;
let savedBytes = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;
    const target = full.slice(0, -ext.length) + '.webp';
    try {
      const [srcStat, dstStat] = await Promise.all([
        fs.stat(full),
        fs.stat(target).catch(() => null),
      ]);
      if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
        skipped += 1;
        continue;
      }
      await sharp(full).webp({ quality: QUALITY }).toFile(target);
      const newStat = await fs.stat(target);
      savedBytes += srcStat.size - newStat.size;
      converted += 1;
      const rel = path.relative(ROOT, full);
      const ratio = ((newStat.size / srcStat.size) * 100).toFixed(0);
      console.log(`  ${rel} (${ratio}% of original)`);
    } catch (err) {
      console.error(`! failed: ${full}`, err.message);
    }
  }
}

console.log(`Scanning ${path.relative(ROOT, PUBLIC_DIR)} ...`);
await walk(PUBLIC_DIR);
console.log(
  `\nConverted ${converted}, skipped ${skipped}. ` +
    `Saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB.`,
);
