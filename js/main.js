import { initViews } from './views.js';
import { initForge } from './forge.js';
import { initEmbers } from './embers.js';
import { initAmbience } from './ambience.js';
import { initWall } from './marks.js';
import { initProximityReveal } from './proximityReveal.js';
import { initArchToggle } from './archToggle.js';
import { initCenterpiece } from './centerpiece.js';
import { initAmbient } from './ambient.js';
import { initClosingMoment } from './closingMoment.js';

document.addEventListener('DOMContentLoaded', function(){
  initViews();   // router first, so a deep-linked hash lands before anything measures
  initForge();
  initEmbers();
  initAmbience();
  initWall();
  initProximityReveal();
  initArchToggle();
  initCenterpiece();
  initAmbient();
  initClosingMoment();
});
