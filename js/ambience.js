// Optional forge ambience: fire rumble + crackle synthesized with WebAudio.
// No audio assets, no autoplay — the AudioContext is only ever created from
// the toggle's own click (a user gesture), and everything tears down cleanly
// when switched off.
export function initAmbience(){
  const btn = document.getElementById('ambienceToggle');
  if(!btn || !(window.AudioContext || window.webkitAudioContext)) return;

  let ctx = null, master = null, bedSrc = null, crackleTimer = null, hammerTimer = null;

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

  // A single hammer strike: a short metallic ring (bandpassed noise burst)
  // layered over a low anvil thump (a quick falling sine). Kept quieter than
  // the crackle bed so it reads as steady background work, not a foreground
  // sound effect.
  function hammerHit(){
    const now = ctx.currentTime;

    const dur = 0.16;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i = 0; i < len; i++){
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800 + Math.random() * 900;
    bp.Q.value = 3.2;
    const ringGain = ctx.createGain();
    ringGain.gain.value = 0.12;
    src.connect(bp); bp.connect(ringGain); ringGain.connect(master);
    src.start(now);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.12);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.16, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(thumpGain); thumpGain.connect(master);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  function scheduleHammer(){
    hammerTimer = setTimeout(() => {
      hammerHit();
      scheduleHammer();
    }, 1100 + Math.random() * 900); // roughly every 1.1-2s
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
    scheduleHammer();
  }

  function stop(){
    clearTimeout(crackleTimer);
    crackleTimer = null;
    clearTimeout(hammerTimer);
    hammerTimer = null;
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
