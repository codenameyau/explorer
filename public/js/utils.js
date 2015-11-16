'use strict';

var utils = utils || {};

utils.truncateText = function(text, length) {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  } return text;
};

utils.encodeReadableURL = function(value) {
  return window.encodeURIComponent(value).replace(/%20/g, '+');
};

utils.delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

utils.randomExclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

utils.randomInclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// MS * SECONDS * MINUTES * HOURS;
var MS_PER_DAY = 1000 * 60 * 60 * 24;
utils.dayDiff = function(dateA, dateB) {
  var timeDiff = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.ceil(timeDiff / MS_PER_DAY);
};
