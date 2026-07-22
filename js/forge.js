// The workshop scene: sideways camera pan (wheel / drag / arrow keys),
// pointer parallax on the three SVG layers, and the camera zoom played
// when a hotspot is chosen before handing off to the view router.
// Hotspots are plain anchors, so with no JS navigation still works as
// ordinary in-page links straight to the (then-visible-by-router) views.
import { navigate } from './views.js';

export function initForge(){
  const stage = document.getElementById('forge');
  const pan = document.getElementById('forgePan');
  const world = document.getElementById('forgeWorld');
  const hero = document.getElementById('heroContent');
  if(!stage || !pan || !world) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  const isNarrow = () => window.innerWidth <= 700;
  const atHome = () => document.body.classList.contains('at-home');

  // ---- Sideways pan across the room. ----
  let cur = 0, tgt = 0, raf = null, worldW = 0, viewW = 0, maxPan = 0;

  function clampPan(v){ return Math.max(0, Math.min(maxPan, v)); }
  function apply(v){
    pan.style.transform = 'translateX(' + (-v) + 'px)';
    // The hero copy belongs to the bench end of the room — let it step
    // aside as the camera walks away.
    if(hero) hero.style.opacity = String(Math.max(0, 1 - v / 420));
  }
  function step(){
    cur += (tgt - cur) * 0.14;
    if(Math.abs(tgt - cur) < 0.5){ cur = tgt; apply(cur); raf = null; return; }
    apply(cur);
    raf = requestAnimationFrame(step);
  }
  function kick(){
    if(reduceMotion){ cur = tgt; apply(cur); return; }
    if(raf === null) raf = requestAnimationFrame(step);
  }
  function measure(){
    if(isNarrow()){ pan.style.transform = ''; if(hero) hero.style.opacity = ''; maxPan = 0; return; }
    worldW = world.offsetWidth;
    viewW = stage.clientWidth;
    maxPan = Math.max(0, worldW - viewW);
    if(maxPan === 0){
      cur = tgt = 0;
      pan.style.transform = 'translateX(' + ((viewW - worldW) / 2) + 'px)';
    } else {
      tgt = clampPan(tgt);
      cur = clampPan(cur);
      apply(cur);
    }
  }
  measure();
  window.addEventListener('resize', measure);

  stage.addEventListener('wheel', e => {
    if(isNarrow() || !atHome() || maxPan === 0) return;
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    tgt = clampPan(tgt + d * 1.15);
    kick();
  }, { passive: false });

  // Drag-to-pan (tablets and mouse alike). A drag longer than 6px swallows
  // the click so letting go over a hotspot doesn't accidentally open it.
  let dragging = false, dragMoved = false, dragStartX = 0, tgtStart = 0, pid = null;
  stage.addEventListener('pointerdown', e => {
    if(isNarrow() || maxPan === 0 || e.button !== 0) return;
    dragging = true; dragMoved = false; dragStartX = e.clientX; tgtStart = tgt; pid = e.pointerId;
  });
  window.addEventListener('pointermove', e => {
    if(!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - dragStartX;
    if(Math.abs(dx) > 6) dragMoved = true;
    tgt = clampPan(tgtStart - dx);
    kick();
  });
  window.addEventListener('pointerup', e => { if(e.pointerId === pid) dragging = false; });
  stage.addEventListener('click', e => {
    if(dragMoved){ e.preventDefault(); e.stopPropagation(); dragMoved = false; }
  }, true);

  window.addEventListener('keydown', e => {
    if(!atHome() || isNarrow() || maxPan === 0) return;
    if(e.key === 'ArrowRight'){ e.preventDefault(); tgt = clampPan(tgt + 260); kick(); }
    else if(e.key === 'ArrowLeft'){ e.preventDefault(); tgt = clampPan(tgt - 260); kick(); }
  });

  // Keep keyboard-focused hotspots inside the camera frame.
  stage.addEventListener('focusin', e => {
    const a = e.target.closest ? e.target.closest('a.hotspot') : null;
    if(!a || maxPan === 0 || isNarrow()) return;
    const r = a.getBoundingClientRect();
    if(r.left < 60) tgt = clampPan(tgt - (60 - r.left));
    else if(r.right > viewW - 60) tgt = clampPan(tgt + (r.right - (viewW - 60)));
    kick();
  });

  // ---- Pointer parallax, throttled to one write per frame. ----
  if(!reduceMotion && canHover){
    let px = 0, py = 0, prRaf = null;
    stage.addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if(prRaf === null){
        prRaf = requestAnimationFrame(() => {
          stage.style.setProperty('--px', px.toFixed(3));
          stage.style.setProperty('--py', py.toFixed(3));
          prRaf = null;
        });
      }
    });
    stage.addEventListener('mouseleave', () => {
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    });
  }

  // ---- Camera zoom into a chosen object, then hand off to the router. ----
  stage.querySelectorAll('a.hotspot').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href') || '';
      if(!href.startsWith('#')) return;
      const id = href.slice(1);
      if(!document.getElementById(id)) return; // fall back to default behavior
      e.preventDefault();

      if(!reduceMotion && !isNarrow()){
        const wr = world.getBoundingClientRect();
        const hr = a.getBoundingClientRect();
        const ox = ((hr.left + hr.width / 2 - wr.left) / wr.width * 100).toFixed(2);
        const oy = ((hr.top + hr.height / 2 - wr.top) / wr.height * 100).toFixed(2);
        world.style.transformOrigin = ox + '% ' + oy + '%';
        world.classList.add('is-zooming');
      }
      navigate(id, {
        delay: isNarrow() ? 380 : 620,
        after(){
          // Reset the camera silently while the veil still covers it.
          // setTimeout, not requestAnimationFrame — see the comment on
          // navigate() in views.js for why rAF isn't safe to rely on here.
          world.style.transition = 'none';
          world.classList.remove('is-zooming');
          setTimeout(() => { world.style.transition = ''; }, 16);
        }
      });
    });
  });
}
