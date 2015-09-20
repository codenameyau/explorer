'use strict';

exports.homepage = function(req, res) {

  var context = {};
  res.render('index.html', context);

};
