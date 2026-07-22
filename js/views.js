// View router: the workshop is home; every section is its own full-screen
// view in the same document, so opening one costs zero network time. Hash
// URLs (#smith, #work-eye, …) deep-link and the browser back button works.
// The shared .veil covers the swap so it reads as a camera move, not a jump.
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let busy = false;
let settingHash = false;

function veil(){ return document.getElementById('veil'); }

function viewFor(id){
  const el = document.getElementById(id);
  if(!el) return null;
  return el.classList.contains('view') ? el : el.closest('.view');
}

function showView(id){
  const view = viewFor(id);
  if(!view) return false;
  document.querySelectorAll('.view.is-open').forEach(v => {
    if(v !== view){ v.classList.remove('is-open'); v.hidden = true; }
  });
  view.hidden = false;
  view.classList.add('is-open');
  document.body.classList.remove('at-home');
  document.body.classList.add('in-view');
  window.scrollTo(0, 0);
  const inner = id !== view.id ? document.getElementById(id) : null;
  if(inner){
    inner.scrollIntoView({ behavior: 'instant', block: 'start' });
    inner.focus({ preventScroll: true });
  } else {
    view.focus({ preventScroll: true });
  }
  return true;
}

function showHome(){
  document.querySelectorAll('.view.is-open').forEach(v => {
    v.classList.remove('is-open'); v.hidden = true;
  });
  document.body.classList.add('at-home');
  document.body.classList.remove('in-view');
  window.scrollTo(0, 0);
  const stage = document.getElementById('forge');
  if(stage){
    stage.setAttribute('tabindex', '-1');
    stage.focus({ preventScroll: true });
  }
}

function setHash(id){
  settingHash = true;
  if(id){
    location.hash = id;
  } else if(location.hash){
    history.pushState('', document.title, location.pathname + location.search);
  }
  setTimeout(() => { settingHash = false; }, 0);
}

// id === null means "go home". opts.after runs once the swap has happened
// (still under the veil) — forge.js uses it to reset the camera zoom.
//
// The post-swap pause before lifting the veil uses setTimeout, not
// requestAnimationFrame — rAF can be throttled or fully paused by the
// browser while the tab is backgrounded/inactive, which would leave `busy`
// stuck true and the veil stuck dark, silently deadlocking every future
// navigation until the page is reloaded. setTimeout still fires (even if
// delayed) regardless of tab visibility, so navigation always recovers.
export function navigate(id, opts = {}){
  if(busy) return;
  const doSwap = () => {
    if(id) showView(id); else showHome();
    setHash(id);
    if(opts.after) opts.after();
    setTimeout(() => {
      veil().classList.remove('is-dark');
      busy = false;
    }, 32);
  };
  if(reduceMotion){ doSwap(); return; }
  busy = true;
  veil().classList.add('is-dark');
  setTimeout(doSwap, opts.delay != null ? opts.delay : 320);
}

function route(hash, instant){
  const id = (hash || '').replace(/^#\/?/, '');
  if(!id || id === 'forge'){
    if(instant){ showHome(); } else { navigate(null, { delay: 200 }); }
  } else if(viewFor(id)){
    if(instant){ showView(id); } else { navigate(id, { delay: 200 }); }
  }
}

export function initViews(){
  // Deep links land directly in their view, no transition.
  route(location.hash, true);

  window.addEventListener('hashchange', () => {
    if(!settingHash) route(location.hash, false);
  });

  // Any plain in-page anchor routes through the veil. Scene hotspots are
  // excluded — forge.js gives those the camera-zoom treatment itself.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if(!a || e.defaultPrevented || a.classList.contains('hotspot')) return;
    const id = a.getAttribute('href').slice(1);
    e.preventDefault();
    if(!id) return; // placeholder links (e.g. résumé until the PDF exists)
    if(id === 'forge'){ navigate(null); return; }
    if(viewFor(id)) navigate(id);
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && document.body.classList.contains('in-view')){
      navigate(null);
    }
  });
}
