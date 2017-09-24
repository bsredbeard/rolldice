/**
 * A value that can be used to export values to the math scope object
 */
class Value{
  /**
   * Create a new value object
   * @constructs Value
   * @param {string} val - the raw value to set
   */
  constructor(val) {
    /** @member {string} name - the arithmetic name of this value */
    this.name = '';
    /** @member {string} error - the error encountered while handling this value */
    this.error = null;
    /** @member {value} number - the final value of this object */
    this.value = parseInt(val, 10);
    if(isNaN(this.value)){
      this.value = 0;
      this.error = `Specified value, ${val}, is not a number.`;
    }
  }

  /** @member {boolean} isValid - if true, this value is a valid entry */
  get isValid() { return this.error == null; }

  get notation() { return '' + this.value; }

  /**
   * Transfer this Value object's value onto the mathjs scope object
   * @param {*} target - an object with keys for each dice value upon which to set this object's value
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
   * @returns {string}
   */
  toString(){
    return this.notation;
  }

  toDetails(){
    return '(constant) ' + this.value;
  }
}

module.exports = Value;