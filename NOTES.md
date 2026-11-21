# Leonida Platinum — build notes

## What this is
An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online),
built from scratch in one recorded session for make.fun's
`gta6-trophy-guide-01` ($250, 50 paid places, deadline 21 Nov 2026 18:00 WIB).
Entry program `main.ts` (Node 22, stdlib only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the
kit's `buildDossier`.

## Design
- **Tracker first (judge criterion 1):** checklist of all 55 trophies with
  official name, description and grade; progress saved in localStorage with a
  progress bar and per-grade counts; kind filters (Story, Missable,
  Collectibles, Activities, Online) + grade filter + search + earned-only;
  spoiler shield that hides the name, description, guide and steps of hidden
  story trophies until earned; export to JSON file + import back; reset.
- **Roadmap + missables (criterion 2):** 5 stages in order (story 60-80h →
  missables & character quests → collectibles & side moments → activities &
  grinds → cleanup & platinum), each with its trophy count and earned count,
  plus a points-of-no-return box (1 missable, no mission replay, cheats
  disable trophies, character-only questlines, hourglass quests, the
  Irredeemable profile).
- **Cited guidance (criterion 3):** every trophy has a guide in our own
  words, 2-5 concrete steps, a missable box (MISSABLE with its window, or
  "Not missable" with the reason), and 2-3 named sources with links —
  PowerPyx's GTA 6 Trophy Guide & Roadmap plus the PSNProfiles and Exophase
  trophy lists. 113 source citations across 55 trophies. Where a location or
  step is not pinned down in a source, the guide says so instead of
  inventing one.
- **Count trackers:** 18 trophies with a PSN progress target get a
  "YOUR COUNT X / N" stepper saved in localStorage (42 shooting-range golds,
  250 stunts, 100 WAiNK spots, 52 areas, 500 choices, …). Reaching the max
  auto-marks the trophy earned.
- **Fast, clear, polished (criterion 4):** static files only, system fonts,
  no network at run time, dark look with a gold/platinum accent, dense
  two-pane layout (checklist + detail) so one screenshot shows the tracker,
  a guide, its sources, progress and filters at once. Deep links:
  `#roadmap`, `#trophy-<id>`, `#export`, `?spoiler=1`, `?q=`, `?demo=1`
  (seeds a 13-earned demo save for screenshots).
- **Honesty guardrails:** the only missable trophy flagged is Positive
  Mental Attitude (PowerPyx: the Chapter 1 meditation at Jason's house is
  the one possible missable). No Rockstar logo, artwork or game screenshots
  anywhere. All guide text is original; official names/descriptions are
  shown exactly as PlayStation publishes them.

## Winner methods imitated (dev top-10, read 21 Nov ~13:30 WIB, 6392 entries)
- #1 tidy-meteor-25 "Trophy tracker" 0.954816; #2 kiencx "Mile Zero
  Casebook v3: 446/446 claims cited, 300 on 2+ sites, 65 pages from 23
  sites, count trackers, spoiler shield, export/import" 0.954816;
  #3 bacot-kintil "The Leonida Ledger" 0.953558; #4 plntky "EXIT 55: every
  step cited, 22 sites" 0.953558; #5 swift-pika-45 0.952291; #6 bold-shark-708
  "Leonida Platinum Roadmap" 0.952291; #7 klencho "Neon Tide" 0.951015;
  #8 keen-sparrow-96 "Leonida Legend: 55/55 cited, 3-pane dense UI, audit
  strip, 450 cited facts, 37 disputes" 0.951015; #9 el-net "Leonida Platinum
  Ledger: all 55 cited, missable box on every trophy page, points of no
  return in chapter order, claim-level audit strip, spoiler shield"
  0.951015; #10 ronigrv "Leonida Route Card: 535 cited claims, YOUR COUNT,
  missable windows, roadmap" 0.949730.
- Pattern to beat, not just copy: dense cited claims (400-500+), many
  source sites, spoiler shield, export/import, missable flags + points of
  no return, roadmap, per-trophy count trackers, dense multi-pane UI, audit
  strip. This entry answers with: 113 named source citations (2-3 per
  trophy, every trophy), a missable box on every trophy detail, a 5-stage
  roadmap with per-stage progress, YOUR COUNT steppers on all 18 counted
  trophies, a spoiler shield, export/import, and a dense checklist+detail
  layout built so the cover screenshot shows tracker + guide + sources +
  progress + filters in one frame.

## Validation (21 Nov 2026, all in this session)
- `main.ts` run 2x into separate output dirs (`/tmp/out1`, `/tmp/out2`):
  byte-identical — `diff -r` empty, aggregate sha256
  `bfb7aec01261be52fefb3ca32eecac74f138e4c07a227d0e766e5c7d79fe8b0d`
  for both runs. Dossier 989,095 bytes (< 1.5 MiB cap).
- `app/data/trophies.json`: 55 trophies; names, descriptions and grades
  match the kit's official list exactly (0 mismatches); all guides
  non-empty; 28 hidden; 1 missable; 18 with count trackers; 113 source
  citations (2-3 per trophy).
- Screenshots: 4 PNG files, 1280x860 each, 146-208 KiB (all ≤256 KiB),
  real Chromium renders of this app (CDP, fresh profile for the clean
  check). 1-cover: checklist + The Shootist detail (guide, steps, sources,
  YOUR COUNT 20/42) + filters + 13/55 progress. 2-roadmap: 5 stages +
  points of no return. 3-spoiler-count: spoiler shield on, hidden trophy
  masked, MISSABLE box, YOUR COUNT 0/18 meditations. 4-export: search
  "shooting" filtered to 3 trophies + export/import buttons.
- Fresh-profile browser check: 55 rows render, 0/55 at start, 5 roadmap
  stages, detail placeholder shown, 0 external requests (only the local
  `data/trophies.json` fetch). Clicking a checkbox stores 1 earned in
  localStorage; the count stepper increments and persists.
- No external references loaded: 0 `https://` strings in `app.js`,
  `index.html`, `style.css`, `main.ts`, `serve.ts`; the only URLs in the
  source are the 3 cited guide domains inside `trophies.json` data, shown
  as plain links. `app/index.html` 6,594 bytes; whole `app/` 95,467 bytes
  (4 files); first load 3 files, 10,420 bytes gzip-9.
- Fixes made during validation: removed smooth scrolling (screenshots
  must land deterministically); dropped `backdrop-filter` from the toolbar;
  raised the sticky detail panel's top offset so its title clears the
  toolbar; added a persistent `13 / 55 · 24%` chip to the toolbar.
- Not run (forbidden by the task): `makefun check`, `bundle`, `submit`.
  The parent seals the recording and submits with `--recording`.
