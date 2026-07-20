// Ambient life: a handful of near-invisible drifting motes, fixed to the
// viewport so they read as atmosphere rather than page content. This is a
// deliberate, narrow exception to "no idle/looping decorative animation"
// from the original visual-language pass — the Director's Pass explicitly
// asked for restrained environmental life, so this exists to satisfy that
// without becoming a distraction: low count, very slow, very low opacity,
// and skipped entirely under prefers-reduced-motion (no static remnant
// either — there's nothing here worth keeping once motion is off).
export function initAmbient(){
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion) return;

  const layer = document.createElement('div');
  layer.className = 'ambient';
  layer.setAttribute('aria-hidden', 'true');

  const COUNT = 9;
  for(let i = 0; i < COUNT; i++){
    const mote = document.createElement('span');
    const size = 2 + Math.random() * 3;
    const duration = 50 + Math.random() * 40;
    const delay = Math.random() * -90;
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const dx = (Math.random() * 60 - 30).toFixed(0) + 'px';
    const dy = (-40 - Math.random() * 60).toFixed(0) + 'px';
    mote.style.cssText =
      `width:${size}px;height:${size}px;left:${startX}%;top:${startY}%;` +
      `animation-duration:${duration}s;animation-delay:${delay}s;` +
      `--dx:${dx};--dy:${dy};`;
    layer.appendChild(mote);
  }

  document.body.insertBefore(layer, document.body.firstChild);
}
