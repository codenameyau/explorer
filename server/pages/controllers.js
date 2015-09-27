'use strict';

exports.homepage = function(req, res) {
  var context = {
    search_query: req.query.search_query,
    title: req.query.search_query
  };
  res.render('index.html', context);
};
