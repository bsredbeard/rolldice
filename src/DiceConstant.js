/**
 * Represents a constant numeric value, for use in dice expressions
 * @param {string} val - the constant value to be parsed and used as part of the equation
 */
function DiceConstant(val){
  /**
   * @member {object} results - the constant value result
   * @member {number} results.total - the constant value numeric result
   */
  this.results = {
    total: 0
  }
  /**
   * @member {boolean} isValid - true if the value is a number
   */
  this.isValid = true;
  /**
   * Gets a string representation of the constant value
   * @func toString
   */
  this.toString = function(){ return '' + this.results.total; };
  var nval = parseInt(val, 10);
  if(isNaN(nval)){
    this.isValid = false;
  } else {
    this.results.total = nval;
  }
}

module.exports = DiceConstant;