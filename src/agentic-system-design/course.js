/* =============================================================
 * course.js — drives the landing (banner + curriculum) and
 * lecture subpages. Renders a shared sidebar on every page.
 * Sidebar collapse button lives inside sb-brand.
 * Storage-info toast fires on the user's first watched click.
 * ============================================================= */

const STORAGE_KEY     = 'ASD_progress_v1';
const STORAGE_BANNER  = 'ASD_storage_banner_seen';
const THEME_KEY       = 'ASD_theme';
const COURSE_DATA_URL = '/agentic-system-design/course.json';
const LECTURES_BASE   = '/agentic-system-design/lectures';

let COURSE = null;
let CURRENT_LECTURE_ID = null;

/* ─── localStorage progress ─────────────────────────────────── */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, lectures: {} };
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return { version: 1, lectures: {} };
    return parsed;
  } catch { return { version: 1, lectures: {} }; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }
  catch (e) { console.warn('Could not save progress:', e); }
}
function isWatched(p, id) { return Boolean(p.lectures[id]?.watched); }
function setWatched(p, id, watched) {
  if (watched) p.lectures[id] = { watched: true, watchedAt: new Date().toISOString() };
  else delete p.lectures[id];
  saveProgress(p);
}

/* ─── Course shape helpers ──────────────────────────────────── */
function flattenLectures(course) {
  const flat = [];
  course.parts.forEach((part) => {
    part.chapters.forEach((chapter) => {
      chapter.lectures.forEach((lecture, idxInChapter) => {
        flat.push({
          ...lecture,
          partNumber: part.number, partTitle: part.title, partLabel: part.label,
          chapterNumber: chapter.number, chapterTitle: chapter.title,
          chapterDescription: chapter.description, chapterId: chapter.id,
          subNumber: `${chapter.number}.${idxInChapter + 1}`
        });
      });
    });
  });
  return flat;
}
function lectureHref(lec) {
  return `${LECTURES_BASE}/${lec.id.replace('ep', 'ep-')}-${lec.slug}/`;
}
function findLecture(course, id) {
  const flat = flattenLectures(course);
  const idx = flat.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  return {
    lecture: flat[idx],
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null
  };
}
function chapterStatus(chapter) {
  const live = chapter.lectures.filter((l) => l.status === 'live').length;
  const coming = chapter.lectures.filter((l) => l.status === 'coming').length;
  if (live > 0) return 'live';
  if (coming > 0) return 'coming';
  return 'locked';
}
function chapterHasLive(chapter) {
  return chapter.lectures.some((l) => l.status === 'live' && l.revealed);
}
function isChapterComplete(chapter, progress) {
  const live = chapter.lectures.filter((l) => l.status === 'live' && l.revealed);
  if (live.length === 0) return false;
  return live.every((l) => isWatched(progress, l.id));
}
function findChapterByLectureId(course, lectureId) {
  for (const part of course.parts) {
    for (const chapter of part.chapters) {
      if (chapter.lectures.some((l) => l.id === lectureId)) return chapter;
    }
  }
  return null;
}
function findActiveChapter(course, progress, currentLectureId) {
  if (currentLectureId) {
    const ch = findChapterByLectureId(course, currentLectureId);
    if (ch) return ch.id;
  }
  for (const part of course.parts) {
    for (const chapter of part.chapters) {
      const live = chapter.lectures.filter((l) => l.status === 'live' && l.revealed);
      if (live.length === 0) continue;
      if (live.some((l) => !isWatched(progress, l.id))) return chapter.id;
    }
  }
  for (const part of course.parts) {
    for (const chapter of part.chapters) {
      if (chapterHasLive(chapter)) return chapter.id;
    }
  }
  return null;
}
function partLabel(part) { return part.label || `Part ${part.number}`; }

/* ─── Theme toggle ──────────────────────────────────────────── */
function getTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
function wireThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
}

/* ─── Particle background ───────────────────────────────────── */
function startParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COLORS = ['rgba(0,229,255,', 'rgba(168,85,247,', 'rgba(57,255,20,'];
  const COUNT = 32;

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function make() {
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.4 + 0.12
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col + p.a + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize(); make(); draw();
  window.addEventListener('resize', () => { resize(); make(); });
}

/* ─── Shared sidebar render (all pages) ─────────────────────── */
function renderSidebar(course, progress, currentLectureId) {
  const root = document.getElementById('sb-nav');
  if (!root) return;
  root.innerHTML = '';

  const activeChapterId = findActiveChapter(course, progress, currentLectureId);

  course.parts.forEach((part, partIdx) => {
    if (partIdx > 0) {
      const hr = document.createElement('div');
      hr.className = 'sb-part-divider';
      root.appendChild(hr);
    }

    const section = document.createElement('div');
    section.className = 'sb-section';
    section.innerHTML = `
      <div class="sb-section-label">
        <span class="label-name">${escape(partLabel(part))}</span> · ${escape(part.title)}
      </div>
    `;

    part.chapters.forEach((chapter, chIdx) => {
      if (chIdx > 0) {
        const sep = document.createElement('div');
        sep.className = 'sb-chapter-divider';
        section.appendChild(sep);
      }
      section.appendChild(renderSidebarChapter(chapter, progress, currentLectureId, activeChapterId));
    });

    root.appendChild(section);
  });

  updateSidebarProgress(course, progress);
  scrollSidebarToActive();
  wireProgressTooltip();
}

function renderSidebarChapter(chapter, progress, currentLectureId, activeChapterId) {
  const status = chapterStatus(chapter);
  const isLocked = status === 'locked';
  const containsCurrent = chapter.lectures.some((l) => l.id === currentLectureId);
  const isActive = chapter.id === activeChapterId;
  const hasRevealed = chapter.lectures.some((l) => l.revealed);
  const shouldOpen = (containsCurrent || isActive) && !isLocked && hasRevealed;

  const wrap = document.createElement('div');
  wrap.className = 'sb-chapter' + (isLocked ? ' locked' : '') +
    (isActive || containsCurrent ? ' active' : '') +
    (shouldOpen ? ' open' : '');
  wrap.dataset.chapterId = chapter.id;

  const icon = isLocked ? '🔒' : (hasRevealed ? '›' : '⏳');

  wrap.innerHTML = `
    <button class="sb-chapter-head" type="button" ${isLocked ? 'disabled aria-disabled="true"' : ''}>
      <span class="sb-chapter-num">${chapter.number}</span>
      <span class="sb-chapter-title">${escape(chapter.title)}</span>
      <span class="sb-chapter-icon">${icon}</span>
    </button>
    <div class="sb-chapter-body"></div>
  `;

  if (!isLocked && hasRevealed) {
    const body = wrap.querySelector('.sb-chapter-body');
    chapter.lectures.forEach((lec, idx) => {
      if (!lec.revealed) return;
      body.appendChild(renderSidebarLecture(lec, progress, currentLectureId, `${chapter.number}.${idx + 1}`));
    });
    wrap.querySelector('.sb-chapter-head').addEventListener('click', () => wrap.classList.toggle('open'));
  }

  return wrap;
}

function renderSidebarLecture(lec, progress, currentLectureId, subNumber) {
  const watched = isWatched(progress, lec.id);
  const isLive = lec.status === 'live';
  const isCurrent = lec.id === currentLectureId;

  const tag = isLive ? 'a' : 'div';
  const row = document.createElement(tag);
  row.className = 'sb-lecture' +
    (isLive ? ' live' : ' coming') +
    (watched ? ' watched' : '') +
    (isCurrent ? ' current' : '');
  if (isLive) row.href = lectureHref(lec);
  row.dataset.lectureId = lec.id;

  const icon = watched ? '✓' : (isLive ? '▶' : '⏳');

  row.innerHTML = `
    <span class="sb-lec-icon">${icon}</span>
    <span class="sb-lec-num">${escape(subNumber)}</span>
    <span class="sb-lec-title">${escape(lec.title || 'Coming')}</span>
  `;
  return row;
}

function updateSidebarProgress(course, progress) {
  const flat = flattenLectures(course);
  const live = flat.filter((l) => l.status === 'live' && l.revealed);
  const watched = live.filter((l) => isWatched(progress, l.id)).length;
  const total = live.length;
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;

  const fill = document.querySelector('.sb-progress-fill');
  if (fill) fill.style.width = pct + '%';
  const text = document.querySelector('.sb-progress-text');
  if (text) text.textContent = `${watched} / ${total} · ${pct}%`;
}

function scrollSidebarToActive() {
  const el = document.querySelector('.sb-chapter.active') || document.querySelector('.sb-lecture.current');
  if (!el) return;
  const nav = document.getElementById('sb-nav');
  if (!nav) return;
  const offsetTop = el.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
  nav.scrollTop = Math.max(0, offsetTop - 100);
}

function wireProgressTooltip() {
  const info = document.getElementById('progress-info');
  const progress = document.querySelector('.sb-progress');
  if (!info || !progress) return;

  // Default-open unless user has explicitly dismissed it before.
  let dismissed = false;
  try { dismissed = localStorage.getItem('ASD_tooltip_dismissed') === '1'; } catch {}
  if (!dismissed) progress.classList.add('tooltip-open');

  info.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = progress.classList.toggle('tooltip-open');
    try {
      if (isOpen) localStorage.removeItem('ASD_tooltip_dismissed');
      else localStorage.setItem('ASD_tooltip_dismissed', '1');
    } catch {}
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.sb-progress')) return;
    if (!progress.classList.contains('tooltip-open')) return;
    progress.classList.remove('tooltip-open');
    try { localStorage.setItem('ASD_tooltip_dismissed', '1'); } catch {}
  });
}

/* ─── Sidebar collapse/expand toggle ────────────────────────── */
function wireSidebarToggle() {
  const app = document.querySelector('.app');
  const toggle = document.getElementById('sb-toggle');
  const hamburger = document.getElementById('topbar-hamburger');
  if (!app || !toggle) return;

  // Default state on mobile is "collapsed" (sidebar fully hidden, hamburger in topbar). Desktop: expanded.
  if (window.innerWidth <= 800) {
    app.classList.add('sb-collapsed');
  }

  toggle.addEventListener('click', () => app.classList.toggle('sb-collapsed'));
  if (hamburger) {
    hamburger.addEventListener('click', () => app.classList.toggle('sb-collapsed'));
  }

  // Mobile: clicking outside expanded sidebar should collapse it
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 800) return;
    if (app.classList.contains('sb-collapsed')) return;
    if (e.target.closest('.sidebar')) return;
    if (e.target.closest('#sb-toggle')) return;
    if (e.target.closest('#topbar-hamburger')) return;
    app.classList.add('sb-collapsed');
  });
  // Mobile: clicking a lecture link should auto-collapse
  document.addEventListener('click', (e) => {
    if (window.innerWidth > 800) return;
    if (e.target.closest('.sb-lecture[href]')) {
      app.classList.add('sb-collapsed');
    }
  });
}

/* ─── Landing rendering ─────────────────────────────────────── */
function renderLanding(course, progress) {
  setText('stat-total-lectures', course.course.totalLectures);
  setText('stat-total-chapters', course.course.totalChapters);
  setText('stat-est-hours', course.course.estimatedHours);
  renderCurriculum(course, progress);
  wireSubscribeForm();
}

function renderCurriculum(course, progress) {
  const root = document.getElementById('curriculum');
  if (!root) return;
  root.innerHTML = '';

  course.parts.forEach((part) => {
    const partEl = document.createElement('section');
    partEl.className = 'part';
    partEl.innerHTML = `
      <header class="part-header">
        <div class="part-label">${escape(partLabel(part))}</div>
        <div class="part-title">${escape(part.title)}</div>
      </header>
      <p class="part-blurb">${escape(part.blurb || '')}</p>
    `;
    part.chapters.forEach((chapter) => partEl.appendChild(renderMainChapter(chapter, progress)));
    root.appendChild(partEl);
  });
}

function renderMainChapter(chapter, progress) {
  const status = chapterStatus(chapter);
  const isLocked = status === 'locked';
  const hasLive = chapter.lectures.some((l) => l.status === 'live');

  const wrap = document.createElement('article');
  wrap.className = 'chapter' + (hasLive ? ' has-live' : '') + (isLocked ? ' locked' : '');
  wrap.id = chapter.id;

  const lockMarkup = isLocked
    ? '<div class="chapter-status"><div class="chapter-lock" title="Coming soon">🔒</div></div>'
    : '';

  wrap.innerHTML = `
    <header class="chapter-head">
      <div class="chapter-num">${chapter.number}</div>
      <div class="chapter-meta">
        <div class="chapter-title">${escape(chapter.title)}</div>
        <div class="chapter-desc">${escape(chapter.description || '')}</div>
      </div>
      ${lockMarkup}
    </header>
  `;

  const revealedWithIdx = chapter.lectures
    .map((lec, idx) => ({ lec, subNumber: `${chapter.number}.${idx + 1}` }))
    .filter((x) => x.lec.revealed);

  if (revealedWithIdx.length > 0) {
    const body = document.createElement('div');
    body.className = 'chapter-body';
    const ul = document.createElement('ul');
    ul.className = 'lecture-list';
    revealedWithIdx.forEach(({ lec, subNumber }) => ul.appendChild(renderMainLectureRow(lec, progress, subNumber)));
    body.appendChild(ul);
    wrap.appendChild(body);
  }

  return wrap;
}

function renderMainLectureRow(lec, progress, subNumber) {
  const watched = isWatched(progress, lec.id);
  const isLive = lec.status === 'live';
  const isComing = lec.status === 'coming';

  const tag = isLive ? 'a' : 'div';
  const row = document.createElement(tag);
  row.className = 'lecture' + (isLive ? ' live' : '') + (isComing ? ' coming' : '') + (watched ? ' watched' : '');
  if (isLive) row.href = lectureHref(lec);

  const icon = watched ? '✓' : (isLive ? '▶' : '⏳');
  const pillText = watched ? 'Watched' : (isLive ? 'Watch' : 'Coming');

  row.innerHTML = `
    <div class="lec-status">${icon}</div>
    <div class="lec-num">${escape(subNumber)}</div>
    <div class="lec-title">${escape(lec.title || 'Coming')}</div>
    <div class="lec-pill">${pillText}</div>
  `;
  return row;
}

function wireSubscribeForm() {
  const form = document.getElementById('subscribe-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    if (!email) return;
    alert(`Thanks! ${email} will be notified when each lecture drops.\n\n(Wire this to Substack when account is ready.)`);
    form.reset();
  });
}

/* ─── Lecture page rendering ────────────────────────────────── */
function renderLecturePage(course, progress, lectureId) {
  const found = findLecture(course, lectureId);
  if (!found || !found.lecture.revealed || found.lecture.status === 'locked') {
    document.getElementById('lecture-content').innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:3rem 0;">This lecture is not available yet.</p>';
    return;
  }
  const { lecture, prev, next } = found;

  setText('breadcrumb-part', escape(lecture.partLabel || `Part ${lecture.partNumber}`));
  setText('breadcrumb-chapter', `${lecture.chapterNumber} · ${lecture.chapterTitle}`);
  setText('lecture-eyebrow', `Lecture ${lecture.subNumber}`);
  setText('lecture-title', lecture.title);
  document.title = `${lecture.title} · Agentic System Design`;

  const iframe = document.getElementById('lecture-iframe');
  if (iframe && lecture.youtubeId) {
    iframe.src = `https://www.youtube.com/embed/${lecture.youtubeId}?rel=0&modestbranding=1`;
  }

  const toggle = document.getElementById('watched-toggle');
  if (toggle) {
    function refresh() {
      const w = isWatched(loadProgress(), lecture.id);
      toggle.classList.toggle('on', w);
      toggle.textContent = w ? '✓ Watched' : '○ Mark as watched';
    }
    refresh();
    toggle.addEventListener('click', () => {
      const before = loadProgress();
      const chapter = findChapterByLectureId(course, lecture.id);
      const wasComplete = chapter ? isChapterComplete(chapter, before) : false;
      const wasWatched = isWatched(before, lecture.id);

      const after = loadProgress();
      setWatched(after, lecture.id, !wasWatched);

      const isNow = chapter ? isChapterComplete(chapter, after) : false;

      refresh();
      updateSidebarProgress(course, after);
      const sbRow = document.querySelector(`.sb-lecture[data-lecture-id="${lecture.id}"]`);
      if (sbRow) {
        const w = isWatched(after, lecture.id);
        sbRow.classList.toggle('watched', w);
        const icon = sbRow.querySelector('.sb-lec-icon');
        if (icon) icon.textContent = w ? '✓' : '▶';
      }

      // Storage info banner — first time the user marks anything as watched
      if (!wasWatched) maybeShowStorageToast();

      // Chapter-complete celebration
      if (!wasComplete && isNow && chapter) {
        showChapterCompleteToast(chapter);
      }
    });
  }

  renderPrevNext(prev, next);
}

function renderPrevNext(prev, next) {
  const navEl = document.getElementById('lecture-nav');
  if (!navEl) return;
  const prevHref = prev && prev.revealed && prev.status === 'live' ? lectureHref(prev) : null;
  const nextHref = next && next.revealed && next.status === 'live' ? lectureHref(next) : null;
  const prevLabel = prev?.revealed ? prev.title : (prev ? 'Coming soon' : 'Course start');
  const nextLabel = next?.revealed ? next.title : (next ? 'Coming soon' : 'Course end');

  navEl.innerHTML = `
    <a class="prev ${prevHref ? '' : 'disabled'}" ${prevHref ? `href="${prevHref}"` : ''}>
      <span class="dir">← Previous</span>
      <span class="label">${escape(prevLabel)}</span>
    </a>
    <a class="next ${nextHref ? '' : 'disabled'}" ${nextHref ? `href="${nextHref}"` : ''}>
      <span class="dir">Next →</span>
      <span class="label">${escape(nextLabel)}</span>
    </a>
  `;
}

async function loadTutorial() {
  const section = document.getElementById('tutorial');
  if (!section) return;
  try {
    const res = await fetch('tutorial.md', { cache: 'no-cache' });
    if (!res.ok) { section.style.display = 'none'; return; }
    const md = await res.text();
    if (typeof marked === 'undefined') {
      section.innerHTML = '<pre>' + escape(md) + '</pre>';
    } else {
      section.innerHTML = marked.parse(md);
    }
  } catch { section.style.display = 'none'; }
}

/* ─── Toasts ────────────────────────────────────────────────── */
function showToast({ kind, icon, title, sub, ttl = 7000 }) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${kind}`;
  toast.innerHTML = `
    <div class="t-icon">${icon}</div>
    <div class="t-meta">
      <div class="t-title">${escape(title)}</div>
      <div class="t-sub">${sub}</div>
    </div>
    <button class="t-close" type="button" aria-label="Dismiss">×</button>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  let timer = null;
  function dismiss() {
    if (timer) clearTimeout(timer);
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }
  toast.querySelector('.t-close').addEventListener('click', dismiss);
  timer = setTimeout(dismiss, ttl);
}

function showChapterCompleteToast(chapter) {
  showToast({
    kind: 'complete',
    icon: '🎉',
    title: `Chapter ${chapter.number} complete: ${escape(chapter.title)}`,
    sub: escape(chapter.description || ''),
    ttl: 7000
  });
}

function maybeShowStorageToast() {
  try {
    if (localStorage.getItem(STORAGE_BANNER) === '1') return;
    localStorage.setItem(STORAGE_BANNER, '1');
  } catch { return; }
  showToast({
    kind: 'storage',
    icon: 'i',
    title: 'Saved to this browser only',
    sub: 'No accounts. No tracking. Clear cache or switch browsers and progress resets.',
    ttl: 8500
  });
}

/* ─── Helpers ───────────────────────────────────────────────── */
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function escape(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ─── Entry point ───────────────────────────────────────────── */
async function init() {
  startParticles();
  wireSidebarToggle();
  wireThemeToggle();

  try {
    const res = await fetch(COURSE_DATA_URL, { cache: 'no-cache' });
    COURSE = await res.json();
  } catch (e) {
    console.error('Failed to load course.json:', e);
    return;
  }

  const mode = document.body.dataset.page;
  const progress = loadProgress();
  CURRENT_LECTURE_ID = mode === 'lecture' ? document.body.dataset.lectureId : null;

  renderSidebar(COURSE, progress, CURRENT_LECTURE_ID);

  if (mode === 'lecture') {
    renderLecturePage(COURSE, progress, CURRENT_LECTURE_ID);
    loadTutorial();
  } else {
    renderLanding(COURSE, progress);
  }
}

document.addEventListener('DOMContentLoaded', init);
