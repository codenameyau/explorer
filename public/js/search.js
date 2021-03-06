'use strict';

// Constants.
var SEARCH_API = '/api/search';
var SEARCH_QUERY = '/results?search_query=';
var YOUTUBE_URL = 'https://www.youtube.com';
var YOUTUBE_START_DATE = new Date('2008-1-1');
var EMBED_URL = YOUTUBE_URL + '/embed/';
var SEARCH_INPUT = '#search-input';
var SEARCH_DELAY = 350;
var SCROLL_OFFSET = 400;
var EMBED_PARAMS = $.param({
  'autoplay': '1',
  'showinfo': '0',
  'controls': '1',
  'iv_load_policy': '3'
});

// Globals.
var prevPageToken = null;
var nextPageToken = null;
var videoDefinition = 'any';
var videoOrders = ['relevance', 'viewCount'];
var order = videoOrders[utils.randomInclusive(0, 1)];
var $searchInput = $(SEARCH_INPUT);
var currentSearchTerm = $searchInput.val();

// Set up a blind date.
var now = new Date();
var midnight = new Date(now.toLocaleDateString());
var publishedAfter = new Date(midnight);
var publishedBefore = new Date(midnight);
var daysSinceStart = utils.dayDiff(publishedAfter, YOUTUBE_START_DATE);
var randomDaysAgo = utils.randomInclusive(2, daysSinceStart);
publishedAfter.setDate(publishedAfter.getDate() - randomDaysAgo);
publishedBefore.setDate(publishedBefore.getDate() - randomDaysAgo + 1);

// Use date range for refined search.
var searchAfter = new Date('2008-01-01');
var searchBefore = new Date();


/********************************************************************
* DOM COMPONENETS
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

  // jQuery Components.
  var $videoDiv = $('<div>')
    .addClass('search-result')
    .data('id', resultId)
    .data('channel', resultChannel)
    .data('title', resultTitle)
    .data('description', resultDescription)
    .data('thumbnail', resultThumbnail);

  var $videoImg = $('<img>')
    .addClass('search-result-img')
    .attr('src', resultThumbnail);

  var $videoCaption = $('<figcaption>')
    .addClass('search-result-caption')
    .attr('title', 'Open video in YouTube')
    .text(utils.truncateText(resultTitle, 80));

  var $videoLink = $('<a>')
    .addClass('search-result-link')
    .attr('href', YOUTUBE_URL + '/watch?v=' + resultId)
    .attr('target', '_blank')
    .append($videoCaption);

  // Combine Components.
  return $videoDiv.append(
          $videoImg).append(
          $videoLink);
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
var sendSearchRequest = function(params, callback) {
  $.get(SEARCH_API, {
      q: params.q,
      order: params.q ? 'relevance' : order,
      maxResults: params.maxResults,
      nextPageToken: nextPageToken,
      videoDefinition: videoDefinition,
      publishedAfter: params.publishedAfter,
      publishedBefore: params.publishedBefore
    }, function(data) {
      prevPageToken = nextPageToken;
      nextPageToken = data.nextPageToken;
      callback(null, data);
  });
};

var searchInputEvent = function(searchTerm) {
  // Only send request if search term has changed.
  if (searchTerm !== currentSearchTerm) {
    utils.delay(function() {
      currentSearchTerm = searchTerm;

      // Use encoded search term for better validation.
      var encodedTerm = utils.encodeReadableURL(currentSearchTerm);
      updateDocumentTitle(currentSearchTerm);
      updateHistoryState(SEARCH_QUERY + encodedTerm);
      updateYoutubeLink(encodedTerm);
      sendSearchRequest({
        q: encodedTerm,
        maxResults: 24,
        publishedAfter: searchAfter,
        publishedBefore: searchBefore
      }, updateSearchResults);
    }, SEARCH_DELAY);
  }
};

/********************************************************************
* EVENT LISTENERS
*********************************************************************/
var bindSearchInput = function() {
  $searchInput.keyup(function(e) {
    var searchTerm = e.target.value.trim();
    searchInputEvent(searchTerm);
  });
};

var bindEmbeddedVideo = function() {
  // Dynamic event listner for new search results.
  $('#search-results').on('click', '.search-result-img', function() {
    var $this = $(this);
    var $parent = $this.parent();

    // Replace image with embedded video.
    $this.remove();
    $parent.prepend(embeddedVideoComponent($parent.data('id')));
  });
};

var bindTabKeyToSearch = function() {
  $('body').keydown(function(e) {
    if (e.which === 9) {
      e.preventDefault();
      $searchInput.focus();
    }
  });
};

var enableInfiniteScroll = function() {
  skully.onPageBottom(function() {
    // Stop if all results are exhausted or in mid-request.
    // TODO: Fix published date for home and searching.
    if (nextPageToken !== undefined && (prevPageToken !== nextPageToken)) {
      prevPageToken = nextPageToken;
      sendSearchRequest({
        q: currentSearchTerm,
        maxResults: 36,
        publishedAfter: publishedAfter,
        publishedBefore: publishedBefore
      }, appendSearchResults);
    }
  }, SCROLL_OFFSET);
};


/********************************************************************
* MAIN PROGRAM
*********************************************************************/
(function() {
  // Load dynamic parts of the site.
  updateNavDate(publishedAfter);
  updateYoutubeLink(currentSearchTerm);
  sendSearchRequest({
    q: currentSearchTerm,
    maxResults: 24,
    publishedAfter: publishedAfter,
    publishedBefore: publishedBefore
  }, updateSearchResults);

  // Bind event listeners.
  bindSearchInput();
  bindTabKeyToSearch();
  bindEmbeddedVideo();
  enableInfiniteScroll();

  // Bind youtube suggestions.
  suggestions.delay = SEARCH_DELAY;
  suggestions.setEngine('youtube');
  suggestions.bind(SEARCH_INPUT);
  suggestions.$results.on('click', '> *', function(event) {
    var text = event.target.innerText;
    suggestions.selector.val(text);
    suggestions.suggest(text);
    searchInputEvent(text);
  });
})();
