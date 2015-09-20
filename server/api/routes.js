'use strict';

var controllers = require('./controllers');

module.exports = function(app) {

  app.get('/api/search', controllers.search);

};
