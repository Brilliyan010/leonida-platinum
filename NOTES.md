# NOTES — Leonida Platinum (gta6-trophy-guide-01)

Entry: "Leonida Platinum" — offline guide + tracker for all 55 GTA VI PS5 trophies.
Deadline: 21 Nov 2026 18:00 WIB / 2026-11-21T11:00Z. Pot $250, 50 paid places.
Repo: /home/hatch/workspace/makefun/gta6-trophy-guide/ (do NOT submit from this session — build + validate + bank only; parent seals the recording and submits).

## Winner analysis (read before designing — WINNING-METHODS.md + LESSONS.md)

- Dev leaderboard is EMPTY (0 entries, checked 19 Nov 18:19 WIB) — no top-10/dev
  benchmark exists yet. Gate is therefore the house ladder + the rubric.
- House ladder calibration for this bounty (competition.yaml, run 19 Nov 03:11–04:29Z,
  336 judge calls, z-ai/glm-5.3-flash): 1-weak 0.0434, 2-plain = starter 0.1927,
  3-mid 0.3948, 4-strong 1.6790, 5-pro 2.4974, 6-elite 3.2166, 7-ace 3.4146.
  Each rung beats the one below it; the rungs are the bar to beat.
- What the rungs add over the starter: kind filters + hidden-trophy switch + guide
  pane (3-mid); roadmap + spoiler setting + cited sources per trophy (4-strong);
  search + missables page + PSN-target counters (5-pro); roadmap progress + notes
  (6-elite); everything + a Next-up planner (7-ace).
- Growth/judge-AI pattern from WINNING-METHODS.md: density wins (news-image #1:
  35 stories + map on one page); every claim cited with a source beats an uncited
  one however detailed; a composition that shows several parts at once beats a
  menu alone; the judge reads ONLY the screenshots + the dossier outline, never
  the JSON contents — so the guides' words must be visible IN the screenshots.

## Design decisions (built to beat 7-ace, not just the starter)

- Everything 7-ace has, plus: per-trophy cited sources shown in the open guide
  pane (Exophase + PSNProfiles links beside every guide), a "Next up" planner
  line (next unearned trophy by roadmap stage), and a dense cover that shows
  tracker + progress + filters + guide + sources in one frame.
- Tracker (criterion 1): all 55 with official name, description, grade badge;
  localStorage checklist; export to file + import back; filters by kind (story,
  missable, collectibles, activities, online — no online trophies exist in the
  official list, and the app says so nowhere it would mislead: the Online chip
  simply shows 0), grade filter, search, hide-earned; spoiler toggle hides
  story names/descriptions until earned; progress bar + per-grade counts.
- Roadmap + missables (criterion 2): 6 stages built only from the official
  descriptions (story → stranger strands → activities → explore/collect →
  robberies/partners/combat → money + 100% grind); 16 missable trophies flagged
  with a stated rule (tied to a one-time story mission, a partner window, or a
  choice) and a per-trophy reason; the other 39 are marked safe for free roam.
- Cited guidance (criterion 3): every guide is our own words, each detail pane
  names its sources (Exophase official list + PSNProfiles PSN counts, linked)
  and states plainly that advice is "from the official description — not yet
  checked in the game" (GTA VI released 19 Nov 2026). No step that needs
  in-game checking is claimed as checked; where a place is not pinned down,
  the guide says so. No Rockstar logo/artwork/box art/game screenshot anywhere.
- Speed/clarity/polish (criterion 4): static files, system fonts only, no
  network at runtime; first load = index.html + style.css + app.js + trophies
  .json fetched locally; paper theme, coral accent, serif display face.
- Screenshots (real Chromium renders of the app's own code, 1280x800, JPEG q5):
  1-tracker.jpg (cover: tracker + Next-up + cited guide open), 2-roadmap.jpg,
  3-missables.jpg, 4-spoilers.jpg (spoiler setting hiding story names).
  Progress seeded 13/55 via ?demo=seed13 (same seeding the house used for its
  own screenshots); plain index.html with no query string starts at 0/55.
- Honesty guardrail: missable flags and stage order are derived from the
  official descriptions only. The starter's trophies.json carries no per-trophy
  "hidden" flag in the file as shipped, so no per-trophy PSN-hidden flag is
  claimed; the app states "28 hidden on PSN until earned" (the official count).

## Validation (all run in-session, 19 Nov 2026 ~11:20–11:40 WIB)

- Trophies: 55/55 names match the official list exactly (case/punctuation-folded),
  0 missing, 0 extra; 0 description/grade mismatches; grades 1 platinum / 2 gold /
  6 silver / 46 bronze; 0 blank guides; every trophy has steps + stage + kind.
- Program runs: `MAKEFUN_OUTPUT_DIR=out node main.ts` twice → byte-identical
  output (diff -r clean). Dossier 1,009,203 bytes (< 1.5 MiB cap); dossier text
  61,574 bytes (< 163,840 cap). Output total ~1.78 MB.
- Screenshots: 4 JPEGs, each 1280x800, 163–187 KiB (< 256 KiB cap). Viewed each
  render: tracker, roadmap, missables, spoiler mode all render correctly.
- Offline: no http(s) URL in index.html/app.js/style.css; the only fetch is the
  relative local `data/trophies.json`; the only absolute URLs anywhere are the
  two source links (Exophase, PSNProfiles) as data/link text, never loaded.
  app/ = 4 files, 59,507 bytes (cap 993 files / 48 MiB).
- Kit check (`makefun check --kit … --repo . --worktree`): 4 passed, 0 failed,
  16 skipped (transcript checks run on the sealed recordings at submission),
  5 at-submission items (repo public/owner/created-after-open/commit/duplicate —
  the parent's job at submit time). No local sealed-scorer grade exists for this
  bounty (grade-local refuses: scorer/reference not published in the kit);
  the server grades every entry.
- Bugs found and fixed in-session: (1) duplicate `sources` const in app.js —
  module never ran, table empty (caught by --dump-dom, fixed, re-verified
  56 table rows); (2) kind filter chips rendered blank — generic `button` rule
  painted their text white on white (added explicit ink color, re-screenshotted).
- Kit version note (unverified whether it matters): local kit is level 26,
  make.fun is at level 27 — `check` suggests re-downloading the kit before
  submit. Parent to decide.

## Scores vs house baseline

- House baseline (starter = 2-plain): calibration strength 0.1927. This entry
  contains every feature of 7-ace (3.4146) plus per-trophy cited sources and a
  Next-up planner — designed to beat 7-ace, not just the starter. No local
  judge score exists (server grades it); no dev score is claimed here.
- Dev leaderboard: EMPTY at build time — no top-10 benchmark to beat; note
  this if comparing later.

## Parameters

- Seeded demo progress for screenshots: 13/55 earned (ids 2,3,8,15,20,21,28,33,
  42,44,46,52,55) via ?demo=seed13. Roadmap stages: 12/7/11/6/9/10 trophies.
  Missable: 16. Kinds: story 19, activities 29, collectibles 6, platinum 1.
- Recording: RUNNING (pid 15778, started before this session) — do NOT stop it
  here; the parent seals it.
- Usage rows: muse.db query for this session's agent_id
  (28c54920-ddc0-496a-a109-6567a02612d9) returned 0 rows — rows appear only
  after the session ends. Parent must query muse.db after this session ends
  and write ~/.makefun/muse-usage-gta6-trophy-guide-01.jsonl BEFORE sealing
  the recording, or thinking_priced has nothing to price.

## Unverified

- No dev/final judge score yet (server-side only).
- Whether kit level 27 changes anything for this entry (see kit note above).
- Missable flags are a judgement built from the official descriptions, not
  from playing the game (the game released today) — stated as such in the app.
