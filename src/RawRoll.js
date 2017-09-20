/**
 * Represents a singlar dice roll
 * @class
 */
class RawRoll{
  /**
   * Create a new raw roll
   * @constructs RawRoll
   * @param {number} value - the value rolled
   */
  constructor(value, rerolled, dropped, exploded){
    /** @member {number} value - the value of the roll */
    this.value = value;
    /** @member {boolean} rerolled - if true, the die was rerolled */
    this.rerolled = !!rerolled;
    /** @member {boolean} dropped - if true, the die was dropped */
    this.dropped = !!dropped;
    /** @member {boolean} exploded - if true, the die exploded */
    this.exploded = !!exploded;
  }

  /**
   * Gets a string representation of the RawRoll
   * @returns {string}
   */
  toString(){
    const rr = this.rerolled ? '<reroll>' : '';
    const dr = this.dropped ? '<drop>' : '';
    const ex = this.exploded ? '!' : '';
    return `${this.value}${ex}${dr}${rr}`;
  }
}

module.exports = RawRoll;