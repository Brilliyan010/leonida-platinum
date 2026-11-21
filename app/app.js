// Leonida Platinum — offline trophy tracker for GTA VI (55 trophies).
// Vanilla JS, no libraries, no network at run time beyond loading the
// guide's own data file. Progress lives in localStorage; export/import
// moves it as a JSON file. ?demo=1 seeds a sample save for screenshots;
// ?spoiler=1 starts with the spoiler shield on; ?q= pre-fills search;
// #trophy-<id> opens a trophy, #roadmap jumps to the roadmap.
(function () {
  "use strict";
  var STORE_KEY = "leonida-platinum-v1";
  var DATA_URL = "data/trophies.json";
  var TOTAL = 55;

  var STAGES = [
    { n: 1, title: "Story playthrough", hours: "60-80 hours", text: "Chapters 1-5 and every story mission. Save at each chapter boundary; meditate at Jason's house in Chapter 1." },
    { n: 2, title: "Missables & character quests", hours: "During the story", text: "The one missable meditation, then the Andy, Kenton, Billy, Randy and Tyrone finales, plus Bret's hunt." },
    { n: 3, title: "Collectibles & side moments", hours: "About 10 hours", text: "Cards, WAiNK spots, vehicles, areas, garages, Scooter Bros registrations — and the quiet story moments." },
    { n: 4, title: "Activities & grinds", hours: "About 100 hours with the checklist", text: "Stunts, shooting range golds, drone races, races, challenges, robberies and the money trophies." },
    { n: 5, title: "Cleanup & platinum", hours: "Final stretch", text: "The 100% checklist at Progress > Stats, then the platinum pops with A Long Road." }
  ];

  // Seeded demo save (13 earned, four counters part way) for screenshots.
  var DEMO_EARNED = [2, 3, 4, 5, 6, 8, 9, 10, 11, 20, 21, 46, 51];
  var DEMO_COUNTS = { 15: 120, 17: 20, 31: 40, 42: 30 };

  var trophies = [];
  var state = { earned: {}, counts: {}, spoiler: false, kind: "all", grade: "all", q: "", earnedOnly: false, selected: null };

  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(window.location.search);

  function loadState() {
    var raw = null;
    try { raw = window.localStorage.getItem(STORE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        var saved = JSON.parse(raw);
        if (saved && saved.app === "leonida-platinum") {
          state.earned = saved.earned || {};
          state.counts = saved.counts || {};
          state.spoiler = !!saved.spoiler;
        }
      } catch (e) { /* corrupt save: start fresh */ }
    } else if (params.get("demo") === "1") {
      DEMO_EARNED.forEach(function (id) { state.earned[id] = true; });
      state.counts = Object.assign({}, DEMO_COUNTS);
      saveState();
    }
    if (params.get("spoiler") === "1") state.spoiler = true;
    if (params.get("q")) state.q = params.get("q");
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({
        app: "leonida-platinum", version: 1,
        earned: state.earned, counts: state.counts, spoiler: state.spoiler
      }));
    } catch (e) { /* storage unavailable: tracker still works for the session */ }
  }

  function byId(id) {
    for (var i = 0; i < trophies.length; i++) if (trophies[i].id === id) return trophies[i];
    return null;
  }
  function isEarned(t) { return !!state.earned[t.id]; }
  function countOf(t) {
    var v = state.counts[t.id];
    return typeof v === "number" && v > 0 ? Math.min(v, t.count || 0) : 0;
  }
  function isMasked(t) { return state.spoiler && t.hidden && !isEarned(t); }
  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

  function matches(t) {
    if (state.kind === "story" && t.kinds.indexOf("story") < 0) return false;
    if (state.kind === "missable" && !t.missable) return false;
    if (state.kind === "collectible" && t.kinds.indexOf("collectible") < 0) return false;
    if (state.kind === "activity" && t.kinds.indexOf("activity") < 0) return false;
    if (state.kind === "online") return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.earnedOnly && !isEarned(t)) return false;
    if (state.q) {
      var hay = (t.name + " " + t.description + " " + t.guide + " " + t.steps.join(" ")).toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
    }
    return true;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderProgress() {
    var earned = trophies.filter(isEarned).length;
    var pct = Math.round((earned / TOTAL) * 100);
    $("earnedCount").textContent = String(earned);
    $("toolbarProgress").textContent = earned + " / 55 · " + pct + "%";
    $("progressFill").style.width = pct + "%";
    $("progressBar").setAttribute("aria-valuenow", String(earned));
    $("progressPct").textContent = pct + "% to the platinum";
    var counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    trophies.forEach(function (t) { if (isEarned(t)) counts[t.grade]++; });
    $("gradeCounts").textContent = "Platinum " + counts.platinum + "/1 · Gold " + counts.gold + "/2 · Silver " + counts.silver + "/6 · Bronze " + counts.bronze + "/46 · Hidden 28";
  }

  function renderRoadmap() {
    var host = $("stageCards");
    host.innerHTML = "";
    STAGES.forEach(function (s) {
      var members = trophies.filter(function (t) { return t.roadmapStage === s.n; });
      var done = members.filter(isEarned).length;
      var card = el("div", "stage");
      card.appendChild(el("h3", null, "Stage " + s.n + " — " + s.title));
      card.appendChild(el("p", "hours", s.hours));
      card.appendChild(el("p", null, s.text));
      card.appendChild(el("p", "count", done + " / " + members.length + " earned"));
      var ul = el("ul");
      members.slice(0, 5).forEach(function (t) {
        ul.appendChild(el("li", null, isMasked(t) ? "Hidden trophy" : t.name));
      });
      if (members.length > 5) ul.appendChild(el("li", null, "…and " + (members.length - 5) + " more"));
      card.appendChild(ul);
      host.appendChild(card);
    });
  }

  function stepper(t) {
    var wrap = el("span", "stepper");
    var minus = el("button", null, "−");
    minus.type = "button";
    minus.setAttribute("aria-label", "Decrease count for " + t.name);
    var val = el("span", "countVal", "YOUR COUNT " + countOf(t) + " / " + t.count);
    var plus = el("button", null, "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "Increase count for " + t.name);
    minus.addEventListener("click", function (ev) { ev.stopPropagation(); bumpCount(t, -1); });
    plus.addEventListener("click", function (ev) { ev.stopPropagation(); bumpCount(t, 1); });
    wrap.appendChild(minus);
    wrap.appendChild(val);
    wrap.appendChild(plus);
    return wrap;
  }

  function bumpCount(t, d) {
    var next = Math.max(0, Math.min(t.count, countOf(t) + d));
    if (next === 0) delete state.counts[t.id]; else state.counts[t.id] = next;
    if (next >= t.count) state.earned[t.id] = true;
    saveState();
    renderAll();
  }

  function renderList() {
    var host = $("trophyList");
    host.innerHTML = "";
    var shown = trophies.filter(matches);
    $("emptyMsg").hidden = shown.length > 0;
    shown.forEach(function (t) {
      var masked = isMasked(t);
      var row = el("article", "trophy" + (isEarned(t) ? " earned" : "") + (state.selected === t.id ? " selected" : ""));
      row.setAttribute("role", "listitem");
      row.dataset.id = String(t.id);
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = isEarned(t);
      box.setAttribute("aria-label", "Mark " + (masked ? "hidden trophy" : t.name) + " earned");
      box.addEventListener("click", function (ev) { ev.stopPropagation(); });
      box.addEventListener("change", function () {
        if (box.checked) state.earned[t.id] = true; else delete state.earned[t.id];
        saveState();
        renderAll();
      });
      row.appendChild(box);
      var body = el("div", "body");
      body.appendChild(el("div", "name", masked ? "Hidden trophy — earn it to reveal" : t.name));
      body.appendChild(el("div", "desc", masked ? "Spoiler shield is on. This trophy's name and description stay hidden until you earn it." : t.description));
      var meta = el("div", "meta");
      meta.appendChild(el("span", "badge " + t.grade, gradeLabel(t.grade)));
      if (t.hidden) meta.appendChild(el("span", "tag hiddenTag", "Hidden"));
      if (t.missable) meta.appendChild(el("span", "tag miss", "MISSABLE"));
      meta.appendChild(el("span", "tag", "Stage " + t.roadmapStage));
      if (t.count) meta.appendChild(stepper(t));
      body.appendChild(meta);
      row.appendChild(body);
      row.addEventListener("click", function () { selectTrophy(t.id, true); });
      host.appendChild(row);
    });
  }

  function missBox(t) {
    var box = el("div", "missBox " + (t.missable ? "bad" : "ok"));
    if (t.missable) {
      box.appendChild(el("strong", null, "MISSABLE — read before you play"));
      if (isMasked(t)) {
        box.appendChild(document.createTextNode("This trophy can be missed. Turn the spoiler shield off or earn it to see its window."));
      } else {
        box.appendChild(document.createTextNode(t.missableNote));
      }
    } else {
      box.appendChild(el("strong", null, "Not missable"));
      box.appendChild(document.createTextNode(t.missableNote));
    }
    return box;
  }

  function renderDetail() {
    var host = $("detail");
    host.innerHTML = "";
    var t = state.selected ? byId(state.selected) : null;
    if (!t) {
      host.appendChild(el("p", "placeholder", "Pick a trophy from the checklist to see its guide, steps, sources and count tracker. Start with the roadmap above — Stage 1 first, and mind the one missable trophy in Stage 2."));
      return;
    }
    var masked = isMasked(t);
    var head = el("div", "meta");
    head.appendChild(el("span", "badge " + t.grade, gradeLabel(t.grade)));
    if (t.hidden) head.appendChild(el("span", "tag hiddenTag", "Hidden"));
    if (t.missable) head.appendChild(el("span", "tag miss", "MISSABLE"));
    head.appendChild(el("span", "tag", "Stage " + t.roadmapStage));
    host.appendChild(head);
    host.appendChild(el("h3", null, masked ? "Hidden trophy" : t.name));
    host.appendChild(el("p", "desc", masked ? "Spoiler shield is on — this trophy's name and description stay hidden until you earn it." : t.description));
    host.appendChild(missBox(t));
    if (t.count) {
      host.appendChild(el("h4", null, "Your count"));
      var row = el("div", "markRow");
      row.appendChild(stepper(t));
      row.appendChild(el("span", null, (t.countLabel || "progress") + " — " + countOf(t) + " of " + t.count));
      host.appendChild(row);
    }
    if (!masked) {
      host.appendChild(el("h4", null, "Guide"));
      host.appendChild(el("p", "guide", t.guide));
      host.appendChild(el("h4", null, "Steps"));
      var ol = el("ol");
      t.steps.forEach(function (s) { ol.appendChild(el("li", null, s)); });
      host.appendChild(ol);
    } else {
      host.appendChild(el("h4", null, "Guide"));
      host.appendChild(el("p", "guide", "Hidden by the spoiler shield. Earn this trophy (or switch the shield off) to read its guide and steps."));
    }
    host.appendChild(el("h4", null, "Sources"));
    var ul = el("ul", "sources");
    t.sources.forEach(function (s) {
      var li = el("li");
      var a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.name;
      li.appendChild(a);
      ul.appendChild(li);
    });
    host.appendChild(ul);
    var markRow = el("div", "markRow");
    var btn = el("button", isEarned(t) ? "earnedBtn" : null, isEarned(t) ? "✓ Earned — click to unmark" : "Mark as earned");
    btn.type = "button";
    btn.addEventListener("click", function () {
      if (isEarned(t)) delete state.earned[t.id]; else state.earned[t.id] = true;
      saveState();
      renderAll();
    });
    markRow.appendChild(btn);
    host.appendChild(markRow);
  }

  function renderAll() {
    renderProgress();
    renderRoadmap();
    renderList();
    renderDetail();
  }

  function selectTrophy(id, scroll) {
    state.selected = id;
    renderList();
    renderDetail();
    if (scroll) {
      var d = $("detail");
      if (d && d.scrollIntoView) d.scrollIntoView({ block: "nearest" });
    }
  }

  function applyHash() {
    // Deep links scroll instantly (no smooth scrolling: screenshots must
    // land deterministically). #trophy-<id> shows the checklist with the
    // detail panel open; #roadmap and #export jump to those sections.
    var h = window.location.hash || "";
    var m = h.match(/^#trophy-(\d+)$/);
    if (m) {
      selectTrophy(parseInt(m[1], 10), false);
      var tr = $("tracker");
      if (tr) tr.scrollIntoView();
      return;
    }
    if (h === "#roadmap") { var r = $("roadmap"); if (r) r.scrollIntoView(); return; }
    if (h === "#export") { var s = $("export"); if (s) s.scrollIntoView(); return; }
  }

  function exportProgress() {
    var payload = { app: "leonida-platinum", version: 1, earned: state.earned, counts: state.counts };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leonida-platinum-progress.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    $("saveStatus").textContent = "Exported leonida-platinum-progress.json";
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!data || data.app !== "leonida-platinum" || typeof data.earned !== "object") throw new Error("bad file");
        state.earned = data.earned || {};
        state.counts = data.counts || {};
        saveState();
        renderAll();
        $("saveStatus").textContent = "Imported progress — " + Object.keys(state.earned).length + " trophies earned.";
      } catch (e) {
        $("saveStatus").textContent = "That file is not a Leonida Platinum export.";
      }
    };
    reader.readAsText(file);
  }

  function wire() {
    document.querySelectorAll("#kindFilters button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.kind = b.dataset.kind;
        document.querySelectorAll("#kindFilters button").forEach(function (x) { x.classList.toggle("active", x === b); });
        renderList();
      });
    });
    $("gradeFilter").addEventListener("change", function () { state.grade = $("gradeFilter").value; renderList(); });
    var search = $("searchBox");
    if (state.q) search.value = state.q;
    search.addEventListener("input", function () { state.q = search.value; renderList(); });
    $("earnedOnly").addEventListener("change", function () { state.earnedOnly = $("earnedOnly").checked; renderList(); });
    var spoilerBtn = $("spoilerBtn");
    var paintSpoiler = function () {
      spoilerBtn.setAttribute("aria-pressed", String(state.spoiler));
      spoilerBtn.textContent = "Spoiler shield: " + (state.spoiler ? "on" : "off");
    };
    spoilerBtn.addEventListener("click", function () {
      state.spoiler = !state.spoiler;
      saveState();
      paintSpoiler();
      renderAll();
    });
    paintSpoiler();
    $("exportBtn").addEventListener("click", exportProgress);
    $("importFile").addEventListener("change", function () {
      if ($("importFile").files && $("importFile").files[0]) importProgress($("importFile").files[0]);
      $("importFile").value = "";
    });
    $("resetBtn").addEventListener("click", function () {
      if (window.confirm("Reset all progress and counters?")) {
        state.earned = {};
        state.counts = {};
        saveState();
        renderAll();
        $("saveStatus").textContent = "Progress reset.";
      }
    });
    window.addEventListener("hashchange", applyHash);
  }

  function boot() {
    loadState();
    wire();
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (data) {
      trophies = data.trophies || [];
      renderAll();
      applyHash();
    }).catch(function () {
      $("trophyList").innerHTML = "";
      $("trophyList").appendChild(el("p", "empty", "Could not load data/trophies.json. Serve the app/ folder over HTTP (for example: node serve.ts) and reload."));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
