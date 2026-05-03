// Import per-character hero variants from a drop folder.
//
// Workflow:
//   1. Drop your input images into `_incoming/` at the repo root,
//      using either flat naming or per-slug subfolders. Examples:
//
//        _incoming/warden-mobile.png
//        _incoming/warden-desktop.png
//        _incoming/warden-full.png
//
//        OR
//
//        _incoming/warden/mobile.png
//        _incoming/warden/desktop.jpg
//        _incoming/warden/full.png
//
//   2. Run:  node scripts/import-hero-variants.mjs
//
//   3. The script:
//      - Picks every recognised file under `_incoming/`.
//      - Resizes & encodes to webp at the right size (see below).
//      - Writes them as
//          public/characters/<slug>/art.mobile.webp
//          public/characters/<slug>/art.desktop.webp
//          public/characters/<slug>/art.full.webp
//      - Prints a TypeScript snippet you can paste into
//        src/data/characterMetadata.ts to wire the new variants.
//
// Target dimensions (max width; aspect ratio preserved from input):
//   - mobile:  1000 px wide  (renders inside the content block on
//               phones; ~382 CSS px wide × 2 retina = 764, plus head-
//               room — q80 keeps ~80 KB)
//   - desktop: 1500 px wide  (renders inside the 768 px content area
//               at retina 2x)
//   - full:    2400 px wide  (lightbox / portrait-rotated full-screen)
//
// Skip rules:
//   - Non-image extensions ignored.
//   - Unrecognised slug → file moved to `_incoming/_unmatched/`.
//   - Variants other than mobile/desktop/full → ignored.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const INCOMING = path.join(ROOT, '_incoming');
const PUBLIC_DIR = path.join(ROOT, 'public', 'characters');

const KNOWN_SLUGS = new Set([
  'warden',
  'ursus-warbear',
  'witch',
  'priest',
  'adendri-ranger',
  'scar-tribe-exile',
  'cur',
  'penitent',
  'avi-harbinger',
  'thracian-blade',
  'adendri-grove-maiden',
  'huntress',
]);

const VARIANT_CONFIG = {
  mobile: { width: 1000, quality: 80, outName: 'art.mobile.webp' },
  desktop: { width: 1500, quality: 80, outName: 'art.desktop.webp' },
  full: { width: 2400, quality: 82, outName: 'art.full.webp' },
};

const VALID_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Parse a path under _incoming/ into { slug, variant } or null.
// Accepts:
//   warden-mobile.png        → slug=warden, variant=mobile
//   warden_desktop.jpg       → slug=warden, variant=desktop
//   warden/full.webp         → slug=warden, variant=full
function classify(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (!VALID_EXT.has(ext)) return null;
  const parts = relPath
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean);
  // _incoming/<slug>/<variant>.<ext>
  if (parts.length === 2) {
    const [slug, fname] = parts;
    if (!KNOWN_SLUGS.has(slug)) return null;
    const stem = path.basename(fname, ext).toLowerCase();
    if (stem in VARIANT_CONFIG) return { slug, variant: stem };
    return null;
  }
  // _incoming/<slug>-<variant>.<ext> or <slug>_<variant>.<ext>
  if (parts.length === 1) {
    const stem = path.basename(parts[0], ext);
    const m = stem.match(/^(.+?)[-_](mobile|desktop|full)$/i);
    if (!m) return null;
    const slug = m[1];
    if (!KNOWN_SLUGS.has(slug)) return null;
    return { slug, variant: m[2].toLowerCase() };
  }
  return null;
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '_unmatched') continue;
      const sub = await walk(full);
      out.push(...sub);
    } else {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  if (!(await exists(INCOMING))) {
    console.log(
      `No \`_incoming/\` folder. Create it and drop hero variants per\n` +
        `the naming rules at the top of this script, then re-run.`,
    );
    return;
  }

  const files = await walk(INCOMING);
  if (files.length === 0) {
    console.log('_incoming/ is empty — nothing to import.');
    return;
  }

  const unmatchedDir = path.join(INCOMING, '_unmatched');
  await fs.mkdir(unmatchedDir, { recursive: true });

  const made = [];
  const skipped = [];
  for (const file of files) {
    const rel = path.relative(INCOMING, file);
    const cls = classify(rel);
    if (!cls) {
      const dst = path.join(unmatchedDir, path.basename(rel));
      try {
        await fs.rename(file, dst);
        skipped.push({ rel, reason: 'unmatched name → moved to _unmatched/' });
      } catch (err) {
        skipped.push({ rel, reason: `unmatched + move failed: ${err.message}` });
      }
      continue;
    }
    const cfg = VARIANT_CONFIG[cls.variant];
    const dstDir = path.join(PUBLIC_DIR, cls.slug);
    await fs.mkdir(dstDir, { recursive: true });
    const dst = path.join(dstDir, cfg.outName);
    try {
      await sharp(file)
        .resize({ width: cfg.width, withoutEnlargement: true })
        .webp({ quality: cfg.quality })
        .toFile(dst);
      const stat = await fs.stat(dst);
      made.push({
        slug: cls.slug,
        variant: cls.variant,
        dst: path.relative(ROOT, dst),
        kb: Math.round(stat.size / 1024),
      });
    } catch (err) {
      skipped.push({ rel, reason: `sharp error: ${err.message}` });
    }
  }

  if (made.length === 0) {
    console.log('Nothing was imported.');
  } else {
    console.log(`Imported ${made.length} variant(s):`);
    for (const m of made) {
      console.log(`  ${m.slug}.${m.variant} → ${m.dst} (${m.kb} KB)`);
    }
  }
  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length}:`);
    for (const s of skipped) console.log(`  ${s.rel} — ${s.reason}`);
  }

  // Print a metadata snippet for whatever was imported.
  const bySlug = {};
  for (const m of made) {
    bySlug[m.slug] = bySlug[m.slug] ?? {};
    bySlug[m.slug][m.variant] = `characters/${m.slug}/${
      VARIANT_CONFIG[m.variant].outName
    }`;
  }
  if (Object.keys(bySlug).length > 0) {
    console.log(
      '\nPaste into src/data/characterMetadata.ts (merge with existing entry):',
    );
    for (const slug of Object.keys(bySlug)) {
      const v = bySlug[slug];
      console.log(`  '${slug}': {`);
      if (v.mobile) console.log(`    heroArtMobile: '${v.mobile}',`);
      if (v.desktop) console.log(`    heroArtDesktop: '${v.desktop}',`);
      if (v.full) console.log(`    heroArtFull: '${v.full}',`);
      console.log('  },');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
