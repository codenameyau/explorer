'use strict';

exports.exclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

exports.inclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
