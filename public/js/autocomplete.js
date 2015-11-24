'use strict';

var autocomplete = autocomplete || {};
autocomplete.API = 'http://suggestqueries.google.com/complete/search';
autocomplete.element = null;

/********************************************************************
* INTERNAL METHODS
*********************************************************************/



/********************************************************************
* PUBLIC METHODS
*********************************************************************/
autocomplete.bind = function(selector) {
  autocomplete.element = $(selector);
};

autocomplete.update = function(data) {

  console.log(data);
};

autocomplete.suggest = function(searchTerm) {
  $.ajax({
    url: autocomplete.API,
    dataType: 'jsonp',
    data: {
      q: searchTerm,
      client: 'firefox',
      jsonp: 'autocomplete.update',
      ds: 'yt',
      hl: 'en'
    }
  });
};