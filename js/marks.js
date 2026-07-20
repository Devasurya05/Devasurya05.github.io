// The Visitors' Wall: a shield every visitor may strike exactly one mark
// into — a sigil, a metal, and up to three initials. Marks are constrained
// to this fixed vocabulary (validated on read AND write, and rendered only
// via createElementNS/textContent), so nothing free-form or executable can
// ever reach another visitor's screen.
import { BACKEND, SUPABASE_URL, SUPABASE_ANON_KEY } from './marks-config.js';

const SIGILS = [
  { name: 'Hammer',   d: 'M-9 -7 H5 V-1 H-9 Z M-2 -1 V11' },
  { name: 'Anvil',    d: 'M-10 -5 H10 L5 1 H2 V7 H-6 V1 H-10 Z M-8 10 H8' },
  { name: 'Star',     d: 'M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z' },
  { name: 'Crescent', d: 'M5 -10 A11 11 0 1 0 5 10 A8 8 0 1 1 5 -10 Z' },
  { name: 'Gear',     d: 'M0 -12 V-8 M0 8 V12 M-12 0 H-8 M8 0 H12 M6 0 A6 6 0 1 1 -6 0 A6 6 0 1 1 6 0' },
  { name: 'Leaf',     d: 'M0 12 Q-10 2 0 -12 Q10 2 0 12 Z M0 9 V-7' },
  { name: 'Bolt',     d: 'M3 -12 L-7 2 H-1 L-3 12 L7 -2 H1 Z' },
  { name: 'Rune',     d: 'M0 12 V-4 M0 -4 L-8 -11 M0 -4 L8 -11' }
];
const COLORS = ['#b8853a', '#e8a54b', '#ff7a2f', '#ffb36b', '#e8e2d3', '#4a8fc2'];
const SVG_NS = 'http://www.w3.org/2000/svg';
const LS_MARKS = 'forge-marks';
const LS_LEFT = 'forge-mark-left';

const supabaseReady = BACKEND === 'supabase' && SUPABASE_URL && SUPABASE_ANON_KEY;

// ---- validation: the only shapes a mark can take ----
function normalize(raw){
  if(!raw || typeof raw !== 'object') return null;
  const sigil = Number(raw.sigil);
  const color = String(raw.color || '');
  const initials = String(raw.initials || '').toUpperCase();
  if(!Number.isInteger(sigil) || sigil < 0 || sigil >= SIGILS.length) return null;
  if(COLORS.indexOf(color) === -1) return null;
  if(!/^[A-Z0-9]{1,3}$/.test(initials)) return null;
  return { sigil, color, initials };
}

// ---- storage ----
function localList(){
  try{
    const arr = JSON.parse(localStorage.getItem(LS_MARKS) || '[]');
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}

async function listMarks(){
  if(supabaseReady){
    const res = await fetch(SUPABASE_URL + '/rest/v1/marks?select=sigil,color,initials&order=id.asc&limit=500', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY }
    });
    if(!res.ok) throw new Error('marks fetch failed: ' + res.status);
    return (await res.json()).map(normalize).filter(Boolean);
  }
  return localList().map(normalize).filter(Boolean);
}

async function addMark(mark){
  if(supabaseReady){
    const res = await fetch(SUPABASE_URL + '/rest/v1/marks', {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(mark)
    });
    if(!res.ok) throw new Error('mark insert failed: ' + res.status);
  } else {
    const arr = localList();
    arr.push(mark);
    localStorage.setItem(LS_MARKS, JSON.stringify(arr));
  }
  localStorage.setItem(LS_LEFT, '1');
}

function hasLeftMark(){ return localStorage.getItem(LS_LEFT) === '1'; }

// ---- rendering ----
// Golden-angle spiral from the shield's center; the clipPath in the SVG
// keeps late arrivals inside the steel.
function markPosition(i){
  const r = 16 * Math.sqrt(i);
  const a = i * 2.39996;
  return { x: 200 + r * Math.cos(a), y: 215 + r * Math.sin(a) * 1.05 };
}

function renderMark(container, mark, i, isNew){
  const pos = markPosition(i);
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('transform', 'translate(' + pos.x.toFixed(1) + ' ' + pos.y.toFixed(1) + ')');
  if(isNew) g.classList.add('mark-new');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', SIGILS[mark.sigil].d);
  path.setAttribute('transform', 'scale(1.1)');
  path.setAttribute('stroke', mark.color);
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  const text = document.createElementNS(SVG_NS, 'text');
  text.textContent = mark.initials;
  text.setAttribute('y', '21');
  text.setAttribute('fill', mark.color);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('style', "font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:0.08em;");
  const title = document.createElementNS(SVG_NS, 'title');
  title.textContent = SIGILS[mark.sigil].name + ' — ' + mark.initials;
  g.appendChild(title);
  g.appendChild(path);
  g.appendChild(text);
  container.appendChild(g);
}

// The same marks also appear on the shield hanging in the workshop scene,
// so the wall is visibly alive without anyone clicking into it.
function renderSceneMark(container, mark, i){
  const r = 13 * Math.sqrt(i);
  const a = i * 2.39996;
  const g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('transform',
    'translate(' + (2640 + r * Math.cos(a)).toFixed(1) + ' ' + (435 + r * Math.sin(a) * 1.05).toFixed(1) + ')');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', SIGILS[mark.sigil].d);
  path.setAttribute('stroke', mark.color);
  path.setAttribute('stroke-width', '1.6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('opacity', '0.9');
  g.appendChild(path);
  container.appendChild(g);
}

function renderAll(marks, newIndex){
  const container = document.getElementById('wallMarks');
  const count = document.getElementById('wallCount');
  if(container && count){
    while(container.firstChild) container.removeChild(container.firstChild);
    marks.forEach((m, i) => renderMark(container, m, i, i === newIndex));
    count.textContent = marks.length + (marks.length === 1 ? ' MARK' : ' MARKS') + ' ON THE SHIELD';
  }
  const scene = document.getElementById('sceneMarks');
  if(scene){
    while(scene.firstChild) scene.removeChild(scene.firstChild);
    marks.slice(0, 90).forEach((m, i) => renderSceneMark(scene, m, i));
  }
}

// ---- form ----
function buildOptions(){
  const sigilGrid = document.getElementById('sigilGrid');
  const colorRow = document.getElementById('colorRow');
  if(!sigilGrid || !colorRow) return;

  SIGILS.forEach((s, i) => {
    const label = document.createElement('label');
    label.className = 'sigil-option';
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'sigil'; input.value = String(i);
    input.setAttribute('aria-label', s.name);
    if(i === 0) input.checked = true;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-16 -16 32 32');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', s.d);
    svg.appendChild(path);
    label.appendChild(input);
    label.appendChild(svg);
    sigilGrid.appendChild(label);
  });

  COLORS.forEach((c, i) => {
    const label = document.createElement('label');
    label.className = 'color-option';
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'color'; input.value = c;
    input.setAttribute('aria-label', 'Metal ' + (i + 1));
    if(i === 0) input.checked = true;
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.background = c;
    label.appendChild(input);
    label.appendChild(swatch);
    colorRow.appendChild(label);
  });
}

function lockForm(form, status, message){
  form.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
  if(message) status.textContent = message;
}

export function initWall(){
  const form = document.getElementById('markForm');
  const status = document.getElementById('markStatus');
  const mode = document.getElementById('wallMode');
  if(!form || !status) return;

  buildOptions();

  if(mode){
    mode.textContent = supabaseReady
      ? 'Marks are shared with every visitor — one strike each.'
      : 'DEMO MODE — marks are stored in this browser only. To share the wall with every visitor, connect the free guestbook backend (see README-GUESTBOOK.md).';
  }

  let marks = [];
  listMarks()
    .then(list => { marks = list; renderAll(marks); })
    .catch(() => { status.textContent = 'The wall could not be reached — try again later.'; });

  if(hasLeftMark()){
    lockForm(form, status, 'Your mark is already on the shield — one strike per visitor.');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if(hasLeftMark()) return;
    const data = new FormData(form);
    const mark = normalize({
      sigil: data.get('sigil'),
      color: data.get('color'),
      initials: data.get('initials')
    });
    if(!mark){
      status.textContent = 'Initials must be 1–3 letters or digits.';
      return;
    }
    status.textContent = 'Striking…';
    addMark(mark)
      .then(() => {
        marks.push(mark);
        renderAll(marks, marks.length - 1);
        lockForm(form, status, 'Struck. Your mark hangs on the wall.');
      })
      .catch(() => { status.textContent = 'The strike didn’t land — try again in a moment.'; });
  });
}
