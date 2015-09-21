'use strict';

var SEARCH_API = '/api/search';
var YOUTUBE_URL = 'https://www.youtube.com/watch?v=';


/********************************************************************
* JQUERY COMPONENTS
*********************************************************************/
function EmbeddedVideoComponent(id) {
  var component = $('<iframe>');
}

function searchResultComponent(result) {
  // Video information.
  var resultId = result.id.videoId;
  var resultChannel = result.snippet.channelTitle;
  var resultTitle = result.snippet.title;
  var resultDescription = result.snippet.description;
  var resultThumbnail = result.snippet.thumbnails.medium.url;

  // jQuery Components.
  var $videoDiv = $('<div>')
    .addClass('search-result')
    .data('id', resultId)
    .data('channel', resultChannel)
    .data('title', resultTitle)
    .data('description', resultDescription)
    .data('thumbnail', resultThumbnail);

  var $videoLink = $('<a>')
    .addClass('search-result-link')
    .attr('href', YOUTUBE_URL + resultId)
    .attr('target', '_blank');

  var $videoImg = $('<img>')
    .addClass('search-result-img')
    .attr('src', resultThumbnail);

  var $videoCaption = $('<figcaption>')
    .addClass('search-result-caption')
    .text(resultTitle);

  // Combine Components.
  return $videoDiv.append(
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
    $('#search-results').append(searchResultComponent(result));
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

var bindEmbeddedVideo = function() {
  // Dynamic event listner for new search results.
  $('#search-results').on('click', '.search-result', function() {

    // Detach once.
    var $this = $(this);
    var $image = $this.find('.search-result-img');
    if ($image) {
      $image.remove();
      $this.append('<p>').text('hi');
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
