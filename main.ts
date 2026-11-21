// Leonida Platinum — entrypoint for make.fun gta6-trophy-guide-01.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-frontend.ts. Node 22, standard library only.
// Deterministic: the same input files always produce the same bytes.
import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL(".", import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function copyTree(name: string): void {
  const src = join(REPO_ROOT, name);
  const dst = join(OUTPUT_DIR, name);
  if (!existsSync(src)) {
    throw new Error(`Leonida Platinum: missing ${name}/ in repository`);
  }
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyTree("app");
copyTree("screenshots");

const dossier = buildDossier(OUTPUT_DIR, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(OUTPUT_DIR, "dossier.json"), dossier);
console.log(`Leonida Platinum: wrote ${join(OUTPUT_DIR, "dossier.json")} (${dossier.length} bytes)`);
