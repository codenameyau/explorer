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
suggestions.min = 0;
suggestions.max = 5;
suggestions.engines = {
  'google': 'google search',
  'youtube': 'yt'
};

suggestions.formats = {
  'json': 'firefox',
  'jsonp': 'youtube',
  'xml': 'toolbar'
};

suggestions.keys = {
  'up': 38,
  'down': 40
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
* INTERNAL METHODS
*********************************************************************/
suggestions._pressedArrowKeys = function(e) {
  return e.keyCode === suggestions.keys.up
      || e.keyCode === suggestions.keys.down;
};

suggestions._cycleIndex = function(value, min, max) {
  min = min || suggestions.min;
  max = max || suggestions.max;
  return (value < min) ? max - 1 :
         (value >= max) ? min : value;
};

suggestions._debounce = function(fn, ms) {
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


/********************************************************************
* PUBLIC METHODS
*********************************************************************/
suggestions.setEngine = function(value) {
  suggestions.engine = suggestions.engines[value]
                    || suggestions.engines.google;
};

suggestions.updateCallback = function(data) {
  var searchResults = data[1];
  suggestions.$results.empty();

  // Limit to first 5 results.
  for (var i=suggestions.min; i<suggestions.max; i++) {
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
  var suggestDebounced = suggestions._debounce(
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

  // Cycle through up and down key events.
  suggestions.selector.keydown(function(e) {
    if (suggestions._pressedArrowKeys(e)) {
      e.preventDefault();
      var pressedUp = e.keyCode === suggestions.keys.up;
      var pressedDown = e.keyCode === suggestions.keys.down;
      var $activeElement = $('.suggestions').find('.suggestion-active');
      var activeIndex = $activeElement.index();

      // Navigate through the suggestions.
      if ($activeElement.length) {
        $activeElement.removeClass('suggestion-active');
        if (pressedUp) {
          activeIndex = suggestions._cycleIndex(--activeIndex);
        } else if (pressedDown) {
          activeIndex = suggestions._cycleIndex(++activeIndex);
        }
      }

      // Suggestions are currently hidden, so determine which suggestion
      // should become active based on which key the user pressed.
      else if (pressedUp) {
        activeIndex = suggestions.max;
      } else if (pressedDown) {
        activeIndex = suggestions.min;
      }

      // Set the suggestion to active and send a suggestion request.
      var $suggestions = $('.suggestions').children();
      $activeElement = $($suggestions[activeIndex]);
      $activeElement.addClass('suggestion-active');

      // TODO: Change value of input.
    }
  });

  // Bind suggestion search to input.
  suggestions.selector.keyup(function(e) {
    var query = e.target.value.trim();
    if (query && query !== suggestions.query) {
      suggestDebounced(query);
    }
  });
};
