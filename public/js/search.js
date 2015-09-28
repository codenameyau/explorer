'use strict';

var SEARCH_API = '/api/search';
var SEARCH_QUERY = '/results?search_query=';
var EMBED_URL = 'https://www.youtube.com/embed/';
var EMBED_PARAMS = $.param({
  'autoplay': '1',
  'showinfo': '0',
  'controls': '1',
  'iv_load_policy': '3'
});


/********************************************************************
* JQUERY COMPONENTS
*********************************************************************/
var embeddedVideoComponent = function(id) {
  return $('<iframe>')
    .attr('class', 'search-result-embed')
    .attr('src', EMBED_URL + id + '?' + EMBED_PARAMS)
    .attr('frameborder', '0')
    .attr('allowfullscreen', 'true');
};

var searchResultComponent = function(result) {
  // Video information.
  var resultId = result.id.videoId;
  var resultChannel = result.snippet.channelTitle;
  var resultTitle = result.snippet.title;
  var resultDescription = result.snippet.description;
  var resultThumbnail = result.snippet.thumbnails.medium.url;

  // jQuery Components (explore React).
  var $videoDiv = $('<div>')
    .addClass('search-result')
    .data('id', resultId)
    .data('channel', resultChannel)
    .data('title', resultTitle)
    .data('description', resultDescription)
    .data('thumbnail', resultThumbnail);

  var $videoLink = $('<a>')
    .addClass('search-result-link');

  var $videoImg = $('<img>')
    .addClass('search-result-img')
    .attr('src', resultThumbnail);

  var $videoCaption = $('<figcaption>')
    .addClass('search-result-caption')
    .text(truncateText(resultTitle, 60));

  // Combine Components.
  return $videoDiv.append(
          $videoLink.append(
            $videoImg).append(
            $videoCaption));
};


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

var updateDocumentTitle = function(searchTerm) {
  if (searchTerm) {
    window.document.title = 'Youtube Explorer | Seach: ' + searchTerm;
  } else {
    window.document.title = 'Youtube Explorer | Home';
  }
};

/********************************************************************
* EVENT LISTENERS
*********************************************************************/
var currentSearchTerm = $('#header-search').val();

var bindMainSearch = function() {
  $('#header-search').keyup(function(e) {
    // Only send request if search term has changed.
    var newSearchTerm = e.target.value.trim();
    if (newSearchTerm !== currentSearchTerm) {
      delay(function() {
        currentSearchTerm = newSearchTerm;
        updateDocumentTitle(currentSearchTerm);
        window.history.pushState({}, 'results',
          SEARCH_QUERY + window.encodeURIComponent(currentSearchTerm));
        sendSearchRequest(currentSearchTerm, updateSearchResults);
      }, 350);
    }
  });
};

var bindEmbeddedVideo = function() {
  // Dynamic event listner for new search results.
  $('#search-results').on('click', '.search-result', function() {
    var $this = $(this);

    // Detach image once.
    if (!$this.find('.search-result-embed').length) {
      $this.find('.search-result-img').remove();
      $this.prepend(embeddedVideoComponent($this.data('id')));
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
  bindEmbeddedVideo();

})();
