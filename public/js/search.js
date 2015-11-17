'use strict';

var SEARCH_API = '/api/search';
var SEARCH_QUERY = '/results?search_query=';
var YOUTUBE_URL = 'https://www.youtube.com';
var YOUTUBE_START_DATE = new Date('2007-1-1');
var EMBED_URL = YOUTUBE_URL + '/embed/';
var SEARCH_TIMEOUT = 350;
var SCROLL_OFFSET = 400;
var RESULTS = 24;
var EMBED_PARAMS = $.param({
  'autoplay': '1',
  'showinfo': '0',
  'controls': '1',
  'iv_load_policy': '3'
});

// State values.
var prevPageToken = null;
var nextPageToken = null;
var videoDefinition = 'any';


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

  // jQuery Components (mimic React).
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
    .text(utils.truncateText(resultTitle, 60));

  // Combine Components.
  return $videoDiv.append(
          $videoLink.append(
            $videoImg).append(
            $videoCaption));
};


/********************************************************************
* DOM MANIPULATION
*********************************************************************/
var clearSearchResults = function() {
  $('#search-results').empty();
};

var appendSearchResults = function(error, data) {
  data.items.forEach(function(result) {
    $('#search-results').append(searchResultComponent(result));
  });
};

var updateSearchResults = function(error, data) {
  clearSearchResults();
  appendSearchResults(error, data);
};

var updateHistoryState = function(value) {
  window.history.pushState({}, 'results', value);
};

var updateYoutubeLink = function(searchTerm) {
  var $youtubeLink = $('.social-youtube');
  if (searchTerm) {
    $youtubeLink.attr('href', YOUTUBE_URL + SEARCH_QUERY + searchTerm);
  } else {
    $youtubeLink.attr('href', YOUTUBE_URL);
  }
};

var updateNavDate = function(date) {
  $('.nav-date').text(date.toDateString());
};

var updateDocumentTitle = function(searchTerm) {
  if (searchTerm) {
    window.document.title = 'Youtube Explorer | Seach: ' + searchTerm;
  } else {
    window.document.title = 'Youtube Explorer | Home';
  }
};


/********************************************************************
* AJAX CALLS
*********************************************************************/
var sendSearchRequest = function(searchTerm, maxResults, callback) {
  // Add randomness for fun.
  var now = Date.now();
  var publishedAfter = new Date(now);
  var publishedBefore = new Date(now);
  var randomDaysAgo = utils.randomInclusive(2,
    utils.dayDiff(publishedAfter, YOUTUBE_START_DATE));
  publishedAfter.setDate(publishedAfter.getDate() - randomDaysAgo);
  publishedBefore.setDate(publishedBefore.getDate() - randomDaysAgo + 1);
  updateNavDate(publishedAfter);

  $.get(SEARCH_API, {
      q: searchTerm,
      maxResults: maxResults,
      nextPageToken: nextPageToken,
      videoDefinition: videoDefinition,
      publishedAfter: publishedAfter,
      publishedBefore: publishedBefore
    }, function(data) {
      prevPageToken = nextPageToken;
      nextPageToken = data.nextPageToken;
      callback(null, data);
  });
};


/********************************************************************
* EVENT LISTENERS
*********************************************************************/
var currentSearchTerm = $('#search-input').val();

var bindMainSearch = function() {
  $('#search-input').keyup(function(e) {
    // Only send request if search term has changed.
    var newSearchTerm = e.target.value.trim();
    if (newSearchTerm !== currentSearchTerm) {
      utils.delay(function() {
        currentSearchTerm = newSearchTerm;

        // Use encoded search term for better validation.
        var encodedTerm = utils.encodeReadableURL(currentSearchTerm);
        updateDocumentTitle(currentSearchTerm);
        updateHistoryState(SEARCH_QUERY + encodedTerm);
        updateYoutubeLink(encodedTerm);
        sendSearchRequest(encodedTerm, RESULTS, updateSearchResults);
      }, SEARCH_TIMEOUT);
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
      $('#search-input').focus();
    }
  });
};

var enableInfiniteScroll = function() {
  skully.onPageBottom(function() {
    // Stop if all results are exhausted or in mid-request.
    if (nextPageToken !== undefined && (prevPageToken !== nextPageToken)) {
      prevPageToken = nextPageToken;
      sendSearchRequest(currentSearchTerm, 36, appendSearchResults);
    }
  }, SCROLL_OFFSET);
};


/********************************************************************
* MAIN PROGRAM
*********************************************************************/
(function() {
  // Load up dynamic parts of the site.
  updateYoutubeLink(currentSearchTerm);
  sendSearchRequest(currentSearchTerm, RESULTS, updateSearchResults);

  // Bind event listeners.
  bindMainSearch();
  bindTabKeyToSearch();
  bindEmbeddedVideo();
  enableInfiniteScroll();

})();
