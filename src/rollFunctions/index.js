import defaultRoll from './default';
import fudgeRoll from './fudge';

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

const rollFunctions = Object.freeze({
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

export default rollFunctions;