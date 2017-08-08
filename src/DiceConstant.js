/**
 * Represents a constant numeric value, for use in dice expressions
 * @param {string} val - the constant value to be parsed and used as part of the equation
 */
function DiceConstant(val){
  this.results = {
    total: 0
  }
  this.isValid = true;
  this.toString = function(){ return '' + this.results.total; };
  var nval = parseInt(val, 10);
  if(isNaN(nval)){
    this.isValid = false;
  } else {
    this.results.total = nval;
  }
}

module.exports = DiceConstant;