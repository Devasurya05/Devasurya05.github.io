// Ember particles rising from the hearth. Particles live in SVG viewBox
// coordinates (1600x900) and are projected through the same cover-fit math
// the scene's preserveAspectRatio="slice" uses, so they stay glued to the
// coals at any viewport size. Skipped under reduced motion; paused whenever
// the forge is off-screen or the tab is hidden.
export function initEmbers(){
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('forgeEmbers');
  if(!canvas) return;
  if(reduceMotion){ canvas.remove(); return; }

  const scene = document.querySelector('.forge-scene');
  const stage = document.getElementById('forge');
  const ctx = canvas.getContext('2d');
  if(!scene || !stage || !ctx) return;

  const VB_W = 3200, VB_H = 900;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let scale = 1, offX = 0, offY = 0;

  function size(){
    const r = scene.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    scale = Math.max(canvas.width / VB_W, canvas.height / VB_H);
    offX = (canvas.width - VB_W * scale) / 2;
    offY = (canvas.height - VB_H * scale) / 2;
  }
  size();
  window.addEventListener('resize', size);

  const COUNT = 42;
  const particles = [];
  function spawn(p){
    p.x = 2000 + Math.random() * 210;   // hearth coal bed, SVG coords
    p.y = 700 + Math.random() * 65;
    p.vy = -(0.35 + Math.random() * 0.75);
    p.sway = 0.4 + Math.random() * 0.9;
    p.seed = Math.random() * Math.PI * 2;
    p.r = 1 + Math.random() * 2.2;
    p.life = 0;
    p.maxLife = 140 + Math.random() * 160;
    return p;
  }
  for(let i = 0; i < COUNT; i++){
    const p = spawn({});
    p.life = Math.random() * p.maxLife; // desynchronize the first wave
    particles.push(p);
  }

  let running = false, raf = null, last = 0;
  const FRAME_MS = 33; // ~30fps is plenty for drifting embers, and keeps the
                       // compositor light on mid-range machines
  function frame(ts){
    if(ts - last < FRAME_MS){
      raf = running ? requestAnimationFrame(frame) : null;
      return;
    }
    last = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    for(const p of particles){
      p.life++;
      if(p.life > p.maxLife){ spawn(p); continue; }
      p.y += p.vy;
      p.x += Math.sin(p.life * 0.03 + p.seed) * p.sway * 0.4;
      const t = p.life / p.maxLife;
      const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      const sx = offX + p.x * scale;
      const sy = offY + p.y * scale;
      const sr = Math.max(0.6, p.r * scale * (1 - t * 0.5));
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,' + Math.round(122 + 57 * (1 - t)) + ',47,' + (alpha * 0.7).toFixed(3) + ')';
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    raf = running ? requestAnimationFrame(frame) : null;
  }

  function setRunning(on){
    if(on === running) return;
    running = on;
    if(on && raf === null) raf = requestAnimationFrame(frame);
  }

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries => {
      entries.forEach(entry => setRunning(entry.isIntersecting && !document.hidden));
    }, { threshold: 0.05 }).observe(stage);
  } else {
    setRunning(true);
  }
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) setRunning(false);
    else {
      const r = stage.getBoundingClientRect();
      setRunning(r.bottom > 0 && r.top < window.innerHeight);
    }
  });
}
