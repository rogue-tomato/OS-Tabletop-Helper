// Generate 400-pixel-wide thumbnail .thumb.webp siblings for every
// .webp under public/characters. Card tiles render at ~300 CSS px, so
// shipping a 1200 px source per tile is wasteful — thumbs cut card
// payload by another 5–10x. Originals remain for the lightbox.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const PUBLIC_DIR = path.join(ROOT, 'public', 'characters');
const THUMB_WIDTH = 600;
const QUALITY = 88;

let made = 0;
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
    if (!entry.name.endsWith('.webp')) continue;
    if (entry.name.endsWith('.thumb.webp')) continue;
    if (entry.name.endsWith('.medium.webp')) continue;
    if (entry.name.endsWith('.mobile.webp')) continue;
    if (entry.name.endsWith('.desktop.webp')) continue;
    if (entry.name.endsWith('.full.webp')) continue;
    const target = full.slice(0, -'.webp'.length) + '.thumb.webp';
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
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(target);
      const newStat = await fs.stat(target);
      savedBytes += srcStat.size - newStat.size;
      made += 1;
      const rel = path.relative(ROOT, target);
      console.log(
        `  ${rel} (${(newStat.size / 1024).toFixed(0)} KB, ${(
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
console.log(
  `\nMade ${made}, skipped ${skipped}. ` +
    `Combined source−thumb delta: ${(savedBytes / 1024 / 1024).toFixed(1)} MB.`,
);
