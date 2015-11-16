'use strict';

var request = require('request');
var random = require('../utils/random');
var date = require('../utils/date');

var YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
var API_KEY = process.env.YOUTUBE_EXPLORER_API;
var YOUTUBE_START_DATE = new Date('2006-1-1');

exports.search = function(req, res) {
  var searchTerm = req.query.term;
  var searchCount = req.query.count || 12;
  var nextPageToken = req.query.nextPageToken;
  var videoDefinition = req.query.videoDefinition;

  var queryParams = {
    videoDefinition: videoDefinition,
    type: 'video',
    part: 'snippet',
    q: searchTerm,
    pageToken: nextPageToken,
    maxResults: searchCount,
    key: API_KEY
  };

  // Shuffle up the homepage.
  if (!searchTerm) {
    var now = Date.now();
    var dateStart = new Date(now);
    var dateEnd = new Date(now);
    var randomDaysAgo = random.inclusive(1,
      date.dayDiff(dateStart, YOUTUBE_START_DATE));
    dateStart.setDate(dateStart.getDate() - randomDaysAgo);
    dateEnd.setDate(dateEnd.getDate() - randomDaysAgo + 1);
    queryParams.publishedAfter = dateStart;
    queryParams.publishedBefore = dateEnd;
  }

  // Send request to youtube's API.
  request({ url: YOUTUBE_API, qs: queryParams },
    function(error, response, body) {
      if (error) {
        res.status(500);
      } else {
        res.json(JSON.parse(body));
      }
    });
};
