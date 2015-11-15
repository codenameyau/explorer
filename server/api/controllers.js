'use strict';

var request = require('request');
var random = require('../utils/random');

var YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
var API_KEY = process.env.YOUTUBE_EXPLORER_API;

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
    var dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - random.inclusive(1, 7));
    queryParams.publishedAfter = dateFilter;
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
