// The elegant ending: once Open Channel scrolls into view, the closing dot
// lights up once — the circuit the hero opened at Arrival completes here.
// One-shot, no loop; reduced-motion users just get the lit (locked) state
// immediately since the CSS transition is globally disabled for them.
export function initClosingMoment(){
  const el = document.querySelector('[data-channel-close]');
  if(!el || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        el.classList.add('is-locked');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  io.observe(el);
}
