'use strict';

var math = require('mathjs');

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var whitespace = ' \t\r\n';

var strSymbol = Symbol('StringInspector.str');

var StringInspector = function () {
  /**
   * Create a new string inspector
   * @param {string} str - the input string
   * @constructs StringInspector
   */
  function StringInspector(str) {
    classCallCheck(this, StringInspector);

    if (typeof str !== 'string') {
      str = '';
    }
    this[strSymbol] = str;
    /**
     * @member {number} position - the current position in the string
     * @memberof StringInspector
     * @instance
     */
    this.position = 0;
  }

  /**
   * @member {string} str - the original value
   * @memberof StringInspector
   * @instance
   */


  createClass(StringInspector, [{
    key: 'next',


    /**
     * Get the next character
     * @memberof StringInspector
     * @instance
     * @returns {(string|boolean)} - returns the next character, or false if there is none
     */
    value: function next() {
      if (this.hasNext) {
        return this.str[this.position++];
      } else {
        return false;
      }
    }

    /**
     * Gets characters as long as the predicate returns true
     * @memberof StringInspector
     * @instance
     * @param {Function} predicate - a function to inspect each character and return true if it should be captured
     * @returns {string} - the characters that were matched
     */

  }, {
    key: 'nextWhile',
    value: function nextWhile(predicate) {
      return this.nextUntil(function (char) {
        return !predicate(char);
      });
    }

    /**
     * Gets characters until the predicate returns true
     * @memberof StringInspector
     * @instance
     * @param {Function} predicate - a function to inspect each character and return true when capture should end
     * @returns {string} - the characters that occurred until the match
     */

  }, {
    key: 'nextUntil',
    value: function nextUntil(predicate) {
      var results = [];

      var keepGoing = false;
      do {
        keepGoing = false;
        if (this.hasNext) {
          var tmp = this.str[this.position];
          if (!predicate(tmp)) {
            results.push(tmp);
            this.position++;
            keepGoing = true;
          }
        }
      } while (keepGoing);

      return results.join('');
    }

    /**
     * Tries to match the expression starting at the current position and returns
     * the match set if anything is found. Recommend using only ^ anchored expressions
     * @memberof StringInspector
     * @instance
     * @param {RegExp} expression - the regex to find in the remaining string
     * @returns {ArrayLike} - a regexp result, or null of nothing was found
     */

  }, {
    key: 'nextWith',
    value: function nextWith(expression) {
      var result = expression.exec(this.str.substr(this.position));
      if (result) {
        this.position += result.index + result[0].length;
      }
      return result;
    }

    /**
     * Skip all whitespace currently at the cursor
     * @memberof StringInspector
     * @instance
     */

  }, {
    key: 'skipWhitespace',
    value: function skipWhitespace() {
      this.nextWhile(function (x) {
        return whitespace.indexOf(x) >= 0;
      });
    }

    /**
     * Peek at a character (or characters) without advancing the position
     * @memberof StringInspector
     * @instance
     * @param {number=} distance - the number of characters to peek at
     * @returns {string}
     */

  }, {
    key: 'peek',
    value: function peek(distance) {
      if (!distance) {
        distance = 1;
      }
      return this.str.substr(this.position, distance);
    }

    /**
     * Get the string that is represented by this inspector
     * @memberof StringInspector
     * @instance
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.str;
    }
  }, {
    key: 'str',
    get: function get$$1() {
      return this[strSymbol];
    }

    /**
     * @member {boolean} hasNext - if the inspector still has characters in the bin
     * @memberof StringInspector
     * @instance
     */

  }, {
    key: 'hasNext',
    get: function get$$1() {
      return this.position < this.str.length;
    }

    /**
     * @member {string} remainder - the remaining characters in the string
     * @instance
     * @memberof StringInspector
     */

  }, {
    key: 'remainder',
    get: function get$$1() {
      return this.str.substring(this.position);
    }
  }]);
  return StringInspector;
}();

var Value = function () {
  /**
   * Create a new value object
   * @constructs Value
   * @param {string} val - the raw value to set
   */
  function Value(val) {
    classCallCheck(this, Value);

    /**
     * @member {string} name - the arithmetic name of this value
     * @memberof Value
     * @instance
     */
    this.name = '';
    /**
     * @member {string} error - the error encountered while handling this value
     * @memberof Value
     * @instance
     */
    this.error = null;
    /**
     * @member {number} value - the final value of this object
     * @memberof Value
     * @instance
     */
    this.value = parseInt(val, 10);
    if (isNaN(this.value)) {
      this.value = 0;
      this.error = 'Specified value, ' + val + ', is not a number.';
    }
  }

  /**
   * @member {boolean} isValid - if true, this value is a valid entry
   * @memberof Value
   * @instance
   */


  createClass(Value, [{
    key: 'transfer',


    /**
     * Transfer this Value object's value onto the mathjs scope object
     * @memberof Value
     * @instance
     * @param {object} target - an object with keys for each dice value upon which to set this object's value
     * @returns {object} - the object that was passed in, populated with this object's values
     */
    value: function transfer(target) {
      if (!target) target = {};
      if (!this.name) throw new Error('Value\'s name property must be set to transfer a value.');
      target[this.name] = this.value;
      return target;
    }

    /**
     * Get a string representation of this value
     * @memberof Value
     * @instance
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this.notation;
    }

    /**
     * Get a string representing the constant's details
     * @memberof Value
     * @instance
     * @returns {string}
     */

  }, {
    key: 'toDetails',
    value: function toDetails() {
      return '(constant) ' + this.value;
    }
  }, {
    key: 'isValid',
    get: function get$$1() {
      return this.error == null;
    }

    /**
     * @member {string} notation - the notation for this value
     * @memberof Value
     * @instance
     */

  }, {
    key: 'notation',
    get: function get$$1() {
      return '' + this.value;
    }
  }]);
  return Value;
}();

var props = Object.freeze({
  original: Symbol('property:original'),
  isValid: Symbol('property:isValid'),
  error: Symbol('property:error'),
  keep: Symbol('property:keep'),
  drop: Symbol('property:drop'),
  highestRolls: Symbol('property:highestRolls'),
  lowestRolls: Symbol('property:lowestRolls'),
  explodingRolls: Symbol('property:explodingRolls'),
  reroll: Symbol('property:reroll')
});

// the characters that denote the start of a roll option
var commandCharacters = '!kdr';
// the regex that can parse a keep or drop command argument
var keepDropArguments = /^([hl]?)([0-9]+)/i;
// the regex that can parse a reroll argument
var rerollArguments = /^([<>]?=?)(\d+)/;

var isCommandChar = function isCommandChar(c) {
  return c && commandCharacters.indexOf(c) >= 0;
};

var simpleReroll = function simpleReroll(match) {
  return function (num) {
    return num === match;
  };
};

var comparisonReroll = function comparisonReroll(match, operator, orEquals) {
  if (operator === '>') {
    if (orEquals) {
      return function (num) {
        return num >= match;
      };
    } else {
      return function (num) {
        return num > match;
      };
    }
  } else if (operator === '<') {
    if (orEquals) {
      return function (num) {
        return num <= match;
      };
    } else {
      return function (num) {
        return num < match;
      };
    }
  } else {
    return function () {
      return false;
    };
  }
};

/**
 * Parse the options for the roll options object
 * @param {RollOptions} ro
 * @param {StringInspector} options 
 * @private
 */
var parseOptions = function parseOptions(ro, options) {
  while (ro[props.isValid] && options.hasNext) {
    var discard = options.nextUntil(isCommandChar);
    if (discard.trim()) {
      throw new Error('Discarded information found in RollOptions: ' + discard);
    }
    var cmd = options.next();
    if (cmd !== false) {
      switch (cmd) {
        case '!':
          ro[props.explodingRolls] = true;
          break;
        case 'k':
          var keepArgs = options.nextWith(keepDropArguments);
          if (keepArgs) {
            if (ro[props.drop]) {
              ro[props.isValid] = false;
              ro[props.error] = 'Cannot enable both "keep" and "drop" options simultaneously.';
            } else {
              if (keepArgs[1] === 'l' || keepArgs[1] === 'L') {
                ro[props.lowestRolls] = true;
                ro[props.highestRolls] = false;
              } else {
                ro[props.highestRolls] = true;
                ro[props.lowestRolls] = false;
              }
              ro[props.keep] = parseInt(keepArgs[2], 10);
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (k)eep modifier, e.g. k3, kl2, kh2';
          }
          break;
        case 'd':
          var dropArgs = options.nextWith(keepDropArguments);
          if (dropArgs) {
            if (ro[props.keep]) {
              ro[props.isValid] = false;
              ro[props.error] = 'Cannot enable both "keep" and "drop" options simultaneously.';
            } else {
              if (dropArgs[1] === 'h' || dropArgs[1] === 'H') {
                ro[props.highestRolls] = true;
                ro[props.lowestRolls] = false;
              } else {
                ro[props.lowestRolls] = true;
                ro[props.highestRolls] = false;
              }
              ro[props.drop] = parseInt(dropArgs[2], 10);
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (d)rop modifier, e.g. d3, dl2, dh3';
          }
          break;
        case 'r':
          var rerollArgs = options.nextWith(rerollArguments);
          if (rerollArgs) {
            var target = parseInt(rerollArgs[2], 10);
            if (isNaN(target)) {
              ro[props.isValid] = false;
              ro[props.error] = 'You must supply a number for reroll options';
            } else {
              if (rerollArgs[1].length) {
                var operator = rerollArgs[1][0];
                var orEquals = rerollArgs[1].length > 1;
                ro.reroll.push(comparisonReroll(target, operator, orEquals));
              } else {
                //simple match reroll
                ro.reroll.push(simpleReroll(target));
              }
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (r)eroll modifier, e.g. r1, r<5, r>=10';
          }
          break;
      }
    }
  }
};

var RollOptions = function () {
  /**
   * Create a new set of roll options
   * @param {string} options 
   * @constructs RollOptions
   */
  function RollOptions(options) {
    classCallCheck(this, RollOptions);

    this[props.original] = options;
    this[props.isValid] = true;
    this[props.error] = '';
    this[props.keep] = false;
    this[props.drop] = false;
    this[props.highestRolls] = false;
    this[props.lowestRolls] = false;
    this[props.explodingRolls] = false;
    this[props.reroll] = [];

    parseOptions(this, new StringInspector(options));
  }
  /**
   * @member {boolean} isValid - if true, the roll options are valid
   * @memberof RollOptions
   * @instance
   * @readonly
   */


  createClass(RollOptions, [{
    key: 'needReroll',


    /**
     * Check a roll to see if it needs to be rerolled
     * @param {number} num - the roll value to check for needs to reroll
     * @memberof RollOptions
     * @instance
     */
    value: function needReroll(num) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.reroll[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;

          if (rule(num)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }

    /**
     * Get the RollOptions original string
     * @memberof RollOptions
     * @instance
     */

  }, {
    key: 'toString',
    value: function toString() {
      return this[props.original];
    }

    /**
     * Try to get all possible options from a string inspector
     * @param {StringInspector} parser 
     * @returns {string} the resulting options string
     * @memberof RollOptions
     */

  }, {
    key: 'isValid',
    get: function get$$1() {
      return this[props.isValid];
    }
    /**
     * @member {string} error - if truthy, the error that was encountered while parsing the options
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'error',
    get: function get$$1() {
      return this[props.error];
    }
    /**
     * @member {(number|boolean)} keep - if true-ish, keep only that number of dice rolls from the roll set
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'keep',
    get: function get$$1() {
      return this[props.keep];
    }
    /**
     * @member {(number|boolean)} drop - if true-ish, drop that number of dice rolls from the roll set
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'drop',
    get: function get$$1() {
      return this[props.drop];
    }
    /**
     * @member {boolean} highestRolls - if true, keep/drop applies to the highest rolls
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'highestRolls',
    get: function get$$1() {
      return this[props.highestRolls];
    }
    /**
     * @member {boolean} lowestRolls - if true, keep/drop applies to the lowest rolls
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'lowestRolls',
    get: function get$$1() {
      return this[props.lowestRolls];
    }
    /**
     * @member {boolean} explodingRolls - if true, max value rolls should be rolled an additional time
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'explodingRolls',
    get: function get$$1() {
      return this[props.explodingRolls];
    }
    /**
     * @member {Array} reroll - the collection of reroll callbacks
     * @memberof RollOptions
     * @instance
     * @readonly
     */

  }, {
    key: 'reroll',
    get: function get$$1() {
      return this[props.reroll];
    }
  }], [{
    key: 'findOptions',
    value: function findOptions(parser) {
      var options = [];
      while (isCommandChar(parser.peek())) {
        var letter = parser.next();
        options.push(letter);
        switch (letter) {
          case 'k':
          case 'd':
            var kdArgs = parser.nextWith(keepDropArguments);
            if (kdArgs) {
              options.push(kdArgs[0]);
            }
            break;
          case 'r':
            var rArgs = parser.nextWith(rerollArguments);
            if (rArgs) {
              options.push(rArgs[0]);
            }
            break;
        }
      }
      return options.join('');
    }
  }]);
  return RollOptions;
}();

var RawRoll = function () {
  /**
   * Create a new raw roll
   * @constructs RawRoll
   * @param {number} value - the value rolled
   */
  function RawRoll(value, rerolled, dropped, exploded) {
    classCallCheck(this, RawRoll);

    /**
     * @member {number} value - the value of the roll
     * @memberof RawRoll
     * @instance
     */
    this.value = value;
    /**
     * @member {boolean} rerolled - if true, the die was rerolled
     * @memberof RawRoll
     * @instance
     */
    this.rerolled = !!rerolled;
    /**
     * @member {boolean} dropped - if true, the die was dropped
     * @memberof RawRoll
     * @instance
     */
    this.dropped = !!dropped;
    /**
     * @member {boolean} exploded - if true, the die exploded
     * @memberof RawRoll
     * @instance
     */
    this.exploded = !!exploded;
  }

  /**
   * Gets a string representation of the RawRoll
   * @returns {string}
   * @memberof RawRoll
   */


  createClass(RawRoll, [{
    key: 'toString',
    value: function toString() {
      var rr = this.rerolled ? '\uD83D\uDD03' : '';
      var dr = this.dropped ? '\u2716' : '';
      var ex = this.exploded ? '!' : '';
      return '' + this.value + ex + dr + rr;
    }
  }]);
  return RawRoll;
}();

var defaultRoll = function defaultRoll(numFaces) {
  return function (options) {
    var rollResult = math.randomInt(numFaces) + 1;
    var rerolled = options.needReroll(rollResult);
    var exploded = rollResult === numFaces && options.explodingRolls;
    return new RawRoll(rollResult, rerolled, false, exploded);
  };
};



// module.exports = defaultRoll;

var ROLL_RANGE = [-1, 0, 1];

var fudgeRoll = function fudgeRoll() {
  return function (options) {
    var roll = math.pickRandom(ROLL_RANGE);
    var reroll = options.needReroll(roll);
    return new RawRoll(roll, reroll);
  };
};


// module.exports = fudgeRoll;

/**
 * A collection of dice rolling functions
 * @module internal/rollfunctions
 */

/**
 * A function to process rolls
 * @callback rollFunction
 * @memberof module:internal/rollfunctions
 * @param {RollOptions} options - the options for this roll
 * @returns {RawRoll}
 */

var rollFunctions = Object.freeze({
  /**
   * @member {Function} default - the default dice roller. Takes a number of sides and returns a callback that takes a RollOptions argument
   * @param {number} num - the number of faces
   * @returns {module:internal/rollfunctions:rollFunction}
   * @memberof module:internal/rollfunctions
   */
  default: defaultRoll,
  /**
   * @member {Function} f - the fudge dice roller. Returns a callback that takes a RollOptions argument
   * @returns {module:internal/rollfunctions:rollFunction}
   * @memberof module:internal/rollfunctions
   */
  f: fudgeRoll
});

/**
 * Internal utilities used by various functions in the library
 * @module internal/utils
 */

/**
 * Sort function for an array of RawRoll objects
 * @param {RawRoll} a 
 * @param {RawRoll} b 
 * @returns {number}
 * @memberof module:internal/utils
 */
var rollSort = function rollSort(a, b) {
  if (a.value < b.value) {
    return -1;
  } else if (a.value > b.value) {
    return 1;
  } else {
    return 0;
  }
};

/**
 * Sum the values of a collection of rolls
 * @param {RawRoll[]} rolls 
 * @returns {number}
 * @memberof module:internal/utils
 */
var sumRolls = function sumRolls(rolls) {
  return rolls.map(function (r) {
    return r.value;
  }).reduce(function (sum, v) {
    return sum + v;
  }, 0);
};

/**
 * Trim a set of rolls based upon its start and end indices, then sum the values
 * @param {RawRoll[]} rolls - the array of rolls
 * @param {number} start - the start index (included)
 * @param {number} end - the end index (excluded)
 * @returns {RawRoll[]}
 * @memberof module:internal/utils
 */
var trimRolls = function trimRolls(rolls, start, end) {
  rolls.sort(rollSort);

  if (end == null) {
    end = rolls.length;
  }
  [].concat(toConsumableArray(rolls.slice(0, start)), toConsumableArray(rolls.slice(end))).forEach(function (x) {
    return x.dropped = true;
  });

  return sumRolls(rolls.slice(start, end));
};

var numericTest = /[0-9.]/;
/**
 * Check if a string contains a number
 * @param {string} str 
 * @returns {boolean}
 * @memberof module:internal/utils
 */
var isNumeric = function isNumeric(str) {
  return numericTest.test(str);
};

var MAX_REROLL = 50;
var basicRollPattern = /^(\d*)[dD](\d+|f)/;

/**
 * Do all the necessary rolls for this roll group
 * @param {DiceValue} val 
 * @param {DiceValue~rollFunction} roller 
 * @private
 */
var doRolls = function doRolls(val, roller) {
  var rollCount = val.dice;
  var rerollCount = 0;
  for (var idx = 0; idx < rollCount; idx++) {
    var result = roller(val.options);
    val.details.push(result);

    //if the roll explodes, increment the total roll count
    if (result.exploded) {
      rollCount++;
    }
    //if the roll must be rerolled, increment rollcount and reroll count
    if (result.rerolled) {
      if (rerollCount < MAX_REROLL) {
        rollCount++;
        rerollCount++;
      } else {
        result.rerolled = false;
      }
    }
  }

  var validRolls = val.details.filter(function (x) {
    return !x.rerolled;
  });

  if (val.options.drop) {
    if (val.options.highestRolls) {
      //drop highest
      val.value = trimRolls(validRolls, 0, validRolls.length - val.options.drop);
    } else {
      //drop lowest
      val.value = trimRolls(validRolls, val.options.drop);
    }
  } else if (val.options.keep) {
    if (val.options.lowestRolls) {
      //keep lowest
      val.value = trimRolls(validRolls, 0, val.options.keep);
    } else {
      //keep highest
      val.value = trimRolls(validRolls, validRolls.length - val.options.keep);
    }
  } else {
    //no drop/keep, sum all
    val.value = sumRolls(validRolls);
  }
};

var DiceValue = function (_Value) {
  inherits(DiceValue, _Value);

  /**
   * Create a new dice roll value
   * @constructs DiceValue
   * @extends Value
   * @param {string} dice - the number of dice being rolled
   * @param {string} faces - the number of faces on the dice
   * @param {string} options - the options for this rollset
   */
  function DiceValue(dice, faces, options) {
    classCallCheck(this, DiceValue);

    /**
     * @member {number} dice - the number of dice being rolled
     * @memberof DiceValue
     * @instance
     */
    var _this = possibleConstructorReturn(this, (DiceValue.__proto__ || Object.getPrototypeOf(DiceValue)).call(this, '0'));

    _this.dice = parseInt(dice || '1', 10);
    /**
     * @member {(number|string)} faces - the type of dice being rolled
     * @memberof DiceValue
     * @instance
     */
    _this.faces = faces;
    /**
     * @member {RollOptions} options - the options for this dice roll
     * @memberof DiceValue
     * @instance
     */
    _this.options = new RollOptions(options);
    /**
     * @member {RawRoll[]} details - the detailed results of the roll
     * @memberof DiceValue
     * @instance
     */
    _this.details = [];

    if (!_this.dice || isNaN(_this.dice) || _this.dice < 1 || _this.dice >= 1000) {
      _this.error = 'Invalid number of dice';
    } else {
      if (isNumeric(_this.faces)) {
        _this.faces = parseInt(_this.faces);
        if (_this.faces < 2) {
          _this.error = 'You must have at least 2 faces to roll dice';
        }
      } else {
        if (!rollFunctions.hasOwnProperty(_this.faces)) {
          _this.error = 'Invalid dice type: ' + _this.faces;
        }
      }
    }

    if (_this.isValid) {
      if (_this.options.isValid) {
        // ensure the options are valid for this dice roll
        if (_this.options.drop && _this.options.drop >= _this.dice) {
          _this.error = 'Cannot drop ' + _this.options.drop + ' dice when only ' + _this.dice + ' are being rolled.';
        }
        if (_this.options.keep && _this.options.keep > _this.dice) {
          _this.error = 'Cannot keep ' + _this.options.keep + ' dice when only ' + _this.dice + ' are being rolled.';
        }
      } else {
        _this.error = 'Invalid options: ' + _this.options;
      }
    }

    return _this;
  }

  /**
   * Perform the dice rolls for this roll
   * @memberof DiceValue
   * @instance
   */


  createClass(DiceValue, [{
    key: 'roll',
    value: function roll() {
      if (this.isValid) {
        if (typeof this.faces === 'string') {
          doRolls(this, rollFunctions[this.faces]());
        } else {
          doRolls(this, rollFunctions.default(this.faces));
        }
      }
    }

    /**
     * @member {string} notation - the dice notation for this roll
     * @memberof DiceValue
     * @instance
     * @readonly
     */

  }, {
    key: 'toString',


    /**
     * Get a string representation of this dice roll
     * @returns {string}
     * @memberof DiceValue
     * @instance
     */
    value: function toString() {
      return '(' + this.notation + ') ' + this.value;
    }

    /**
     * Get a detailed readout of the roll results
     * @returns {string}
     * @memberof DiceValue
     * @instance
     */

  }, {
    key: 'toDetails',
    value: function toDetails() {
      var detailsString = this.details.map(function (detail) {
        return detail.toString();
      }).join(',');
      return '(' + this.notation + ') [' + detailsString + '] = ' + this.value;
    }

    /**
     * Try to find a dice roll in the provided StringInspector
     * @param {StringInspector} inspector 
     * @returns {DiceValue} or null of no roll was found
     * @memberof DiceValue
     * @static
     */

  }, {
    key: 'notation',
    get: function get$$1() {
      return this.dice + 'd' + this.faces + this.options;
    }
  }], [{
    key: 'findDiceRoll',
    value: function findDiceRoll(inspector) {
      var maybe = inspector.peek(10);
      if (basicRollPattern.test(maybe)) {
        var match = inspector.nextWith(basicRollPattern);
        var numDice = match[1] || '1';
        var faces = match[2];
        var options = RollOptions.findOptions(inspector);
        return new DiceValue(numDice, faces, options);
      } else {
        return null;
      }
    }
  }]);
  return DiceValue;
}(Value);

var constantExpression = /^(\d+)/;
var operandExpression = /^([+*/%^()-])/;

/**
 * Parse a DiceExpression's original expression string
 * @param {DiceExpression} result 
 * @private
 */
var parse = function parse(subject) {
  var exp = new StringInspector(subject.original.trim());
  var match = [];

  while (exp.hasNext && match) {
    exp.skipWhitespace();

    //check for dice rolls
    var roll = DiceValue.findDiceRoll(exp);
    if (roll) {
      subject.addValue(roll);
      continue;
    }

    //check for constants
    match = exp.nextWith(constantExpression);
    if (match) {
      subject.addValue(new Value(match[1]));
      continue;
    }

    //check for operands
    match = exp.nextWith(operandExpression);
    if (match) {
      subject.addOperator(match[1]);
    }
  }

  var label = exp.remainder.trim();
  if (label) {
    subject.label = label;
  }
};

var DiceExpression = function () {
  /**
   * Create a new DiceExpression, but you probably want .parse
   * @constructs DiceExpression
   * @param {string} original - the original string that will be parsed and prepared for execution.
   */
  function DiceExpression(original) {
    classCallCheck(this, DiceExpression);

    /**
     * @member {string} original - the original string parsed into this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.original = original;
    /**
     * @member {string[]} segments - the string segments of the mathematical expression parsed by this object
     * @memberof DiceExpression
     * @instance
     */
    this.segments = [];
    /**
     * @member {Value[]} values - the constant and dice roll values for this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.values = [];
    /**
     * @member {string} expression - the mathematical expression for this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.expression = '';
    /**
     * @member {string} notation - the expression with placeholders replaced by notation values
     * @memberof DiceExpression
     * @instance
     */
    this.notation = '';
    /**
     * @member {string} label - the specified label for the overall roll
     * @memberof DiceExpression
     * @instance
     */
    this.label = '';
    /**
     * @member {string} error - the error invalidating the dice expression
     * @memberof DiceExpression
     * @instance
     */
    this.error = null;
    /**
     * @member {number} result - the total of the dice rolls
     * @memberof DiceExpression
     * @instance
     */
    this.result = 0;

    parse(this);

    if (this.values.length < 1) {
      this.error = 'Invalid roll: No dice to roll. Try help';
    }
  }

  /**
   * @member {boolean} isValid - if true, the expression is valid
   * @memberof DiceExpression
   * @instance
   * @readonly
   */


  createClass(DiceExpression, [{
    key: 'addValue',


    /**
     * Add a value to the DiceExpression
     * @param {Value} x 
     * @memberof DiceExpression
     * @instance
     */
    value: function addValue(x) {
      x.name = '$' + this.values.length;
      this.values.push(x);
      this.segments.push(x.name);
    }

    /**
     * Add an operator to the expression
     * @param {string} x - the operator to add
     * @memberof DiceExpression
     * @instance
     */

  }, {
    key: 'addOperator',
    value: function addOperator(x) {
      this.segments.push(x);
    }

    /**
     * Update the notation field with a value's notation
     * @param {Value} value 
     * @memberof DiceExpression
     * @instance
     */

  }, {
    key: 'updateNotation',
    value: function updateNotation(value) {
      this.notation = this.notation.replace(value.name, value.notation);
    }

    /**
     * build and execute this DiceExpression
     * @memberof DiceExpression
     * @instance
     */

  }, {
    key: 'execute',
    value: function execute() {
      var _this = this;

      if (this.isValid) {
        this.expression = this.segments.join(' ');
        this.notation = this.expression;
        try {
          var func = math.compile(this.expression);

          if (this.values.every(function (x) {
            return x.isValid;
          })) {
            var scope = {};
            this.values.forEach(function (val) {
              if (val instanceof DiceValue) {
                val.roll();
              }
              val.transfer(scope);
              _this.updateNotation(val);
            });
            this.result = func.eval(scope);
          } else {
            var valueErrors = this.values.filter(function (x) {
              return !x.isValid;
            }).join('\r\n');
            this.error = 'Invalid values:\r\n' + valueErrors;
          }
        } catch (err) {
          this.error = err;
        }
      }
    }

    /**
     * Get a simple string representation of the DiceExpression
     * @memberof DiceExpression
     * @instance
     * @returns {string}
     */

  }, {
    key: 'toString',
    value: function toString() {
      if (!this.isValid) {
        return this.error;
      }
      var label = this.label ? ' ' + this.label : '';
      return 'Total: ' + this.result + label;
    }

    /**
     * Get a detailed string representation of the DiceExpression and all rolls
     * @memberof DiceExpression
     * @instance
     * @returns {string}
     */

  }, {
    key: 'toDetails',
    value: function toDetails() {
      if (!this.isValid) {
        return this.error;
      }
      var lines = [];
      if (this.label) {
        lines.push(this.label);
      }
      lines.push('Total: ' + this.result);
      lines.push('Formula: ' + this.notation);
      lines.push('Rolls:');
      this.values.forEach(function (v) {
        if (v instanceof DiceValue) {
          lines.push(v.toDetails());
        }
      });
      return lines.join('\r\n');
    }
  }, {
    key: 'isValid',
    get: function get$$1() {
      return this.error == null;
    }
  }]);
  return DiceExpression;
}();

var syntax = ['Supports standard dice notation, as well as some extended functionality.', 'syntax: <roll>[<operator><roll><operator><roll>...][<operator><constant>]', 'roll: [<number of dice>]d<number of sides>[<modifiers>]', '      default number of dice: 1', 'number of sides: any integer, or f (for Fudge dice)', 'operator: +, -, *, /, %, (, or )', 'constant: any integer', 'modifiers:', '  ! - exploding dice, a maximum roll value causes recursive reroll and summation', '  d<number> - drop the lowest X rolls from this group', '  k<number> - keep the highest X rolls from this group', '  h - alter either d or k modifier to affect the highest rolls, e.g. dh3: drop the highest 3 rolls', '  l - alter either d or k modifier to affect the lowest rolls, e.g. kl2: keep the lowest 2 rolls', '  r - reroll based on certain rules', '    r4 - reroll all 4s', '    r<3 - reroll anything less than 3', '    r>=11 - reroll anything greater than or equal to 11', 'modifiers can be combined, but d and k are mutually exclusive'].join('\n');

var specialData = new Map();
specialData.set('barrel', 'Donkey Kong rolls a barrel down the ramp and crushes you. -1000pts');
specialData.set('rick', 'No.');
specialData.set('katamari', 'Na naaaaa, na na na na na na, na na Katamari Damacy....');
specialData.set('help', syntax);
specialData.set('syntax', syntax);

/**
 * Exposes an api to check for special responses
 */

var SpecialFunctions = function () {
  function SpecialFunctions() {
    classCallCheck(this, SpecialFunctions);
  }

  createClass(SpecialFunctions, [{
    key: 'getSpecial',

    /**
     * Check for a special response to a roll argument
     * @param {string} expression the roll expression to check against the special functions
     */
    value: function getSpecial(expression) {
      if (expression && specialData.has(expression)) {
        return specialData.get(expression);
      }
      return null;
    }
  }]);
  return SpecialFunctions;
}();

var SpecialFunctions$1 = new SpecialFunctions();

var inputProperty = Symbol('DiceRoll.input');
var resultProperty = Symbol('DiceRoll.result');
var expressionProperty = Symbol('DiceRoll.expression');

var DiceRoll = function () {
  /**
   * Create a new DiceRoll
   * @constructs DiceRoll
   * @param {string} input - the request string 
   * @param {object} options - the options object
   * @param {boolean} options.detailed - if you want the detailed roll output
   */
  function DiceRoll(input, options) {
    classCallCheck(this, DiceRoll);

    if (!options) options = {};
    this[inputProperty] = input;
    var isSpecial = SpecialFunctions$1.getSpecial(input);
    if (isSpecial) {
      this[resultProperty] = isSpecial;
    } else {

      var expression = new DiceExpression(input);
      this[expressionProperty] = expression;

      if (expression.isValid) {
        expression.execute();
        if (expression.isValid) {
          if (options.detailed) {
            this[resultProperty] = expression.toDetails();
          } else {
            this[resultProperty] = expression.toString();
          }
        } else {
          this[resultProperty] = expression.error;
        }
      } else {
        this[resultProperty] = expression.error;
      }
    }
  }

  /**
   * @member {string} input - the input string
   * @memberof DiceRoll
   * @instance
   * @readonly
   */


  createClass(DiceRoll, [{
    key: 'toString',


    /**
     * Get the result string of this DiceRoll
     * @memberof DiceRoll
     * @instance
     */
    value: function toString() {
      return this.result;
    }
  }, {
    key: 'input',
    get: function get$$1() {
      return this[inputProperty];
    }

    /**
     * @member {string} result - the result of any dicerolls
     * @memberof DiceRoll
     * @instance
     * @readonly
     */

  }, {
    key: 'result',
    get: function get$$1() {
      return this[resultProperty];
    }

    /**
     * @member {DiceExpression} expression - if not null, the dice expression that was parsed
     * @memberof DiceRoll
     * @instance
     * @readonly
     */

  }, {
    key: 'expression',
    get: function get$$1() {
      return this[expressionProperty];
    }
  }]);
  return DiceRoll;
}();

module.exports = DiceRoll;
