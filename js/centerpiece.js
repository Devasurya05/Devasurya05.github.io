// TraceFlow — the centerpiece. Click-through, not scroll-driven: the reader
// controls pace through problem -> decision -> mechanism -> outcome with
// ordinary buttons. Follows the ARIA tablist pattern (roving tabindex,
// arrow/Home/End keys move both focus and selection) — the same accessible
// pattern used for the architecture toggle elsewhere on the page, reused
// deliberately rather than inventing a new interaction per section.
// Scoped per .centerpiece-stages container (not document-wide) — TraceFlow
// and Drifty each run their own independent tablist, and the two panels are
// only distinguished by matching data-stage within the same container, so
// duplicate ids across the two centerpieces can't cross-wire them.
export function initCenterpiece(){
  document.querySelectorAll('.centerpiece-stages').forEach(root => {
    const tabs = Array.from(root.querySelectorAll('.cp-nav-btn'));
    if(!tabs.length) return;

    function activate(tab){
      const stage = tab.getAttribute('data-stage');
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        t.setAttribute('tabindex', active ? '0' : '-1');
      });
      root.querySelectorAll('.cp-stage').forEach(panel => {
        panel.hidden = panel.getAttribute('data-stage') !== stage;
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
  });
}
