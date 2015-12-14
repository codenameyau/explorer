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
* DOM COMPONENETS
*********************************************************************/
suggestions.suggestionsContainer = function() {
  var $componentDiv = $('<div>')
    .addClass('suggestions');
  return $componentDiv;
};

suggestions.suggestion = function(result) {
  var $componentDiv = $('<div>')
    .addClass('suggestion')
    .text(result);
  return $componentDiv;
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
  var searchResults = data[1];
  suggestions.$results.empty();

  // Limit to first 5 results.
  for (var i=0; i<5; i++) {
    var result = searchResults[i];
    if (result) {
      suggestions.$results.append(suggestions.suggestion(result[0]));
    }
  }
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
  suggestions.$results = suggestions.suggestionsContainer();

  // Append suggestions component.
  suggestions.selector.parent().append(suggestions.$results);

  // Show results when selector is in focus.
  suggestions.selector.on('focus', function() {
    suggestions.$results.show();
  });

  // Hide results when selector is no longer in focus.
  // suggestions.selector.on('blur', function() {
  //   suggestions.$results.hide();
  // });

  // Bind event listener on selector.
  suggestions.selector.keyup(function(e) {
    var query = e.target.value.trim();
    if (query && query !== suggestions.query) {
      suggestDebounced(query);
    }
  });
};
