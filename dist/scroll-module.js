'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScrollModule = function () {
  function ScrollModule(options) {
    _classCallCheck(this, ScrollModule);

    this.settings = Object.assign({
      easing: this._easeInOutQuad,
      callback: function callback() {},
      offset: 0,
      duration: 4000
    }, options);

    this.start, this.distance, this.duration, this.timeStart, this.timeElapsed;
  }

  _createClass(ScrollModule, [{
    key: 'asyncThing',
    value: function asyncThing(asyncParam) // something async returning a promise
    {
      var _this = this;

      return new Promise(function (resolve, reject) {
        requestAnimationFrame(function (time) {
          if (!_this.timeStart) {
            _this.timeStart = time;
          }

          _this.timeElapsed = time - _this.timeStart;
          resolve(); // resolve with parameter value passed
        });
      });
    }
  }, {
    key: 'recFun',
    value: function recFun(time) // asynchronous recursive function
    {
      var _this2 = this;

      // this.timeElapsed = time - this.timeStart;
      window.scrollTo(0, this.settings.easing(this.timeElapsed, this.start, this.distance, this.duration));

      function decide() {
        if (this.timeElapsed < this.duration) return this.recFun();
        // requestAnimationFrame((time) => this._loop(time).then(resolve(this._resolveEnd())));
        else return this._end();
        // resolve(this._end());
      }

      // window.scrollTo(0, this.settings.easing(this.timeElapsed, this.start, this.distance, this.duration));
      // return new Promise((resolve) => {
      //   if (this.timeElapsed < this.duration)
      //       requestAnimationFrame((time) => this._loop(time).then(resolve(this._resolveEnd())));
      //   else
      //     resolve(this._end());
      // });

      // do whatever synchronous stuff when called
      // ...
      // function decide( asyncResult)  // process async result and decide what to do
      // {   // do something with asyncResult
      //     console.log("asyncResult: " + asyncResult);
      //     if( asyncResult == 0)
      //         console.log("ignition");
      //     // decide if further recursion needed
      //     if( asyncResult < 0)
      //         return "lift off"; // all done
      //     return this.recFun( num-1); // not all done, recurse
      // }

      // return a promise resolved by doing something async and deciding what to do with it
      // to be clear the returned promise is the one returned by .then
      return this.asyncThing().then(function () {
        console.log(_this2.timeElapsed, _this2.duration);
        if (_this2.timeElapsed < _this2.duration) return _this2.recFun();
        // requestAnimationFrame((time) => this._loop(time).then(resolve(this._resolveEnd())));
        else return _this2._end();
        // resolve(this._end());
      });
    }

    // call the recursive function
    //
    // recFun( 5)
    // .then( function(result) {console.log("done, result = " + result); })
    // .catch( function(err) {console.log("oops:" + err);});

  }, {
    key: 'scrollTo',
    value: function scrollTo(target) {
      var instant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


      // recFun( 5)
      // .then( function(result) {console.log("done, result = " + result); })
      // .catch( function(err) {console.log("oops:" + err);});

      if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object') {
        this.distance = this.settings.offset + target.getBoundingClientRect().top;
      } else if (typeof target === 'string') {
        this.distance = this.settings.offset + document.querySelector(target).getBoundingClientRect().top;
      } else {
        this.distance = target;
      }

      this.start = window.pageYOffset;
      this.duration = instant ? 0 : this.settings.duration;

      this.recFun().then(console.log('completed!!!!'));
      // return new Promise((resolve) =>{
      // requestAnimationFrame((time) => {
      //   this.timeStart = time;
      //   this._loop(time).then(resolve());
      // });
      // });
    }
  }, {
    key: '_loop',
    value: function _loop(time) {
      var _this3 = this;

      console.log(time);
      this.timeElapsed = time - this.timeStart;

      window.scrollTo(0, this.settings.easing(this.timeElapsed, this.start, this.distance, this.duration));
      // return new Promise((resolve) => {
      if (this.timeElapsed < this.duration) requestAnimationFrame(function (time) {
        return _this3._loop(time);
      });else this._end();
      // resolve(this._end());
      // });
    }
  }, {
    key: '_resolveEnd',
    value: function _resolveEnd() {
      console.log('resolved');
    }
  }, {
    key: '_end',
    value: function _end() {
      console.log('ended');
      window.scrollTo(0, this.start + this.distance);

      if (typeof this.settings.callback === 'function') this.settings.callback();
    }
  }, {
    key: '_easeInOutQuad',
    value: function _easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }
  }]);

  return ScrollModule;
}();