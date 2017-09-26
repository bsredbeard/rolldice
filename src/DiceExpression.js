import * as math from 'mathjs';

import StringInspector from './StringInspector';
import Value from './Value';
import DiceValue from './DiceValue';

const constantExpression = /^(\d+)/;
const operandExpression = /^([+*/%^()-])/;

/**
 * Parse a DiceExpression's original expression string
 * @param {DiceExpression} result 
 * @private
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

export default class DiceExpression {
  /**
   * Create a new DiceExpression, but you probably want .parse
   * @constructs DiceExpression
   * @param {string} original - the original string that will be parsed and prepared for execution.
   */
  constructor(original){
    /**
     * @member {string} original - the original string parsed into this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.original = original;
    /**
     * @member {string[]} segments - the string segments of the mathematical expression parsed by this object
     * @memberof DiceExpression
     * @instance
     */
    this.segments = [];
    /**
     * @member {Value[]} values - the constant and dice roll values for this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.values = [];
    /**
     * @member {string} expression - the mathematical expression for this DiceExpression
     * @memberof DiceExpression
     * @instance
     */
    this.expression = '';
    /**
     * @member {string} notation - the expression with placeholders replaced by notation values
     * @memberof DiceExpression
     * @instance
     */
    this.notation = '';
    /**
     * @member {string} label - the specified label for the overall roll
     * @memberof DiceExpression
     * @instance
     */
    this.label = '';
    /**
     * @member {string} error - the error invalidating the dice expression
     * @memberof DiceExpression
     * @instance
     */
    this.error = null;
    /**
     * @member {number} result - the total of the dice rolls
     * @memberof DiceExpression
     * @instance
     */
    this.result = 0;

    parse(this);

    if(this.values.length < 1){
      this.error = 'Invalid roll: No dice to roll. Try help';
    }
  }

  /**
   * @member {boolean} isValid - if true, the expression is valid
   * @memberof DiceExpression
   * @instance
   * @readonly
   */
  get isValid() { return this.error == null; }

  /**
   * Add a value to the DiceExpression
   * @param {Value} x 
   * @memberof DiceExpression
   * @instance
   */
  addValue(x){
    x.name = '$' + this.values.length;
    this.values.push(x);
    this.segments.push(x.name);
  }

  /**
   * Add an operator to the expression
   * @param {string} x - the operator to add
   * @memberof DiceExpression
   * @instance
   */
  addOperator(x){
    this.segments.push(x);
  }

  /**
   * Update the notation field with a value's notation
   * @param {Value} value 
   * @memberof DiceExpression
   * @instance
   */
  updateNotation(value) {
    this.notation = this.notation.replace(value.name, value.notation);
  }

  /**
   * build and execute this DiceExpression
   * @memberof DiceExpression
   * @instance
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

  /**
   * Get a simple string representation of the DiceExpression
   * @memberof DiceExpression
   * @instance
   * @returns {string}
   */
  toString(){
    if(!this.isValid){
      return this.error;
    }
    const label = this.label ? ' ' + this.label : '';
    return `Total: ${this.result}${label}`;
  }

  /**
   * Get a detailed string representation of the DiceExpression and all rolls
   * @memberof DiceExpression
   * @instance
   * @returns {string}
   */
  toDetails(){
    if(!this.isValid){
      return this.error;
    }
    const lines = [];
    if(this.label){
      lines.push(this.label);
    }
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