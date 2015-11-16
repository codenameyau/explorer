'use strict';

var request = require('request');

var YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
var API_KEY = process.env.YOUTUBE_EXPLORER_API;

exports.search = function(req, res) {
  var queryParams = {
    type: 'video',
    part: 'snippet',
    q: req.query.q,
    pageToken: req.query.nextPageToken,
    maxResults: req.query.maxResults || 12,
    publishedAfter: new Date(req.query.publishedAfter),
    publishedBefore: new Date(req.query.publishedBefore),
    videoDefinition: req.query.videoDefinition,
    key: API_KEY
  };

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
