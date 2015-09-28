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
