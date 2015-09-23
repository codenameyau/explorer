'use strict';

var controllers = require('./controllers');

module.exports = function(app) {

  app.get('/', controllers.homepage);
  app.get('/results', controllers.homepage);

};
