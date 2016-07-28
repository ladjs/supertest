var assert = require('assert');
var util = require('util');

exports.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    assert.fail(actual, expected, message, 'deepEqual', exports.deepEqual);
  }
};

/**
 * Version of {@link assert#deepEqual} that accepts functions in expected.
 * @param actual
 * @param expected
 */
function _deepEqual(actual, expected) {
  var expectedKeys;
  var actualKeys;
  var expectedKey;
  var actualKey;
  var i;

  // Custom validator.
  if (typeof expected === 'function') {
    return expected(actual);
  }

  // if (typeof expected.equals === 'function') { // not really reliable, we need an equals symbol :/
  //   return expected.equals(actual);
  // }

  if (Object.is(actual, expected)) {
    return true;
  }

  // They should have been equivalent.
  if (util.isPrimitive(expected)) {
    return false;
  }

  // Avoid checking `actual` is the same type each time.
  if (Object.getPrototypeOf(expected) !== Object.getPrototypeOf(actual)) {
    return false;
  }

  if (expected instanceof Date) {
    return expected.getTime() === actual.getTime();
  }

  if (expected instanceof Buffer) {
    return expected.equals(actual);
  }

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  if (expected instanceof RegExp) {
    return actual.source === expected.source &&
      actual.global === expected.global &&
      actual.multiline === expected.multiline &&
      actual.lastIndex === expected.lastIndex &&
      actual.ignoreCase === expected.ignoreCase;
  }

  // Other objects: Compare enumerable properties properties:
  if (isArguments(expected)) {
    // they have the same prototype as {}
    if (!isArguments(actual)) {
      return false;
    }
  }

  expectedKeys = Object.keys(expected);
  actualKeys = Object.keys(actual);
  if (expectedKeys.length !== actualKeys.length) {
    return false;
  }

  expectedKeys.sort();
  actualKeys.sort();
  for (i = expectedKeys.length - 1; i >= 0; i--) {
    expectedKey = expectedKeys[i];
    actualKey = actualKeys[i];

    if (expectedKey !== actualKey) {
      return false;
    }

    // compare property value
    if (!_deepEqual(actual[actualKey], expected[expectedKey])) {
      return false;
    }
  }

  return true;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) === '[object Arguments]';
}
