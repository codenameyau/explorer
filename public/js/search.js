'use strict';

// Constants.
var SEARCH_API = '/api/search';
var SEARCH_QUERY = '/results?search_query=';
var YOUTUBE_URL = 'https://www.youtube.com';
var YOUTUBE_START_DATE = new Date('2008-1-1');
var EMBED_URL = YOUTUBE_URL + '/embed/';
var SEARCH_INPUT = '#search-input';
var SEARCH_TIMEOUT = 350;
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
var dayRange = 7;
var weekAfter = new Date(publishedAfter);
var weekBefore = new Date(publishedBefore);
weekAfter.setDate(weekAfter.getDate() - dayRange);
weekBefore.setDate(weekBefore.getDate() + dayRange);
console.log(publishedAfter + ' ' + publishedBefore);
console.log(weekAfter + ' ' + weekBefore);


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

  var $videoLink = $('<a>')
    .addClass('search-result-link')
    .attr('href', YOUTUBE_URL + '/watch?v=' + resultId)
    .attr('target', '_blank')
    .text(utils.truncateText(resultTitle, 80));

  var $videoCaption = $('<figcaption>')
    .addClass('search-result-caption')
    .append($videoLink);

  // Combine Components.
  return $videoDiv.append(
          $videoImg).append(
          $videoCaption);
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
  $.get(SEARCH_API, {
      q: searchTerm,
      order: searchTerm ? 'relevance' : order,
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
var bindSearchInput = function() {
  $searchInput.keyup(function(e) {
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
        autocomplete.suggest(currentSearchTerm);
        sendSearchRequest(encodedTerm, 24, updateSearchResults);
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
      $searchInput.focus();
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
  updateNavDate(publishedAfter);
  updateYoutubeLink(currentSearchTerm);
  sendSearchRequest(currentSearchTerm, 24, updateSearchResults);

  // Bind event listeners.
  bindSearchInput();
  bindTabKeyToSearch();
  bindEmbeddedVideo();
  enableInfiniteScroll();

  // Experiment with where callback should be.
  autocomplete.bind(SEARCH_INPUT);

})();
