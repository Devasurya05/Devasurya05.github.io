// TraceFlow — the centerpiece. Click-through, not scroll-driven: the reader
// controls pace through problem -> decision -> mechanism -> outcome with
// ordinary buttons. Follows the ARIA tablist pattern (roving tabindex,
// arrow/Home/End keys move both focus and selection) — the same accessible
// pattern used for the architecture toggle elsewhere on the page, reused
// deliberately rather than inventing a new interaction per section.
export function initCenterpiece(){
  const tabs = Array.from(document.querySelectorAll('.cp-nav-btn'));
  if(!tabs.length) return;

  function activate(tab){
    const stage = tab.getAttribute('data-stage');
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.setAttribute('tabindex', active ? '0' : '-1');
    });
    document.querySelectorAll('.cp-stage').forEach(panel => {
      panel.hidden = panel.id !== 'cp-panel-' + stage;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', e => {
      let targetIndex = null;
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){ targetIndex = (i + 1) % tabs.length; }
      else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ targetIndex = (i - 1 + tabs.length) % tabs.length; }
      else if(e.key === 'Home'){ targetIndex = 0; }
      else if(e.key === 'End'){ targetIndex = tabs.length - 1; }
      if(targetIndex !== null){
        e.preventDefault();
        tabs[targetIndex].focus();
        activate(tabs[targetIndex]);
      }
    });
  });
}
