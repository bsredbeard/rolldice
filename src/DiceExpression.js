const math = require('mathjs');

const StringInspector = require('./StringInspector');
const Value = require('./Value');
const DiceValue = require('./DiceValue');

const constantExpression = /^(\d+)/;
const operandExpression = /^([+*/%^()-])/;

/**
 * Parse a DiceExpression's original expression string
 * @param {DiceExpression} result 
 */
const parse = (subject) => {
  const exp = new StringInspector(subject.original.trim());
  let match = [];

  while(exp.hasNext && match){
    exp.skipWhitespace();

    //check for dice rolls
    const roll = DiceValue.findDiceRoll(exp);
    if(roll){
      subject.addValue(roll);
      continue;
    }

    //check for constants
    match = exp.nextWith(constantExpression);
    if(match){
      subject.addValue(new Value(match[1]));
      continue;
    }

    //check for operands
    match = exp.nextWith(operandExpression);
    if(match){
      subject.addOperator(match[1]);
    }
  }

  const label = exp.remainder.trim();
  if(label){
    subject.label = label;
  }
};


/**
 * Represents a parsed set of dice roll inputs
 */
class DiceExpression {
  /**
   * Create a new DiceExpression, but you probably want .parse
   * @constructs DiceExpression
   * @param {string} original - the original string that will be parsed and prepared for execution.
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
    /** @member {string} notation - the expression with placeholders replaced by notation values */
    this.notation = '';
    /** @member {string} label - the specified label for the overall roll */
    this.label = '';
    /** @member {string} error - the error invalidating the dice expression */
    this.error = null;
    /** @member {number} result - the total of the dice rolls */
    this.result = 0;

    parse(this);

    if(this.values.length < 1){
      this.error = 'Invalid roll: No dice to roll. Try help';
    }
  }

  /** @member {boolean} isValid - if true, the expression is valid */
  get isValid() { return this.error == null; }

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
   * Update the notation field with a value's notation
   * @param {Value} value 
   */
  updateNotation(value) {
    this.notation = this.notation.replace(value.name, value.notation);
  }

  /**
   * build and execute this DiceExpression
   */
  execute(){
    if(this.isValid){
      this.expression = this.segments.join(' ');
      this.notation = this.expression;
      try{
        const func = math.compile(this.expression);

        if(this.values.every(x => x.isValid)){
          const scope = {};
          this.values.forEach(val => {
            if(val instanceof DiceValue){
              val.roll();
            }
            val.transfer(scope);
            this.updateNotation(val);
          });
          this.result = func.eval(scope);
        } else {
          const valueErrors = this.values.filter(x => !x.isValid)
            .join('\r\n');
          this.error = `Invalid values:\r\n${valueErrors}`;
        }
      } catch(err){
        this.error = err;
      }
    }
  }

  toString(){
    if(!this.isValid){
      return this.error;
    }
    return `Total: ${this.result}`;
  }

  toDetails(){
    if(!this.isValid){
      return this.error;
    }
    const lines = [];
    lines.push(`Total: ${this.result}`);
    lines.push(`Formula: ${this.notation}`);
    lines.push('Rolls:');
    this.values.forEach(v => {
      if(v instanceof DiceValue){
        lines.push(v.toDetails());
      }
    });
    return lines.join('\r\n');
  }
}

module.exports = DiceExpression;