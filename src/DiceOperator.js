function addition(left, right){
  return left + right;
}
function subtraction(left, right){
  var diff = left - right;
  return diff > 0 ? diff : 0;
}

/**
 * Represents an operator to combine two rolls / constants
 * @param {string} op - the combination operator to store
 */
function DiceOperator(op){
  /**
   * @prop {string} operator - the operator that was provided
   */
  this.operator = op;
  /**
   * @prop {boolean} isValid - true if this is a valid operator
   */
  this.isValid = (op === '-' || op === '+');
  /**
   * @prop {Function} toString - returns a normalized text form of the operator
   */
  this.toString = function() { return ' ' + op + ' '; };
  /**
   * @function delegate
   * @param {number} left - the left side operation argument
   * @param {number} right - the right side operation argument
   */
  this.delegate = addition;
  if(this.isValid){
    if(op==='-'){
      this.delegate = subtraction;
    }
  }
}

module.exports = DiceOperator;