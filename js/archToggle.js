// Eye Disease architecture toggle — real validation-accuracy numbers only.
export function initArchToggle(){
  var buttons = document.querySelectorAll('.arch-btn');
  if(!buttons.length) return;
  var fill = document.getElementById('archBarFill');
  var num = document.getElementById('archNum');
  var label = document.getElementById('archLabel');
  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      buttons.forEach(function(b){
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      var value = btn.getAttribute('data-value');
      fill.style.width = value + '%';
      num.textContent = value + '%';
      label.textContent = btn.textContent;
    });
  });
}
