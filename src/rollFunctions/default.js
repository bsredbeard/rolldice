const math = require('mathjs');
const RawRoll = require('../RawRoll');

const defaultRoll = (numFaces) => {
  return (options) => {
    const rollResult = math.randomInt(numFaces)+1;
    const rerolled = options.needReroll(rollResult);
    const exploded = (rollResult === numFaces && options.explodingRolls);
    return new RawRoll(rollResult, rerolled, false, exploded);
  }
};

module.exports = defaultRoll;