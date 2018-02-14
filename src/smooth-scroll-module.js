export default class{
  constructor(options){
    this.settings = Object.assign({
      easing: this._easing,
      offset: 0,
      duration: 400,
    }, options);

    this.start,
    this.distance,
    this.duration,
    this.timeStart,
    this.timeElapsed;
  }

  scrollTo(target, instant = false){
    this.distance = this._getDistance(target);
    this.start = window.pageYOffset;
    this.duration = instant ? 0 : this.settings.duration;

    // The promise will resolve when the scroll has reached its endpoint.
    return new Promise((resolve, reject) => {
      requestAnimationFrame((time) => {
        this.timeStart = time;
        this._loop(time, resolve);
      });
    });
  }

  _getDistance(target){
    if (typeof target === 'object'){
    // if the target is a DOM element
       return this.settings.offset + target.getBoundingClientRect().top;
    } else if (typeof target === 'string'){
    // if the target is a selector
      return this.settings.offset + document.querySelector(target).getBoundingClientRect().top;
    } else{
    // if the target is a distance
      return target;
    }
  }

  _loop(time, resolve){
    this.timeElapsed = time - this.timeStart;
    window.scrollTo(0, this.settings.easing(this.timeElapsed, this.start, this.distance, this.duration));

    if (this.timeElapsed < this.duration)
      requestAnimationFrame((time) => this._loop(time, resolve));
    else
      this._end(resolve);
  }

  // When the time is up, scroll to the final endpoint and then resolve the promise.
  _end(resolve){
    window.scrollTo(0, this.start + this.distance);
    resolve();
  }

  // Easing function. This one is borrowed from JQuery UI.
  _easing(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
}
