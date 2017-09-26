export default class RawRoll{
  /**
   * Create a new raw roll
   * @constructs RawRoll
   * @param {number} value - the value rolled
   */
  constructor(value, rerolled, dropped, exploded){
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
  toString(){
    const rr = this.rerolled ? '\u{1f503}' : '';
    const dr = this.dropped ? '\u2716' : '';
    const ex = this.exploded ? '!' : '';
    return `${this.value}${ex}${dr}${rr}`;
  }
}