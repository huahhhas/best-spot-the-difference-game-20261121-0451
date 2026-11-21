// main.ts — hands the Spot the Difference game in (Node 22, stdlib only).
// It copies game/ and screenshots/ from this repository into /output and
// writes /output/dossier.json with the kit's vendored library. The run is
// deterministic: same files in, same bytes out, every time.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps for this bounty: text is capped at 160 KiB, at most
// 4 screenshots of 256 KiB, game/ at most 993 files and 48 MiB.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(src: string, dst: string): void {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dst, name);
    if (statSync(from).isDirectory()) copyTree(from, to);
    else cpSync(from, to);
  }
}

mkdirSync(OUT_DIR, { recursive: true });

// Fail fast with a clear message if the game folder is not where it should be.
if (!existsSync(join(REPO_ROOT, 'game', 'index.html'))) {
  throw new Error('main.ts: game/index.html is missing from the repository');
}
copyTree(join(REPO_ROOT, 'game'), join(OUT_DIR, 'game'));

const shotsSrc = join(REPO_ROOT, 'screenshots');
if (existsSync(shotsSrc)) copyTree(shotsSrc, join(OUT_DIR, 'screenshots'));
else mkdirSync(join(OUT_DIR, 'screenshots'), { recursive: true });

const dossier = buildDossier(OUT_DIR, CAPS);
writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
