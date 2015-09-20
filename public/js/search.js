'use strict';

var SEARCH_API = '/api/search';
var YOUTUBE_URL = 'https://www.youtube.com/watch?v=';


/********************************************************************
* JQUERY COMPONENTS
*********************************************************************/
function SearchResultComponent(result) {
  // Video information.
  this.id = result.id.videoId;
  this.channel = result.snippet.channelTitle;
  this.title = result.snippet.title;
  this.description = result.snippet.description;
  this.thumbnail = result.snippet.thumbnails.medium.url;

  // jQuery Components.
  var $videoDiv = $('<div>')
    .addClass('search-result')
    .attr('tabindex', '-1')
    .data('id', this.id)
    .data('channel', this.channel)
    .data('title', this.title)
    .data('description', this.description)
    .data('thumbnail', this.thumbnail);

  var $videoLink = $('<a>')
    .addClass('search-result-link')
    .attr('href', YOUTUBE_URL + this.id)
    .attr('target', '_blank');

  var $videoImg = $('<img>')
    .addClass('search-result-img')
    .attr('src', this.thumbnail);

  var $videoCaption = $('<p>')
    .addClass('search-result-caption')
    .text(this.title);

  // Combine Components.
  this.component =
    $videoDiv.append(
      $videoLink.append(
        $videoImg).append(
        $videoCaption));
}


/********************************************************************
* AJAX CALLS
*********************************************************************/
var sendSearchRequest = function(searchTerm, callback) {
  $.get(SEARCH_API, {term: searchTerm}, function(data) {
    callback(null, data);
  });
};


/********************************************************************
* DOM MANIPULATION
*********************************************************************/
var clearSearchResults = function() {
  $('#search-results').empty();
};

var updateSearchResults = function(error, data) {
  clearSearchResults();
  data.items.forEach(function(result) {
    var searchResult = new SearchResultComponent(result);
    $('#search-results').append(searchResult.component);
  });
};


/********************************************************************
* EVENT LISTENERS
*********************************************************************/
var currentSearchTerm = $('#header-search').val();

var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

var bindMainSearch = function() {
  $('#header-search').keyup(function(e) {
    // Only send request if search term has changed.
    var newSearchTerm = e.target.value.trim();
    if (newSearchTerm !== currentSearchTerm) {
      delay(function() {
        currentSearchTerm = newSearchTerm;
        sendSearchRequest(currentSearchTerm, updateSearchResults);
      }, 350);
    }
  });
};

var bindTabKeyToSearch = function() {
  $('body').keydown(function(e) {
    if (e.which === 9) {
      e.preventDefault();
      $('#header-search').focus();
    }
  });
};

/********************************************************************
* MAIN PROGRAM
*********************************************************************/
(function() {
  // Send search request to get popular videos by default.
  sendSearchRequest(currentSearchTerm, updateSearchResults);

  // Bind event listeners.
  bindMainSearch();
  bindTabKeyToSearch();
})();
