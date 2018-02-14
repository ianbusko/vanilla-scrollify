import easing from './easing.js';
import ScrollModule from './scroll-module.js';

export default function Scrollify(options){
	'use strict';
	var heights = [],
		names = [],
		elements = [],
		index = 0,
		currentIndex = 0,
		hasLocation = false,
		timeoutId,
		timeoutId2,
		top = getScrollTop(),
		scrollable = false,
		locked = false,
		scrolled = false,
		manualScroll,
		swipeScroll,
		util,
		disabled = false,
		scrollSamples = [],
		scrollTime = new Date().getTime(),
		firstLoad = true,
		destination = 0,
		wheelEvent = 'onwheel' in document ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll',
		settings = {
			section: '.section',
			sectionName: 'section-name',
			offset : 0,
			scrollEasing: easing.easeInOutQuad,
			scrollDuration: 1000,
			scrollbars: false,
			target:'html,body',
			standardScrollElements: false,
			setHeights: true,
			updateHash: true,
			before:function() {},
			after:function() {},
			afterResize:function() {},
			afterRender:function() {}
		};

	settings = Object.assign(settings, options);
	const scrollModule = new ScrollModule({
		easing: settings.scrollEasing,
		offset: settings.offset,
		duration: settings.scrollDuration
	});

	// replace $window.scrollTop()
	function getScrollTop(){
		return (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
	}

	function updateHistory(panelName){
		if(history.pushState) {
			try {
				history.replaceState(null, null, panelName);
			} catch (e) {
				if(window.console) {
					console.warn('Scrollify warning: Page must be hosted to manipulate the hash value.');
				}
			}
		} else {
			window.location.hash = panelName;
		}
	}

	function warnHashValue(){
		if(window.location.hash.length && settings.sectionName && window.console) {
			try {
				if(document.querySelectorAll(window.location.hash).length > 0){
					console.warn('Scrollify warning: ID matches hash value - this will cause the page to anchor.');
				}
			} catch (e) {}
		}
	}

	function animateScroll(index,instant,callbacks,toTop) {
		if(currentIndex===index) {
			callbacks = false;
		}
		if(disabled===true) {
			return true;
		}

		if(!names[index]){
			return;
		}

		scrollable = false;
		if(callbacks) {
			settings.before(index,elements);
		}

		// TODO: move this into its own function
		if(settings.updateHash && settings.sectionName && !(firstLoad===true && index===0)) {
			updateHistory(names[index]);
		}
		if(firstLoad) {
			settings.afterRender(index);
			firstLoad = false;
		}

		currentIndex = index;

		if(instant) {
      scrollModule.scrollTo(elements[index], instant).then(() => {
				if(callbacks) {
					settings.after(index,elements);
				}
			});
		} else {
			locked = true;
			warnHashValue();

      scrollModule.scrollTo(elements[index]).then(() => {
				locked = false;
				firstLoad = false;
				if(callbacks) {
					settings.after(index,elements);
				}
			});
		}
	}

	function isAccelerating(samples) {
		function average(num) {
			var sum = 0;

			var lastElements = samples.slice(Math.max(samples.length - num, 1));

      for(var i = 0; i < lastElements.length; i++){
          sum += lastElements[i];
      }

      return Math.ceil(sum/num);
		}

		var avEnd = average(10);
    var avMiddle = average(70);

    if(avEnd >= avMiddle) {
			return true;
		} else {
			return false;
		}
	}

	manualScroll = {
		handleMousedown:function() {
			if(disabled===true) {
				return true;
			}
			scrollable = false;
			scrolled = false;
		},
		handleMouseup:function() {
			if(disabled===true) {
				return true;
			}
			scrollable = true;
			if(scrolled) {
				//instant,callbacks
				manualScroll.calculateNearest(false,true);
			}
		},
		handleScroll:function() {
			if(disabled===true) {
				return true;
			}
			if(timeoutId){
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(function(){
				scrolled = true;
				if(scrollable===false) {
					return false;
				}
				scrollable = false;
				//instant,callbacks
				manualScroll.calculateNearest(false,true);
			}, 200);
		},
		calculateNearest:function(instant,callbacks) {
			top = getScrollTop();
			var i =1,
				max = heights.length,
				closest = 0,
				prev = Math.abs(heights[0] - top),
				diff;
			for(;i<max;i++) {
				diff = Math.abs(heights[i] - top);

				if(diff < prev) {
					prev = diff;
					closest = i;
				}
			}
			if((atBottom() && closest>index) || atTop()) {
				index = closest;
				//index, instant, callbacks, toTop
				animateScroll(closest,instant,callbacks,false);
			}
		},
		wheelHandler:function(e) {
			if(disabled===true) {
				return true;
			} else if(settings.standardScrollElements) {

				if(e.target.matches(settings.standardScrollElements) || e.target.closest(settings.standardScrollElements).length) {
					return true;
				}
			}
			e.preventDefault();
			var currentScrollTime = new Date().getTime();

			e = e || window.event;
			var value = e.wheelDelta || -e.deltaY || -e.detail;
			var delta = Math.max(-1, Math.min(1, value));

			if(scrollSamples.length > 149){
				scrollSamples.shift();
			}
			scrollSamples.push(Math.abs(value));

			if((currentScrollTime-scrollTime) > 200){
				scrollSamples = [];
			}
			scrollTime = currentScrollTime;

			if(locked) {
				return false;
			}
			if(delta<0) {
				if(index<heights.length-1) {
					if(atBottom()) {
						if(isAccelerating(scrollSamples)) {
							e.preventDefault();
							index++;
							locked = true;
							//index, instant, callbacks, toTop
							animateScroll(index,false,true, false);
						} else {
							return false;
						}
					}
				}
			} else if(delta>0) {
				if(index>0) {
					if(atTop()) {
						if(isAccelerating(scrollSamples)) {
							e.preventDefault();
							index--;
							locked = true;
							//index, instant, callbacks, toTop
							animateScroll(index,false,true, false);
						} else {
							return false
						}
					}
				}
			}

		},
		keyHandler:function(e) {
			if(disabled===true) {
				return true;
			}
			if(locked===true) {
				return false;
			}
			if(e.keyCode==38 || e.keyCode==33) {
				if(index>0) {
					if(atTop()) {
						e.preventDefault();
						index--;
						//index, instant, callbacks, toTop
						animateScroll(index,false,true,false);
					}
				}
			} else if(e.keyCode==40 || e.keyCode==34) {
				if(index<heights.length-1) {
					if(atBottom()) {
						e.preventDefault();
						index++;
						//index, instant, callbacks, toTop
						animateScroll(index,false,true,false);
					}
				}
			}
		},
		init:function() {
			if(settings.scrollbars) {
				window.addEventListener('mousedown', manualScroll.handleMousedown);
				window.addEventListener('mouseup', manualScroll.handleMouseup);
				window.addEventListener('scroll', manualScroll.handleScroll);
			} else {
				document.querySelector('body').style.overflow = 'hidden';
			}

			window.addEventListener(wheelEvent, manualScroll.wheelHandler);
			window.addEventListener('keydown', manualScroll.keyHandler);
		}
	};

	// TODO: move these into manualScroll
	function atTop() {
		return true;
	}
	function atBottom() {
		return true;
	}

	util = {
		refresh:function(withCallback,scroll) {
			clearTimeout(timeoutId2);
			timeoutId2 = setTimeout(function() {
				//retain position
				sizePanels(true);
				//scroll, firstLoad
				calculatePositions(scroll,false);
				if(withCallback) {
					settings.afterResize();
				}
			},400);
		},
		handleUpdate:function() {
			//callbacks, scroll
			//changed from false,true to false,false
			util.refresh(false,false);
		},
		handleResize:function() {
			//callbacks, scroll
			util.refresh(true,false);
		},
		handleOrientation:function() {
			//callbacks, scroll
			util.refresh(true,true);
		}
	};

	function sizePanels(keepPosition) {
		if(keepPosition) {
			top = getScrollTop();
		}

		var selector = settings.section;

		// TODO: break this out into extra methods
		document.querySelectorAll(selector)
			.forEach(function(val, i){
				if(settings.setHeights){

					val.style.height = '';
					if((val.offsetHeight <= window.innerHeight) || val.style.overflow === 'hidden' ){
						val.style.height = window.innerHeight;
					}
				}
			});

		if(keepPosition) {
			// TODO: make this work (should set scroll top to top);
			getScrollTop(top);
		}
	}
	function calculatePositions(scroll,firstLoad) {
		var selector = settings.section;

		heights = [];
		names = [];
		elements = [];

		document.querySelectorAll(selector)
			.forEach(function(val, i){
				if(i>0) {
					heights[i] = parseInt(val.getBoundingClientRect().top + document.documentElement.scrollTop) + settings.offset;
				} else {
					heights[i] = parseInt(val.getBoundingClientRect().top + document.documentElement.scrollTop);
				}
				if(settings.sectionName && val.getAttribute(settings.sectionName)) {
					names[i] = '#' + val.getAttribute(settings.sectionName).toString().replace(/ /g,'-');
				} else {
						names[i] = '#' + (i + 1);
				}
				elements[i] = val;

				try {
					if(document.getElementById(names[i]) && window.console){
						console.warn('Scrollify warning: Section names can\'t match IDs - this will cause the browser to anchor.');
					}
				} catch (e) {}

				if(window.location.hash===names[i]) {
					index = i;
					hasLocation = true;
				}
			});

		if(true===scroll) {
			//index, instant, callbacks, toTop
			animateScroll(index,false,false,false);
		}
	}

	class Scroller{
		constructor(options){
			this.settings = Object.assign(settings, options);

			//retain position
			sizePanels(false);
			calculatePositions(false,true);

			if(true===hasLocation) {
				//index, instant, callbacks, toTop
				animateScroll(index,false,true,true);
			} else {
				setTimeout(function() {
					//instant,callbacks
					manualScroll.calculateNearest(true,false);
				},200);
			}
			if(heights.length) {
				manualScroll.init();
				window.addEventListener('resize', util.handleResize);
				if (document.addEventListener) {
					window.addEventListener('orientationchange', util.handleOrientation, false);
				}
			}
		}

		_move(panel,instant) {
			var z = names.length;
			for(;z>=0;z--) {
				if(typeof panel === 'string') {
					if (names[z]===panel) {
						index = z;
						//index, instant, callbacks, toTop
						animateScroll(z,instant,true,true);
					}
				} else {
					if(z===panel) {
						index = z;
						//index, instant, callbacks, toTop
						animateScroll(z,instant,true,true);
					}
				}
			}
		};

		move(panel) {
			if(panel===undefined) {
				return false;
			}
			this._move(panel,false);
		};

		instantMove(panel) {
			if(panel===undefined) {
				return false;
			}
			this._move(panel,true);
		};

		next() {
			if(index<names.length) {
				index += 1;
				//index, instant, callbacks, toTop
				animateScroll(index,false,true,true);
			}
		};

		previous() {
			if(index>0) {
				index -= 1;
				//index, instant, callbacks, toTop
				animateScroll(index,false,true,true);
			}
		};

		instantNext() {
			if(index<names.length) {
				index += 1;
				//index, instant, callbacks, toTop
				animateScroll(index,true,true,true);
			}
		};

		instantPrevious() {
			if(index>0) {
				index -= 1;
				//index, instant, callbacks, toTop
				animateScroll(index,true,true,true);
			}
		};

		destroy() {
			if(settings.setHeights) {
				document.querySelectorAll(settings.section).forEach(function(val){
					val.style.height = '';
				});
			}

			window.removeEventListener('resize', util.handleResize);
			// TODO: remove settings.scrollbars
			if(settings.scrollbars) {
				window.removeEventListener('mousedown', manualScroll.handleMousedown);
				window.removeEventListener('mouseup', manualScroll.handleMouseup);
				window.removeEventListener('scroll', manualScroll.handleScroll);
			}

			window.removeEventListener(wheelEvent, manualScroll.wheelHandler);
			window.removeEventListener('keydown', manualScroll.keyHandler);

			heights = [];
			names = [];
			elements = [];
		};

		update() {
			util.handleUpdate();
		};

		current() {
			return elements[index];
		};

		disable() {
			disabled = true;
			document.querySelector('body').style.overflow = '';
		};

		enable() {
			disabled = false;
			if(!settings.scrollbars) {
				document.querySelector('body').style.overflow = 'hidden';
			}
			//instant,callbacks
			manualScroll.calculateNearest(false,false);
		};

		isDisabled() {
			return disabled;
		};

		setOptions(updatedOptions) {
			if(typeof updatedOptions === 'object') {
				settings = Object.assign(settings, updatedOptions);
				util.handleUpdate();
			} else if(window.console) {
				console.warn('Scrollify warning: setOptions expects an object.');
			}
		};

		getOptions(){
			return this.settings;
		};
	}

	return new Scroller(options);
}
