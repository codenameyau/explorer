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
suggestions.query = '';
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
suggestions.debounce = function(fn, ms) {
  var timeout;
  return function() {
    var _this = this;
    var _args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn.apply(_this, _args);
    }, ms);
  };
};

suggestions.setEngine = function(value) {
  suggestions.engine = suggestions.engines[value]
                    || suggestions.engines.google;
};

suggestions.updateCallback = function(data) {
  console.log(data);
};

suggestions.suggest = function(query) {
  suggestions.query = query;

  $.ajax({
    url: suggestions.API,
    dataType: suggestions.format,
    data: {
      q: query,
      client: suggestions.formats[suggestions.format],
      jsonp: 'suggestions.updateCallback',
      ds: suggestions.engine,
      hl: suggestions.language
    }
  });
};

suggestions.bind = function(selector) {
  // Create debounced function to save requests.
  var suggestDebounced = suggestions.debounce(
    suggestions.suggest, suggestions.delay);

  // Store binded values in module.
  suggestions.selector = $(selector);
  suggestions.query = suggestions.selector.val();

  // Bind event listener on selector.
  suggestions.selector.keyup(function(e) {
    var query = e.target.value.trim();
    if (query && query !== suggestions.query) {
      suggestDebounced(query);
    }
  });
};
