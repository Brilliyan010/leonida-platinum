// Leonida Platinum — entry program for make.fun's gta6-trophy-guide-01.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-frontend.ts. Node 22, standard library only, no network,
// no randomness: two runs write the same bytes.

import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const repoDir = new URL(".", import.meta.url).pathname;

function copyTree(name: string): void {
  const from = join(repoDir, name);
  const to = join(outputDir, name);
  if (!existsSync(from)) {
    throw new Error(`Leonida Platinum: missing ${name}/ in the repository`);
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

function countFiles(dir: string): number {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(join(dir, e.name)) : 1;
  }
  return n;
}

mkdirSync(outputDir, { recursive: true });
copyTree("app");
copyTree("screenshots");

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log(
  `Leonida Platinum: wrote ${outputDir}/dossier.json (${dossier.length} bytes, ` +
    `${countFiles(join(outputDir, "app"))} app files, ` +
    `${countFiles(join(outputDir, "screenshots"))} screenshots)`,
);
