'use strict';

// MS * SECONDS * MINUTES * HOURS;
var MS_PER_DAY = 1000 * 60 * 60 * 24;

exports.dayDiff = function(dateA, dateB) {
  var timeDiff = Math.abs(dateA.getTime() - dateB.getTime());
  return Math.ceil(timeDiff / MS_PER_DAY);
};
