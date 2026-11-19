// Leonida Platinum — tracker logic for the 55 GTA VI trophies.
// All state lives in localStorage; the list itself is data/trophies.json and
// is fetched from the app's own files only, so the guide works offline.
const STORAGE_KEY = 'leonida-platinum-earned-v1';
const DEMO_EARNED = [2, 3, 8, 15, 20, 21, 28, 33, 42, 44, 46, 52, 55];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));

let earned = loadEarned();
let selectedId = Number(params.get('trophy')) || 17;
let activeKind = 'all';
let activeGrade = 'all';
let spoilersHidden = params.get('spoilers') === 'on';
let hideEarned = false;

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');

function loadEarned() {
  if (params.get('demo') === 'seed13') return new Set(DEMO_EARNED.map((id) => byId.get(id).name));
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function isStory(trophy) {
  return trophy.kind === 'story';
}

function isHiddenBySpoilers(trophy) {
  return spoilersHidden && isStory(trophy) && !earned.has(trophy.name);
}

function visibleTrophies() {
  const query = searchEl.value.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (activeKind === 'missable' && !trophy.missable) return false;
    if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
    if (activeGrade !== 'all' && trophy.grade !== activeGrade) return false;
    if (hideEarned && earned.has(trophy.name)) return false;
    if (query && !(trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase().includes(query)) return false;
    return true;
  });
}

function renderNextUp() {
  const next = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id).find((t) => !earned.has(t.name));
  const box = document.getElementById('nextUp');
  if (!next) {
    box.textContent = 'Platinum earned — Vice Got a Price! is yours. Leonida Legend.';
    return;
  }
  box.replaceChildren();
  const label = document.createElement('strong');
  label.textContent = 'Next up: ';
  const name = document.createElement('strong');
  name.textContent = isHiddenBySpoilers(next) ? 'a hidden story trophy' : next.name;
  const rest = document.createTextNode(
    isHiddenBySpoilers(next)
      ? ` — a story trophy in roadmap stage ${next.stage}. Earn it to reveal it.`
      : ` — ${next.description} (stage ${next.stage}, ${next.grade}${next.missable ? ', missable — do it on your first pass' : ''}).`,
  );
  box.append(label, name, rest);
}

function renderProgress() {
  document.getElementById('earnedCount').textContent = earned.size;
  document.getElementById('barFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    return `${got}/${total} ${grade}`;
  });
  document.getElementById('gradeCounts').textContent = counts.join(' · ') + ' · 28 hidden on PSN until earned';
}

function renderRows() {
  const list = visibleTrophies();
  rowsEl.replaceChildren();
  for (const trophy of list) {
    const tr = document.createElement('tr');
    if (earned.has(trophy.name)) tr.classList.add('earned');
    if (trophy.id === selectedId) tr.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${trophy.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderNextUp();
      renderRows();
      renderDetail();
    });
    const checkCell = document.createElement('td');
    checkCell.className = 'c';
    checkCell.append(box);
    const nameCell = document.createElement('td');
    if (isHiddenBySpoilers(trophy)) {
      nameCell.innerHTML = '<span class="tname spoiled">Hidden story trophy</span><div class="tdesc spoiled">Earn it to reveal its name — spoilers hidden.</div>';
    } else {
      const name = document.createElement('div');
      name.className = 'tname';
      name.textContent = trophy.name;
      const desc = document.createElement('div');
      desc.className = 'tdesc';
      desc.textContent = trophy.description;
      nameCell.append(name, desc);
      if (trophy.missable) {
        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.textContent = '⚠ Missable — do it on your first pass';
        nameCell.append(flag);
      }
    }
    const gradeCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${trophy.grade}`;
    badge.textContent = trophy.grade;
    gradeCell.append(badge);
    const kindCell = document.createElement('td');
    kindCell.className = 'kind';
    kindCell.textContent = trophy.missable ? `${trophy.kind} · missable` : trophy.kind;
    const guideCell = document.createElement('td');
    guideCell.className = 'guidecell';
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Read guide';
    open.addEventListener('click', () => {
      selectedId = trophy.id;
      renderRows();
      renderDetail();
    });
    guideCell.append(open);
    tr.append(checkCell, nameCell, gradeCell, kindCell, guideCell);
    rowsEl.append(tr);
  }
  document.getElementById('resultCount').textContent =
    `${list.length} of 55 trophies shown · ${earned.size} earned · click “Read guide” for the cited guide to any trophy`;
}

function renderDetail() {
  const trophy = byId.get(selectedId) ?? trophies[0];
  detailEl.replaceChildren();
  const title = document.createElement('h2');
  title.textContent = isHiddenBySpoilers(trophy) ? 'Hidden story trophy' : trophy.name;
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${trophy.grade} · ${trophy.kind}${trophy.missable ? ' · missable' : ''}${trophy.target ? ` · PSN target: ${trophy.target}` : ''} · Roadmap stage ${trophy.stage} · ${earned.has(trophy.name) ? 'Earned ✓' : 'Not earned yet'}`;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isHiddenBySpoilers(trophy)
    ? 'Official description hidden until earned (spoiler setting is on).'
    : `Official description (PlayStation): “${trophy.description}”`;
  const guideHead = document.createElement('h3');
  guideHead.textContent = 'Guide — our own words';
  const guide = document.createElement('p');
  guide.textContent = isHiddenBySpoilers(trophy) ? 'Guide hidden until earned.' : trophy.guide;
  detailEl.append(title, meta, official, guideHead, guide);
  if (!isHiddenBySpoilers(trophy) && trophy.steps?.length) {
    const stepsHead = document.createElement('h3');
    stepsHead.textContent = 'Steps';
    const steps = document.createElement('ol');
    for (const step of trophy.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.append(li);
    }
    detailEl.append(stepsHead, steps);
  }
  if (trophy.missable && !isHiddenBySpoilers(trophy)) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = `Missable: ${trophy.missableWhy}`;
    detailEl.append(warn);
  }
  const srcHead = document.createElement('h3');
  srcHead.textContent = 'Sources for this trophy';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  const sourceList = trophy.sources ?? doc.sources;
  for (const source of sourceList) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = source.url;
    a.textContent = source.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a, document.createTextNode(` — ${source.what}`));
    sources.append(li);
  }
  const honest = document.createElement('li');
  honest.textContent = 'Our own advice, from the official description — not yet checked in the game (GTA VI released 19 Nov 2026).';
  sources.append(honest);
  detailEl.append(srcHead, sources);
}

const ROADMAP_STAGES = [
  { stage: 1, title: 'Stage 1 — Play the story', note: 'Chapters 1–4, the opening mission and the named story missions. These come naturally; just finish the story.' },
  { stage: 2, title: 'Stage 2 — Stranger strands', note: 'Finish every stranger mission strand (Andy, Kenton, Billy, Randy, Tyrone, Bret) and 8 strands for “Strangers & Freaks”.' },
  { stage: 3, title: 'Stage 3 — Activities & skills', note: 'The 9 activity types, the Shooting Range, drone races, races, fishing, arcade, meditation and challenges.' },
  { stage: 4, title: 'Stage 4 — Explore & collect', note: 'Cards, WAiNK spots, vehicles, all 52 areas of Leonida, garages and Scooter Bros registrations.' },
  { stage: 5, title: 'Stage 5 — Robberies, partners & combat', note: 'Partner robberies, bank vaults, armored trucks, gang operations and Combat Focus — most need a partner beside you.' },
  { stage: 6, title: 'Stage 6 — Money & the 100% grind', note: 'Launder the marked bills, spend across the shops, then sweep up the one-offs and push to 100% completion — and the platinum.' },
];

function renderRoadmap() {
  const box = document.getElementById('roadmap');
  box.replaceChildren();
  for (const { stage, title, note } of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('div');
    card.className = 'stage';
    const head = document.createElement('h2');
    head.textContent = `${title} — ${done}/${members.length} earned`;
    const noteEl = document.createElement('p');
    noteEl.className = 'count';
    noteEl.textContent = note;
    const list = document.createElement('ul');
    for (const trophy of members) {
      const li = document.createElement('li');
      li.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = trophy.name;
      li.append(strong, document.createTextNode(` — ${trophy.description} `));
      const mark = document.createElement('span');
      mark.className = 'done';
      mark.textContent = earned.has(trophy.name) ? '✓ earned' : '';
      li.append(mark);
      if (trophy.missable) {
        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.textContent = ' ⚠ missable';
        li.append(flag);
      }
      list.append(li);
    }
    card.append(head, noteEl, list);
    box.append(card);
  }
}

function renderMissables() {
  const box = document.getElementById('missableList');
  box.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  const safe = trophies.length - flagged.length;
  const head = document.createElement('div');
  head.className = 'misscard';
  const h = document.createElement('h2');
  h.textContent = `${flagged.length} missable trophies — do these on your first pass`;
  const p = document.createElement('p');
  p.className = 'why';
  p.textContent = `The other ${safe} trophies can be earned any time in free roam after the story. These ${flagged.length} are tied to story missions, partners, or choices — miss the moment and you replay the mission or, for choices, a new playthrough.`;
  head.append(h, p);
  box.append(head);
  for (const trophy of flagged) {
    const card = document.createElement('div');
    card.className = 'misscard';
    const title = document.createElement('h2');
    title.textContent = `${trophy.name} — ${trophy.grade}`;
    const why = document.createElement('p');
    why.className = 'why';
    why.textContent = trophy.missableWhy;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    card.append(title, why, guide);
    box.append(card);
  }
}

function showView(view) {
  for (const button of document.querySelectorAll('.tabs button')) {
    button.classList.toggle('active', button.dataset.view === view);
  }
  document.getElementById('view-tracker').hidden = view !== 'tracker';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-missables').hidden = view !== 'missables';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
}

for (const button of document.querySelectorAll('.tabs button')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
for (const chip of document.querySelectorAll('#kindChips button')) {
  chip.addEventListener('click', () => {
    activeKind = chip.dataset.kind;
    for (const other of document.querySelectorAll('#kindChips button')) {
      other.classList.toggle('active', other === chip);
    }
    renderRows();
  });
}
gradeEl.addEventListener('change', () => {
  activeGrade = gradeEl.value;
  renderRows();
});
searchEl.addEventListener('input', renderRows);
spoilersEl.checked = spoilersHidden;
spoilersEl.addEventListener('change', () => {
  spoilersHidden = spoilersEl.checked;
  renderRows();
  renderDetail();
});
hideEarnedEl.addEventListener('change', () => {
  hideEarned = hideEarnedEl.checked;
  renderRows();
});
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'leonida-platinum-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const names = JSON.parse(await file.text());
    earned = new Set(names.filter((name) => trophies.some((t) => t.name === name)));
    saveEarned();
    renderProgress();
    renderRows();
    renderDetail();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
});

renderProgress();
renderNextUp();
renderRows();
renderDetail();
showView(params.get('view') === 'roadmap' || params.get('view') === 'missables' ? params.get('view') : 'tracker');
