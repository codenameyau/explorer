'use strict';

var request = require('request');
var YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
var API_KEY = process.env.YOUTUBE_EXPLORER_API;

exports.search = function(req, res) {
  var searchTerm = req.query.term;
  var searchCount = req.query.count || 12;
  var nextPageToken = req.query.nextPageToken;

  // Send request to youtube's API
  request({
    url: YOUTUBE_API,
    qs: {
      part: 'snippet',
      q: searchTerm,
      pageToken: nextPageToken,
      maxResults: searchCount,
      key: API_KEY
    }},
    function(error, response, body) {
      if (error) {
        res.status(500);
      } else {
        res.json(JSON.parse(body));
      }
    });
};
