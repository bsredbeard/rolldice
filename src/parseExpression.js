const math = require('mathjs');

const StringInspector = require('./StringInspector');
const Value = require('./Value');
const DiceValue = require('./DiceValue');

const rollExpression = /^(\d*)d(\d+|[f])([kdhl!0-9]?)/;
const constantExpression = /^(\d+)/;
const operandExpression = /^([+*\/%^()-])/;

/**
 * Represents a parsed set of dice roll inputs
 */
class DiceExpression {
  /**
   * Create a new DiceExpression, but you probably want .parse
   * @constructs DiceExpression
   * @param {string} original - the original string that was parsed into this DiceExpression
   */
  constructor(original){
    /** @member {string} original - the original string parsed into this DiceExpression */
    this.original = original;
    /** @member {string[]} segments - the string segments of the mathematical expression parsed by this object */
    this.segments = [];
    /** @member {Value[]} values - the constant and dice roll values for this DiceExpression */
    this.values = [];
    /** @member {string} expression - the mathematical expression for this DiceExpression */
    this.expression = '';
    /** @member {Object} func - the expression compiled to a function */
    this.func = {
      eval: () => 0
    };
    /** @member {string} label - the specified label for the overall roll */
    this.label = '';
    /** @member {boolean} isValid - if this DiceExpression is valid */
    this.isValid = true;
    this.error = null;
  }

  /**
   * Add a value to the DiceExpression
   * @param {Value} x 
   */
  addValue(x){
    x.name = '$' + this.values.length;
    this.values.push(x);
    this.segments.push(x.name);
  }

  /**
   * Add an operator to the expression
   * @param {string} x - the operator to add
   */
  addOperator(x){
    this.segments.push(x);
  }

  /**
   * build and validate this DiceExpression
   */
  build(){
    this.expression = this.segments.join(' ');
    try{
      this.func = math.compile(this.expression);
    } catch(err){
      this.isValid = false;
      this.error = err;
    }
  }

  debug(){
    console.log('Number of values:', this.values.length);
    this.values.forEach((v, idx) => {
      if(v instanceof DiceValue){
        console.log(`${v.name}: roll`);
      } else if(v instanceof Value){
        console.log(`${v.name}: ${v.value}`);
      } else {
        console.log(`$${idx}: unknown`);
      }
    });
    console.log('Compiled expression:', this.expression);
  }

  static parse(expression) {
    const result = new DiceExpression(expression);
    const exp = new StringInspector(expression.trim());
    let match = [];
  
    while(exp.hasNext && match){
      exp.skipWhitespace();
  
      //check for dice rolls
      match = exp.nextWith(rollExpression);
      if(match){
        result.addValue(new DiceValue(match[1], match[2], match[3]));
        continue;
      }
  
      //check for constants
      match = exp.nextWith(constantExpression);
      if(match){
        result.addValue(new Value(match[1]));
        continue;
      }
  
      //check for operands
      match = exp.nextWith(operandExpression);
      if(match){
        result.addOperator(match[1]);
      }
    }
  
    const label = exp.remainder.trim();
    if(label){
      result.label = label;
    }
  
    result.build();
    result.debug();

    return result;
  }
}


let testExpression = DiceExpression.parse('d4+ 1d8 + (2 + 28d45k4 + -1) for great justice');

module.exports = DiceExpression;