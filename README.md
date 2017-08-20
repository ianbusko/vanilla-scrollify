# Vanilla JS Scrollify

A vanilla JS module to assist in scroll snapping. Inspired by LukeHaas's [jQuery Scrollify](http://projects.lukehaas.me/scrollify). Not yet touch optimized.
This project is a work in progress. Currently only basic behavior is supported.

## Basic Setup

Vanilla Scrollify depends on [`smooth-scroll-module`](https://github.com/ianbusko/smooth-scroll-module).
The first parameter for the Scrollify class is an instance of a ScrollModule.
Use the module like this:

```javascript
var scrollModule = new ScrollModule();
var scrollify = new Scrollify(scrollModule, {
  section: '.section'
});
```

## Configuration

## Options

## Methods

## Future Plans
Finish documentation
Fully test existing functionality
Add swipe support
