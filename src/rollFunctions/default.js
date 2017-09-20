const RawRoll = require('../RawRoll');
const roller = require('./roller');

const defaultRoll = (numFaces) => {
  return (options) => {
    const rollResult = roller(numFaces);
    const rerolled = options.needReroll(rollResult);
    const exploded = (rollResult === numFaces && options.explodingRolls);
    return new RawRoll(rollResult, rerolled, false, exploded);
  }
};

module.exports = defaultRoll;