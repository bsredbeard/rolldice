import DiceExpression from './DiceExpression';
import SpecialFunctions from './SpecialFunctions';

const inputProperty = Symbol('DiceRoll.input');
const resultProperty = Symbol('DiceRoll.result');
const expressionProperty = Symbol('DiceRoll.expression');

export default class DiceRoll {
  /**
   * Create a new DiceRoll
   * @constructs DiceRoll
   * @param {string} input - the request string 
   * @param {object} options - the options object
   * @param {boolean} options.detailed - if you want the detailed roll output
   */
  constructor(input, options){
    if(!options) options = {};
    this[inputProperty] = input;
    const isSpecial = SpecialFunctions.getSpecial(input);
    if(isSpecial){
      this[resultProperty] = isSpecial;
    } else {

      const expression = new DiceExpression(input);
      this[expressionProperty] = expression;

      if(expression.isValid){
        expression.execute();
        if(expression.isValid){
          if(options.detailed){
            this[resultProperty] = expression.toDetails();
          } else {
            this[resultProperty] = expression.toString();
          }
        } else {
          this[resultProperty] = expression.error;
        }
      } else {
        this[resultProperty] = expression.error;
      }
    }
  }

  /**
   * @member {string} input - the input string
   * @memberof DiceRoll
   * @instance
   * @readonly
   */
  get input() { return this[inputProperty]; }

  /**
   * @member {string} result - the result of any dicerolls
   * @memberof DiceRoll
   * @instance
   * @readonly
   */
  get result() { return this[resultProperty]; }

  /**
   * @member {DiceExpression} expression - if not null, the dice expression that was parsed
   * @memberof DiceRoll
   * @instance
   * @readonly
   */
  get expression () { return this[expressionProperty]; }

  /**
   * Get the result string of this DiceRoll
   * @memberof DiceRoll
   * @instance
   */
  toString(){
    return this.result;
  }
}