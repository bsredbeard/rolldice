var DiceRoll = require('./DiceRoll');
var DiceOperator = require('./DiceOperator');
var DiceConstant = require('./DiceConstant');
var specialFunctions = require('./SpecialFunctions');

/**
 * Checks the parsed operations of a dice expression for validity
 * @returns {boolean} true if the expression is valid
 */
function validate(){
  var isValid = false;
  if(this.operations && this.operations.length){
    
    var hasRolls = false;
    var operationsValid = this.operations.reduce(function(agg, op){
      if(op instanceof DiceRoll){
        hasRolls = true;
      }
      return agg && op.isValid;
    }, true);
    var validStart = false;
    var validEnd = false;
    
    if(hasRolls){
      validStart = !(this.operations[0] instanceof DiceOperator);
      validEnd = !(this.operations[this.operations.length-1] instanceof DiceOperator);
    }

    isValid = hasRolls && operationsValid && validStart && validEnd;
    
  }
  return isValid;
}

/**
 * Executes the operations of a DiceExpression
 */
function execute(){
  if(this.isValid){
    var currentTotal = 0;
    var operatorBuffer = null;
    for(var opIndex in this.operations){
      var operation = this.operations[opIndex];
      if(operation instanceof DiceRoll){
        operation.execute();
      }
      if(operation instanceof DiceOperator){
        if(operatorBuffer === null){
          operatorBuffer = operation;
        } else {
          throw new Error('Pre-existing operator');
        }
      } else {
        if(operatorBuffer){
          currentTotal = operatorBuffer.delegate(currentTotal, operation.results.total);
          operatorBuffer = null;
        } else {
          currentTotal = operation.results.total;
        }
      }
    }
    //store the results in a way they can be exposed
    this.result = currentTotal;
    this.details = this.operations.reduce(function(descr, op){
      return descr + op.toString();
    }, '');
  }
}

function toString(){
  if(this.special){
    return this.special;
  } else {
    if(this.isValid){
      return (this.label ? this.label + ': ' : '') + this.result + ' rolls: ' + this.details;
    } else {
      return 'invalid dice roll';
    }
  }
}

/**
 * Creates a new dice expression from an input string
 * @class {DiceExpression}
 * @param {string} expr - the dice notation expression to parse
 * @example
 * let exp = new DiceExpression('2d6 + 3');
 * console.log(exp.toString());
 */
function DiceExpression(expr){
  var operations = [];
  var diceNotation = /^\s*([+-])?\s*(\d*)d(\d+|f)([^\s+-]*)/i;
  
  var special = specialFunctions.getSpecial(expr);
  if(special){
    this.special = special;
  } else {
    var srcString = expr;
    while(srcString){
      var match = diceNotation.exec(srcString);
      if(match){
        var operator = match[1];
        var numDice = match[2];
        var numFaces = match[3];
        var options = match[4];
        
        if(operator){
          operations.push(new DiceOperator(operator));
        }
        if(numFaces){
          operations.push(new DiceRoll(numDice, numFaces, options));
        }
        //consume a bit of the string
        srcString = srcString.length > match[0].length ? srcString.substr(match[0].length) : null;
      } else {
        var tailExpression = /\s*([+-])\s*([0-9]+)/i;
        match = tailExpression.exec(srcString);
        if(match){
          var operator = match[1];
          var cval = match[2];
          if(operator){
            operations.push(new DiceOperator(operator));
          }
          if(cval){
            operations.push(new DiceConstant(cval));
          }
        }
        
        var labelExpression = /for\s+(.*)/;
        match = labelExpression.exec(srcString);
        if(match){
          this.label = match[1];
        }
        
        //make sure the loop can exit after looking for constants
        srcString = null;
      }
    }
  }
  /**
   * @member {DiceOperator[]} operations - the operations built up from the epxression string
   */
  this.operations = operations;
  /**
   * @member {Function} toString - gets a formatted string notation of the results
   */
  this.toString = toString.bind(this);
  /**
   * @member {boolean} isValid - indicates if this DiceExpression was constructed from a valid string
   */
  this.isValid = validate.apply(this);

  if(this.isValid){
    execute.apply(this);
  }

  /**
   * @member {number} result - if set, the result of the roll
   */

  /**
  * @member {string} details - if set, the detailed rolls of a given expression
  */
}

module.exports = DiceExpression;