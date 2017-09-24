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
    /** @member {string} label - the specified label for the overall roll */
    this.label = '';
    /** @member {string} error - the error invalidating the dice expression */
    this.error = null;

    parse(this);
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
   * build and execute this DiceExpression
   */
  execute(){
    if(this.isValid){
      this.expression = this.segments.join(' ');
      try{
        const func = math.compile(this.expression);

        if(this.values.every(x => x.isValid)){
          const scope = {};
          this.values.forEach(val => {
            if(val instanceof DiceValue){
              val.roll();
            }
            val.transfer(scope);
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

  debug(){
    /* eslint-disable no-console */
    console.log('Notation:', this.original);
    console.log('isValid:', this.isValid, this.error);
    console.log('Number of values:', this.values.length);
    this.values.forEach((v, idx) => {
      if(v instanceof Value){
        console.log(`${v.name}: ${v.toDetails()}`);
      } else {
        console.log(`$${idx}: unknown`);
      }
    });
    console.log('Compiled expression:', this.expression);
    console.log('Result:', this.result);
    /* eslint-enable no-console */
  }
}


let testExpression = new DiceExpression('d4+ 1d8 + (2 + 28d45k4r<10 + -1) for great justice');
testExpression.execute();
testExpression.debug();

module.exports = DiceExpression;