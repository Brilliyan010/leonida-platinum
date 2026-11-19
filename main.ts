// Leonida Platinum — a GTA VI trophy guide and tracker (gta6-trophy-guide-01).
// Node 22, standard library only. The guide itself is plain static files under
// app/ (index.html + app.js + style.css + data/trophies.json): no build step,
// no network at run time, it opens in desktop Chrome from its own files.
// This program hands it in: it copies app/ and screenshots/ from beside this
// file into /output and writes /output/dossier.json with the kit's vendored
// make.fun library (vendor/makefun-frontend.ts, left exactly as the kit ships
// it — the scorer rebuilds the dossier with its own copy and compares bytes).
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps for this bounty (reference/gate.json): the text cap shapes
// the dossier's bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; app/ over 993 files and
// directories or 48 MiB — app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json). Screenshots are named so the first by
// name is the cover: 1-tracker.jpg (tracker + cited guide), 2-roadmap.jpg,
// 3-missables.jpg, 4-spoilers.jpg.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
