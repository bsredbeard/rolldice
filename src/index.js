const DiceExpression = require('./DiceExpression');
const SpecialFunctions = require('./SpecialFunctions');

const inputProperty = Symbol('DiceRoll.input');
const resultProperty = Symbol('DiceRoll.result');

class DiceRoll {
  constructor(input, options){
    if(!options) options = {};
    this[inputProperty] = input;
    const isSpecial = SpecialFunctions.getSpecial(input);
    if(isSpecial){
      this[resultProperty] = isSpecial;
    } else {
      const expression = new DiceExpression(input);
      if(expression.isValid){
        expression.execute();
      }
      if(expression.isValid){
        if(options.detailed){
          this[resultProperty] = `${expression.notation} = ${expression.toDetails()}`;
        } else {
          this[resultProperty] = expression.toString();
        }
      } else {
        this[resultProperty] = expression.error;
      }
    }
  }

  toString(){
    return this[resultProperty];
  }
}

module.exports = DiceRoll;