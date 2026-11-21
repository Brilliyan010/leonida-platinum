// Leonida Platinum — trophy tracker logic (vanilla JS, no libraries).
// Loads app/data/trophies.json, renders the checklist, saves progress in
// localStorage, and opens a cited guide for every trophy.
(function () {
  "use strict";

  var STORAGE_KEY = "leonida-platinum-v1";
  var DATA_URL = "data/trophies.json";
  var TOTAL = 55;

  var trophies = [];
  var state = loadState();
  var kindFilter = "all";
  var gradeFilter = "all";
  var searchText = "";
  var spoilerOn = false;
  var selectedId = null;

  var listEl = document.getElementById("trophyList");
  var detailEl = document.getElementById("detail");
  var detailBodyEl = document.getElementById("detailBody");
  var detailEmptyEl = document.getElementById("detailEmpty");
  var earnedCountEl = document.getElementById("earnedCount");
  var earnedPctEl = document.getElementById("earnedPct");
  var progressFillEl = document.getElementById("progressFill");
  var shownCountEl = document.getElementById("shownCount");
  var emptyStateEl = document.getElementById("emptyState");
  var searchEl = document.getElementById("search");
  var gradeFilterEl = document.getElementById("gradeFilter");
  var spoilerToggleEl = document.getElementById("spoilerToggle");

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { earned: {}, counts: {}, spoiler: false };
      var parsed = JSON.parse(raw);
      return {
        earned: parsed.earned || {},
        counts: parsed.counts || {},
        spoiler: !!parsed.spoiler,
      };
    } catch (err) {
      return { earned: {}, counts: {}, spoiler: false };
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* storage full or unavailable: progress stays in memory */
    }
  }

  function seedDemoProgress() {
    // Demo seed for screenshots and first looks: 13 earned, counters part way.
    // Only runs when no save exists yet; never overwrites real progress.
    if (localStorage.getItem(STORAGE_KEY)) return;
    var demoEarned = [2, 3, 8, 15, 16, 20, 21, 28, 33, 35, 42, 44, 46];
    demoEarned.forEach(function (id) { state.earned[id] = true; });
    state.counts = { 15: 132, 17: 20, 31: 47, 32: 23, 35: 61 };
    saveProgress();
  }

  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("spoiler") === "1") spoilerOn = true;
    if (params.get("demo") === "1") seedDemoProgress();
    if (params.get("q")) {
      searchText = params.get("q");
      searchEl.value = searchText;
    }
    if (state.spoiler) spoilerOn = true;
    spoilerToggleEl.checked = spoilerOn;
  }

  function isEarned(t) { return !!state.earned[t.id]; }
  function getCount(t) { return state.counts[t.id] || 0; }

  function isSpoilerHidden(t) {
    return spoilerOn && t.hidden && !isEarned(t);
  }

  function trophyKinds(t) {
    return Array.isArray(t.kind) ? t.kind : [t.kind];
  }

  function matchesFilters(t) {
    if (kindFilter !== "all" && trophyKinds(t).indexOf(kindFilter) === -1) return false;
    if (gradeFilter !== "all" && t.grade !== gradeFilter) return false;
    if (searchText) {
      var q = searchText.toLowerCase();
      var hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function renderProgress() {
    var earned = trophies.filter(isEarned).length;
    var pct = Math.round((earned / TOTAL) * 100);
    earnedCountEl.textContent = earned + " / " + TOTAL;
    earnedPctEl.textContent = pct + "% to platinum";
    progressFillEl.style.width = pct + "%";
  }

  function renderRoadmapCounts() {
    var counts = {};
    trophies.forEach(function (t) {
      counts[t.roadmapStage] = (counts[t.roadmapStage] || 0) + 1;
    });
    document.querySelectorAll("[data-stage]").forEach(function (node) {
      var n = counts[Number(node.getAttribute("data-stage"))] || 0;
      node.textContent = n + (n === 1 ? " trophy" : " trophies") + " in this stage";
    });
  }

  function countStepper(t) {
    var wrap = el("span", "counter");
    var label = el("span", "count-label", "YOUR COUNT");
    var minus = el("button", null, "−");
    minus.type = "button";
    minus.setAttribute("aria-label", "Decrease count for " + t.name);
    var num = el("span", "count-num", getCount(t) + " / " + t.count);
    var plus = el("button", null, "+");
    plus.type = "button";
    plus.setAttribute("aria-label", "Increase count for " + t.name);
    minus.addEventListener("click", function (ev) {
      ev.stopPropagation();
      setCount(t, getCount(t) - 1);
    });
    plus.addEventListener("click", function (ev) {
      ev.stopPropagation();
      setCount(t, getCount(t) + 1);
    });
    wrap.appendChild(label);
    wrap.appendChild(minus);
    wrap.appendChild(num);
    wrap.appendChild(plus);
    return wrap;
  }

  function setCount(t, value) {
    var clamped = Math.max(0, Math.min(t.count, value));
    state.counts[t.id] = clamped;
    saveProgress();
    renderTrophyList();
    if (selectedId === t.id) openTrophyDetail(t.id);
  }

  function toggleEarned(t, checked) {
    if (checked) state.earned[t.id] = true;
    else delete state.earned[t.id];
    saveProgress();
    renderProgress();
    renderTrophyList();
    if (selectedId === t.id) openTrophyDetail(t.id);
  }

  function renderTrophyList() {
    listEl.innerHTML = "";
    var shown = 0;
    trophies.forEach(function (t) {
      if (!matchesFilters(t)) return;
      shown += 1;
      var row = el("li", "trophy-row" + (isEarned(t) ? " earned" : "") + (selectedId === t.id ? " selected" : ""));
      row.id = "trophy-row-" + t.id;

      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = isEarned(t);
      box.setAttribute("aria-label", "Mark " + t.name + " as earned");
      box.addEventListener("click", function (ev) { ev.stopPropagation(); });
      box.addEventListener("change", function () { toggleEarned(t, box.checked); });
      row.appendChild(box);

      var medal = el("span", "medal " + t.grade);
      medal.title = t.grade;
      row.appendChild(medal);

      var main = el("div");
      if (isSpoilerHidden(t)) {
        main.appendChild(el("div", "trophy-name", "Hidden trophy — earn it to reveal"));
        main.appendChild(el("div", "trophy-desc", "Spoiler shield is on. Tick the box once you earn this story trophy to reveal its name and description."));
      } else {
        var nameLine = el("div", "trophy-name", t.name);
        if (t.hidden) nameLine.appendChild(el("span", "hidden-tag", " · hidden"));
        main.appendChild(nameLine);
        main.appendChild(el("div", "trophy-desc", t.description));
      }
      var tags = el("div", "trophy-tags");
      tags.appendChild(el("span", "tag grade-" + t.grade, t.grade));
      trophyKinds(t).forEach(function (k) {
        tags.appendChild(el("span", "tag", k));
      });
      if (t.missable) tags.appendChild(el("span", "tag missable", "⚠ missable"));
      main.appendChild(tags);
      row.appendChild(main);

      var side = el("div", "trophy-side");
      side.appendChild(el("span", "grade-label", t.grade));
      if (typeof t.count === "number") side.appendChild(countStepper(t));
      row.appendChild(side);

      row.addEventListener("click", function () { openTrophyDetail(t.id); });
      listEl.appendChild(row);
    });
    shownCountEl.textContent = "Showing " + shown + " of " + TOTAL;
    emptyStateEl.hidden = shown !== 0;
  }

  function sourceList(t) {
    var wrap = el("div", "sources");
    (t.sources || []).forEach(function (s) {
      var a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = s.name;
      wrap.appendChild(a);
    });
    return wrap;
  }

  function openTrophyDetail(id) {
    var t = null;
    trophies.forEach(function (x) { if (x.id === id) t = x; });
    if (!t) return;
    selectedId = id;
    detailEmptyEl.hidden = true;
    detailBodyEl.hidden = false;
    detailBodyEl.innerHTML = "";

    var close = el("button", "detail-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close guide");
    close.addEventListener("click", function () {
      selectedId = null;
      detailBodyEl.hidden = true;
      detailEmptyEl.hidden = false;
      renderTrophyList();
      history.replaceState(null, "", window.location.pathname + window.location.search);
    });
    detailBodyEl.appendChild(close);

    if (isSpoilerHidden(t)) {
      detailBodyEl.appendChild(el("h2", null, "Hidden trophy"));
      detailBodyEl.appendChild(el("p", "detail-meta", t.grade + " · story · hidden until earned"));
      detailBodyEl.appendChild(el("p", null, "Spoiler shield is on and you have not earned this trophy yet, so its name and description stay hidden. Tick its box in the checklist once you earn it to reveal the full guide."));
      detailBodyEl.appendChild(el("p", "safe-note", "Story trophies unlock by playing the mission — they cannot be missed."));
      renderTrophyList();
      return;
    }

    detailBodyEl.appendChild(el("h2", null, t.name));
    var meta = t.grade + " · " + trophyKinds(t).join(" · ") + (t.hidden ? " · hidden" : "");
    detailBodyEl.appendChild(el("p", "detail-meta", meta));
    detailBodyEl.appendChild(el("p", "detail-desc", t.description));

    if (t.missable) {
      var box = el("div", "missable-box");
      box.appendChild(el("strong", null, "⚠ Missable — "));
      box.appendChild(document.createTextNode(t.missableNote || "Do this before the moment passes."));
      detailBodyEl.appendChild(box);
    } else {
      detailBodyEl.appendChild(el("p", "safe-note", "✓ Cannot be missed — earn it whenever you are ready."));
    }

    if (typeof t.count === "number") {
      var dc = el("div", "detail-count");
      dc.appendChild(countStepper(t));
      detailBodyEl.appendChild(dc);
    }

    detailBodyEl.appendChild(el("h3", null, "Guide"));
    detailBodyEl.appendChild(el("p", null, t.guide));

    if (Array.isArray(t.steps) && t.steps.length) {
      detailBodyEl.appendChild(el("h3", null, "Steps"));
      var ol = el("ol");
      t.steps.forEach(function (s) { ol.appendChild(el("li", null, s)); });
      detailBodyEl.appendChild(ol);
    }

    detailBodyEl.appendChild(el("h3", null, "Sources — where each fact comes from"));
    detailBodyEl.appendChild(sourceList(t));

    renderTrophyList();
    if (window.innerWidth < 900) detailEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function exportProgress() {
    var payload = {
      app: "Leonida Platinum",
      game: "Grand Theft Auto VI",
      exportedAt: new Date().toISOString(),
      earned: Object.keys(state.earned).map(Number).sort(function (a, b) { return a - b; }),
      counts: state.counts,
      spoiler: state.spoiler,
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "leonida-platinum-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!data || typeof data !== "object") throw new Error("not an object");
        var earned = {};
        (data.earned || []).forEach(function (id) {
          if (typeof id === "number" && id >= 1 && id <= TOTAL) earned[id] = true;
        });
        var counts = {};
        Object.keys(data.counts || {}).forEach(function (k) {
          var id = Number(k);
          if (id >= 1 && id <= TOTAL && typeof data.counts[k] === "number") counts[id] = data.counts[k];
        });
        state.earned = earned;
        state.counts = counts;
        if (typeof data.spoiler === "boolean") state.spoiler = data.spoiler;
        saveProgress();
        spoilerOn = state.spoiler;
        spoilerToggleEl.checked = spoilerOn;
        renderProgress();
        renderTrophyList();
      } catch (err) {
        alert("That file is not a Leonida Platinum export.");
      }
    };
    reader.readAsText(file);
  }

  function bindControls() {
    searchEl.addEventListener("input", function () {
      searchText = searchEl.value.trim();
      renderTrophyList();
    });
    document.querySelectorAll(".kind-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".kind-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        kindFilter = btn.getAttribute("data-kind");
        renderTrophyList();
      });
    });
    gradeFilterEl.addEventListener("change", function () {
      gradeFilter = gradeFilterEl.value;
      renderTrophyList();
    });
    spoilerToggleEl.addEventListener("change", function () {
      spoilerOn = spoilerToggleEl.checked;
      state.spoiler = spoilerOn;
      saveProgress();
      renderTrophyList();
      if (selectedId !== null) openTrophyDetail(selectedId);
    });
    document.getElementById("exportBtn").addEventListener("click", exportProgress);
    document.getElementById("importBtn").addEventListener("click", function () {
      document.getElementById("importFile").click();
    });
    document.getElementById("importFile").addEventListener("change", function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (file) importProgress(file);
      ev.target.value = "";
    });
    document.getElementById("resetBtn").addEventListener("click", function () {
      if (!window.confirm("Clear all saved Leonida Platinum progress?")) return;
      state = { earned: {}, counts: {}, spoiler: false };
      spoilerOn = false;
      spoilerToggleEl.checked = false;
      selectedId = null;
      detailBodyEl.hidden = true;
      detailEmptyEl.hidden = false;
      saveProgress();
      renderProgress();
      renderTrophyList();
    });
    window.addEventListener("hashchange", routeHash);
  }

  function routeHash() {
    var hash = window.location.hash || "";
    var match = hash.match(/^#trophy-(\d+)$/);
    if (match) {
      openTrophyDetail(Number(match[1]));
    }
  }

  function scrollToHashTarget() {
    // The checklist renders after fetch, so a #roadmap link scrolls only
    // once the page has its full height; scroll again after rendering.
    var hash = window.location.hash || "";
    if (!hash || /^#trophy-(\d+)$/.test(hash)) return;
    var target = document.querySelector(hash);
    if (target) {
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 130);
    }
  }

  function boot() {
    readUrlParams();
    bindControls();
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("trophies.json failed to load");
        return res.json();
      })
      .then(function (data) {
        trophies = data.trophies || data;
        trophies.sort(function (a, b) { return a.id - b.id; });
        renderProgress();
        renderRoadmapCounts();
        renderTrophyList();
        routeHash();
        scrollToHashTarget();
      })
      .catch(function () {
        listEl.innerHTML = "";
        emptyStateEl.hidden = false;
        emptyStateEl.textContent = "Could not load app/data/trophies.json. Serve the app/ folder over HTTP (node serve.ts) and reload.";
      });
  }

  boot();
})();
