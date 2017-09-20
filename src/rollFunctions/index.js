/**
 * A collection of dice rolling functions
 * @prop {Function} default - the default dice roller. Takes a number of sides and returns a callback that takes a RollOptions argument
 * @prop {Function} f - the fudge dice roller. Returns a callback that takes a RollOptions argument
 */
const rollFunctions = Object.freeze({
  default: require('./default'),
  f: require('./fudge')
});

module.exports = rollFunctions;