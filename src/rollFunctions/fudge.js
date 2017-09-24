const math = require('mathjs');
const RawRoll = require('../RawRoll');

const ROLL_RANGE = [-1, 0, 1];

const fudgeRoll = () => {
  return (options) => {
    const roll = math.pickRandom(ROLL_RANGE);
    const reroll = options.needReroll(roll);
    return new RawRoll(roll, reroll);
  }
};

module.exports = fudgeRoll;