// Optional forge ambience: fire rumble + crackle synthesized with WebAudio.
// No audio assets, no autoplay — the AudioContext is only ever created from
// the toggle's own click (a user gesture), and everything tears down cleanly
// when switched off.
export function initAmbience(){
  const btn = document.getElementById('ambienceToggle');
  if(!btn || !(window.AudioContext || window.webkitAudioContext)) return;

  let ctx = null, master = null, bedSrc = null, crackleTimer = null;

  function makeBrownNoise(){
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for(let i = 0; i < len; i++){
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  }

  function crackle(){
    const dur = 0.02 + Math.random() * 0.05;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i = 0; i < len; i++){
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100 + Math.random() * 2600;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = 0.10 + Math.random() * 0.18;
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start();
  }

  function scheduleCrackle(){
    crackleTimer = setTimeout(() => {
      crackle();
      if(Math.random() < 0.35) crackle(); // occasional double-pop
      scheduleCrackle();
    }, 130 + Math.random() * 480);
  }

  function start(){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!ctx) ctx = new AC();
    if(ctx.state === 'suspended') ctx.resume();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    bedSrc = ctx.createBufferSource();
    bedSrc.buffer = makeBrownNoise();
    bedSrc.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.5;
    bedSrc.connect(lp); lp.connect(bedGain); bedGain.connect(master);
    bedSrc.start();

    master.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 1.4);
    scheduleCrackle();
  }

  function stop(){
    clearTimeout(crackleTimer);
    crackleTimer = null;
    if(master) master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    const dying = bedSrc;
    bedSrc = null;
    setTimeout(() => { if(dying){ try{ dying.stop(); }catch(e){} } }, 600);
  }

  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') === 'true';
    btn.setAttribute('aria-pressed', on ? 'false' : 'true');
    if(on) stop(); else start();
  });
}
