'use strict';

/**
 * This method needs to reside in its own module in order to properly test stack trace handling.
 */
module.exports = function throwError(message) {
  return function() {
    throw new Error(message);
  };
};
