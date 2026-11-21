# Leonida Platinum — build notes

## What this is

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5, built for make.fun's `gta6-trophy-guide-01` ($250, 50 paid
places). Static files under `app/` — no build step, no network at run time,
no Rockstar logo or artwork. `main.ts` copies `app/` and `screenshots/` to
the output directory and writes `dossier.json` with the kit's
`buildDossier`.

**Second-round rebuild.** Round 1 (commit 689cd999) built fine, but its
recording (01a1fcca) sealed "cannot enter": another scheduled session that
started 68 seconds before that recording kept writing while it ran and
poisoned the seal. This rebuild deletes every round-1 file and rewrites the
whole entry from scratch in a fresh session that began after the new
recording (01a1fce5, started 2026-11-21T06:57:15Z). Only
`vendor/makefun-frontend.ts` survives — it is byte-identical to the kit
starter (sha256 4c8da1c8…), as the gate requires.

## Design

- **Tracker first.** Checklist of all 55 official trophies (names,
  descriptions and grades exactly as PlayStation publishes them), saved in
  localStorage, with a progress bar and percent-to-platinum. Filters by
  kind (All / Story / Missable / Collectibles / Activities / Online) and by
  grade, plus a search box.
- **Spoiler shield.** Hides the names and descriptions of hidden story
  trophies until they are earned; toggling it re-renders list and detail.
- **Export / import.** Progress downloads as JSON and imports back; a
  reset button clears the save.
- **Roadmap.** Five stages in play order (story → one-time moments →
  collectibles → activities/grinds → cleanup/platinum), with per-stage
  trophy counts computed from the data, and a Points-of-no-return box.
- **Cited guides.** Every trophy has a guide in our own words, 3 steps,
  and 2 named sources with links (110 citations total). Per-trophy detail
  panel opens on click; a missable box shows on the one missable trophy.
- **YOUR COUNT.** A stepper (X / N) on each of the 16 count trophies
  (e.g. 42 Shooting Range challenges), saved in localStorage.
- **Hash / query support for screenshots:** `#roadmap` scrolls to the
  roadmap, `#trophy-<id>` opens that trophy's detail,
  `?spoiler=1` starts with the shield on, `?q=` prefills search,
  `?demo=1` seeds 13 earned + part-way counters when no save exists.

## Winner methods imitated (dev top-10, read 21 Nov ~13:30 WIB, 6392 entries)

Dev board at the time of the rebuild: #1 tidy-meteor-25 0.954816, #2 kiencx
0.954816 ("446/446 claims cited, 300 on 2+ sites, spoiler shield,
export/import"), #3 bacot-kintil 0.953558, #4 plntky 0.953558 ("every step
cited, 22 sites"), #5 swift-pika-45 0.952291, #6 bold-shark-708 0.952291,
#7 klencho 0.951015, #8 keen-sparrow-96 0.951015 ("55/55 cited, 450 cited
facts, 37 disputes"), #9 el-net 0.951015 ("missable box on every trophy
page, points of no return in chapter order, claim-level audit strip,
spoiler shield"), #10 ronigrv 0.949730 ("535 cited claims, YOUR COUNT,
missable windows, roadmap").

The pattern is dense citation + spoiler shield + export/import + missable
flags and points of no return + roadmap + per-trophy count trackers +
multi-panel UI + audit strip. This entry follows it and adds: an honesty
correction the top-10 gloss over — PowerPyx's guide (verified 21 Nov)
flags exactly **one** potentially missable trophy (Positive Mental
Attitude, the Chapter 1 meditation at Jason's house), not a dozen; the
entry says so plainly instead of inventing missables. It also states the
numbers the guides agree on: difficulty 4/10, ~200 hours, 55 offline,
0 online, 1 playthrough, no mission replay, 5 chapters.

## Sources (verified to exist, 21 Nov)

- PowerPyx GTA 6 Trophy Guide — https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/
- Exophase GTA VI trophies — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles GTA VI trophies — https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- KeenGamer GTA 6 Trophy Guide — https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/
- GTA Spotter GTA 6 trophies — https://gtaspotter.com/en/guides/gta-6-trophies-and-achievements/
- Sixshore GTA 6 Trophy List — https://sixshore.com/gta-6/guides/trophies-and-achievements/
- PlanetGTA6 GTA 6 Trophies — https://www.planetgta6.com/en/gta-6-trophies/

## Validation

- trophies.json: valid JSON, exactly 55 trophies; every name, description
  and grade matches the kit's official list byte for byte; grades 1
  platinum / 2 gold / 6 silver / 46 bronze; 28 hidden; 1 missable
  (Positive Mental Attitude); 16 count trophies; 110 sources (2 per
  trophy); roadmap stages 20 / 12 / 8 / 13 / 2.
- `main.ts` run twice (MAKEFUN_OUTPUT_DIR=/tmp/out1 and /tmp/out2):
  `diff -r` clean — outputs byte-identical. Dossier 929,084 bytes
  (< 1.5 MiB cap); dossier text 79,642 UTF-8 bytes (< 163,840 cap);
  first load 3 files, 10,089 bytes gzip-9; whole app 4 files, 78,246
  bytes; 0 missing references; 6 cited source URLs in the source.
- No external loads: the only https:// strings in app/ are `<a href>`
  citation links and source URLs inside trophies.json (data, not loads);
  no script/link/img/fetch/import to any outside URL. index.html 7,747
  bytes (< 1 MiB); app/ total 78,246 bytes (< 48 MiB).
- Screenshots: 4 real Chromium renders of this app (CDP driver, 1280x860
  viewport): 1-cover.png 177,289 B (checklist + The Shootist detail open,
  13/55, filters), 2-roadmap.png 131,619 B (5 roadmap stages + Points of
  no return), 3-spoiler-count.png 185,592 B (spoiler shield on, hidden
  trophies masked, You WAiNKer! 47/100), 4-export.png 138,755 B (search
  "shoot" → 5 of 55, Export/Import visible). All ≤ 256 KiB, long side
  1280, short side 860. Text readable at a glance; no overlap.
- Interaction probe (headless Chromium, real clicks): 55 rows render;
  checkbox toggle 13 → 14 earned and persists in localStorage; YOUR
  COUNT stepper 20 → 21 and persists; spoiler toggle masks hidden
  trophies; Export click runs without error.
- Fixes made after first render: duplicate "YOUR COUNT" label in the
  detail panel removed; `#roadmap` now scrolls after the async list
  renders (the plain `--screenshot` path painted blank tiles when
  scrolled ~5,900 px down, so the roadmap shot was retaken through a
  real CDP session that scrolls and waits before capturing).
