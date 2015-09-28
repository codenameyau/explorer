'use strict';

var truncateText = function(text, length) {
  if (text.length > length) {
    return text.substring(0, length) + '...';
  } return text;
};

var encodeReadableURL = function(value) {
  return window.encodeURIComponent(value).replace(/%20/g, '+');
};

var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();
