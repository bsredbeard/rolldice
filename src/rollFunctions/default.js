import * as math from 'mathjs';
import RawRoll from '../RawRoll';

const defaultRoll = (numFaces) => {
  return (options) => {
    const rollResult = math.randomInt(numFaces)+1;
    const rerolled = options.needReroll(rollResult);
    const exploded = (rollResult === numFaces && options.explodingRolls);
    return new RawRoll(rollResult, rerolled, false, exploded);
  }
};

export default defaultRoll;

// module.exports = defaultRoll;