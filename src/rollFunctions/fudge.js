import * as math from 'mathjs';
import RawRoll from '../RawRoll';

const ROLL_RANGE = [-1, 0, 1];

const fudgeRoll = () => {
  return (options) => {
    const roll = math.pickRandom(ROLL_RANGE);
    const reroll = options.needReroll(roll);
    return new RawRoll(roll, reroll);
  }
};

export default fudgeRoll;
// module.exports = fudgeRoll;