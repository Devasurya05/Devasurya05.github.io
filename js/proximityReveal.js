// Proximity-reveal grammar: shared by every .project panel. Mouse position
// (or touch drag) sets --mx/--my, which the masked schematic layer follows.
export function initProximityReveal(){
  var panels = document.querySelectorAll('.project');
  panels.forEach(function(panel){
    function setPos(x, y){
      var r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', ((x - r.left) / r.width * 100) + '%');
      panel.style.setProperty('--my', ((y - r.top) / r.height * 100) + '%');
    }
    panel.addEventListener('mouseenter', function(){ panel.classList.add('is-active'); });
    panel.addEventListener('mouseleave', function(){ panel.classList.remove('is-active'); });
    panel.addEventListener('mousemove', function(e){ setPos(e.clientX, e.clientY); });
    panel.addEventListener('touchstart', function(e){
      panel.classList.add('is-active');
      var t = e.touches[0]; setPos(t.clientX, t.clientY);
    }, {passive:true});
    panel.addEventListener('touchmove', function(e){
      var t = e.touches[0]; setPos(t.clientX, t.clientY);
    }, {passive:true});
    panel.addEventListener('touchend', function(){ panel.classList.remove('is-active'); });
  });
}
