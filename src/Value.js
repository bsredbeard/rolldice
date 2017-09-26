export default class Value{
  /**
   * Create a new value object
   * @constructs Value
   * @param {string} val - the raw value to set
   */
  constructor(val) {
    /**
     * @member {string} name - the arithmetic name of this value
     * @memberof Value
     * @instance
     */
    this.name = '';
    /**
     * @member {string} error - the error encountered while handling this value
     * @memberof Value
     * @instance
     */
    this.error = null;
    /**
     * @member {number} value - the final value of this object
     * @memberof Value
     * @instance
     */
    this.value = parseInt(val, 10);
    if(isNaN(this.value)){
      this.value = 0;
      this.error = `Specified value, ${val}, is not a number.`;
    }
  }

  /**
   * @member {boolean} isValid - if true, this value is a valid entry
   * @memberof Value
   * @instance
   */
  get isValid() { return this.error == null; }

  /**
   * @member {string} notation - the notation for this value
   * @memberof Value
   * @instance
   */
  get notation() { return '' + this.value; }

  /**
   * Transfer this Value object's value onto the mathjs scope object
   * @memberof Value
   * @instance
   * @param {object} target - an object with keys for each dice value upon which to set this object's value
   * @returns {object} - the object that was passed in, populated with this object's values
   */
  transfer(target){
    if(!target) target = {};
    if(!this.name) throw new Error('Value\'s name property must be set to transfer a value.');
    target[this.name] = this.value;
    return target;
  }

  /**
   * Get a string representation of this value
   * @memberof Value
   * @instance
   * @returns {string}
   */
  toString(){
    return this.notation;
  }

  /**
   * Get a string representing the constant's details
   * @memberof Value
   * @instance
   * @returns {string}
   */
  toDetails(){
    return '(constant) ' + this.value;
  }
}