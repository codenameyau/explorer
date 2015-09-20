'use strict';

/********************************************************************
* DEPENDENCIES
*********************************************************************/
var express = require('express');
var nunjucks = require('nunjucks');
var path = require('path');


/********************************************************************
* APPLICATION
*********************************************************************/
var app = express();
nunjucks.configure('views', {
  autoescape: true,
  trimBlocks: true,
  lstripBlocks: true,
  noCache: false,
  watch: true,
  express: app
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');


/********************************************************************
* ROUTES
*********************************************************************/
require('./server/pages/routes')(app);
require('./server/api/routes')(app);


/********************************************************************
* SERVER
*********************************************************************/
var server = app.listen(process.env.PORT || 8081, function() {
  var address = server.address();
  console.log('Listening on port: %s', address.port);
});
