'use strict';

var request = require('request');
var YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
var API_KEY = process.env.YOUTUBE_EXPLORER_API;

exports.search = function(req, res) {
  var searchTerm = req.query.term;

  // Send request to youtube's API
  request({
    url: YOUTUBE_API,
    qs: {
      part: 'snippet',
      q: searchTerm,
      maxResults: 24,
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
