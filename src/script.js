import Scrollify from './scrollify.js';
import ScrollModule from './smooth-scroll-module.js';

window.scrollTo(0,0);

// TODO: pass easing as a parameter correctly
var scrollModule = new ScrollModule({
  duration: 1100,
  offset: 0
});

var scroller = new Scrollify(scrollModule);
