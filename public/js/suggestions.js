// TODO: Replace jquery with vanilla js.
'use strict';

var suggestions = suggestions || {};

/********************************************************************
* PROPERTIES
*********************************************************************/
suggestions.API = '//suggestqueries.google.com/complete/search';
suggestions.engine = 'google search';
suggestions.language = 'en';
suggestions.format = 'jsonp';
suggestions.delay = 300;
suggestions.selector = null;
suggestions.engines = {
  'google': 'google search',
  'youtube': 'yt'
};

suggestions.formats = {
  'json': 'firefox',
  'jsonp': 'youtube',
  'xml': 'toolbar'
};


/********************************************************************
* METHODS
*********************************************************************/
suggestions.delay = function(fn, ms, immediate) {
  var timeout;
  return function() {
    var _this = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      if (!immediate) {
        fn.apply(_this, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, ms);
    if (callNow) {
      fn.apply(_this, args);
    }
  };
};


suggestions.setEngine = function(value) {
  suggestions.engine = suggestions.engines[value]
                    || suggestions.engines.google;
};


suggestions.update = function(data) {
  console.log(data);
};


suggestions.suggest = function(query) {
  $.ajax({
    url: suggestions.API,
    dataType: suggestions.format,
    data: {
      q: query,
      client: suggestions.formats[suggestions.format],
      jsonp: 'suggestions.update',
      ds: suggestions.engine,
      hl: suggestions.language
    }
  });
};


suggestions.bind = function(selector) {
  suggestions.selector = $(selector);
  suggestions.selector.keyup(function(e) {
    var query = e.target.value.trim();
    if (query) {
      suggestions.suggest(query);
    }
  });
};
