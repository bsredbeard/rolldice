const roller = require('./roller');
const RawRoll = require('../RawRoll');

const ROLL_RANGE = [-1, 0, 1];

const fudgeRoll = () => {
  return (options) => {
    const rollResult = roller(ROLL_RANGE.length)
    const mappedResult = ROLL_RANGE[rollResult - 1];
    const reroll = options.needReroll(mappedResult);
    return new RawRoll(mappedResult, reroll);
  }
};

module.exports = fudgeRoll;