'use strict';

var math = require('mathjs');

const whitespace = ' \t\r\n';

class StringInspector{
  /**
   * Create a new string inspector
   * @param {string} str - the input string
   */
  constructor(str){
    if(typeof str !== 'string'){
      str = '';
    }
    this.str = str.split('');
    this.position = 0;
  }
  /**
   * @member {boolean} hasNext - if the inspector still has characters in the bin
   */
  get hasNext(){
    return this.position < this.str.length;
  }

  get remainder(){
    return this.str.slice(this.position).join('');
  }
  /**
   * Get the next character
   * @returns {(string|boolean)} - returns the next character, or false if there is none
   */
  next(){
    if(this.hasNext){
      return this.str[this.position++];
    } else {
      return false;
    }
  }
  /**
   * Gets characters as long as the predicate returns true
   * @param {Function} predicate - a function to inspect each character and return true if it should be captured
   */
  nextWhile(predicate){
    return this.nextUntil(char => !predicate(char));
  }

  /**
   * Gets characters until the predicate returns true
   * @param {Function} predicate - a function to inspect each character and return true when capture should end
   */
  nextUntil(predicate){
    const results = [];
    
    let keepGoing = false;
    do{
      keepGoing = false;
      if(this.hasNext){
        const tmp = this.str[this.position];
        if(!predicate(tmp)){
          results.push(tmp);
          this.position++;
          keepGoing = true;
        }
      }
    } while(keepGoing);
    
    return results.join('');
  }

  /**
   * Tries to match the expression starting at the current position and returns
   * the match set if anything is found. Recommend using only ^ anchored expressions
   * @param {RegExp} expression - the regex to find in the remaining string
   * @returns {ArrayLike} - a regexp result, or null of nothing was found
   */
  nextWith(expression){
    const result = expression.exec(this.str.slice(this.position).join(''));
    if(result){
      this.position += (result.index + result[0].length);
    }
    return result;
  }

  /**
   * Skip all whitespace currently at the cursor
   */
  skipWhitespace(){
    this.nextWhile(x => whitespace.indexOf(x) >= 0);
  }

  /**
   * Peek at a character (or characters) without advancing the position
   * @param {number=} distance - the number of characters to peek at
   */
  peek(distance){
    if(!distance){
      distance = 1;
    }
    return this.str.slice(this.position, this.position + distance).join('');
  }

  toString(){
    return this.str.join('');
  }
}

/**
 * A value that can be used to export values to the math scope object
 */
class Value{
  /**
   * Create a new value object
   * @constructs Value
   * @param {string} val - the raw value to set
   */
  constructor(val) {
    /** @member {string} name - the arithmetic name of this value */
    this.name = '';
    /** @member {string} error - the error encountered while handling this value */
    this.error = null;
    /** @member {value} number - the final value of this object */
    this.value = parseInt(val, 10);
    if(isNaN(this.value)){
      this.value = 0;
      this.error = `Specified value, ${val}, is not a number.`;
    }
  }

  /** @member {boolean} isValid - if true, this value is a valid entry */
  get isValid() { return this.error == null; }

  get notation() { return '' + this.value; }

  /**
   * Transfer this Value object's value onto the mathjs scope object
   * @param {*} target - an object with keys for each dice value upon which to set this object's value
   * @returns {object} - the object that was passed in, populated with this object's values
   */
  transfer(target){
    if(!target) target = {};
    if(!this.name) throw new Error('Value\'s name property must be set to transfer a value.');
    target[this.name] = this.value;
    return target;
  }

  /**
   * Get a string representation of this value
   * @returns {string}
   */
  toString(){
    return this.notation;
  }

  toDetails(){
    return '(constant) ' + this.value;
  }
}

const props = Object.freeze({
  original: Symbol('property:original'),
  isValid: Symbol('property:isValid'),
  error: Symbol('property:error'),
  keep: Symbol('property:keep'),
  drop: Symbol('property:drop'),
  highestRolls: Symbol('property:highestRolls'),
  lowestRolls: Symbol('property:lowestRolls'),
  explodingRolls: Symbol('property:explodingRolls'),
  reroll: Symbol('property:reroll')
});

// the characters that denote the start of a roll option
const commandCharacters = '!kdr';
// the regex that can parse a keep or drop command argument
const keepDropArguments = /^([hl]?)([0-9]+)/i;
// the regex that can parse a reroll argument
const rerollArguments = /^([<>]?=?)(\d+)/;

const isCommandChar = c => c && commandCharacters.indexOf(c) >= 0;

const simpleReroll = match => {
  return num => num === match;
};

const comparisonReroll = (match, operator, orEquals) => {
  if(operator === '>'){
    if(orEquals){
      return num => num >= match;
    } else {
      return num => num > match;
    }
  } else if(operator === '<'){
    if(orEquals){
      return num => num <= match;
    } else {
      return num => num < match;
    }
  } else {
    return () => false;
  }
};

/**
 * Parse the options for the roll options object
 * @param {RollOptions} ro
 * @param {StringInspector} options 
 */
const parseOptions = (ro, options) => {
  while(ro[props.isValid] && options.hasNext){
    const discard = options.nextUntil(isCommandChar);
    if(discard.trim()){
      throw new Error('Discarded information found in RollOptions: ' + discard);
    }
    const cmd = options.next();
    if(cmd !== false){
      switch(cmd){
        case '!':
          ro[props.explodingRolls] = true;
          break;
        case 'k':
          const keepArgs = options.nextWith(keepDropArguments);
          if(keepArgs){
            if(ro[props.drop]){
              ro[props.isValid] = false;
              ro[props.error] = 'Cannot enable both "keep" and "drop" options simultaneously.';
            } else {
              if(keepArgs[1] === 'l' || keepArgs[1] === 'L'){
                ro[props.lowestRolls] = true;
                ro[props.highestRolls] = false;
              } else {
                ro[props.highestRolls] = true;
                ro[props.lowestRolls] = false;
              }
              ro[props.keep] = parseInt(keepArgs[2], 10);
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (k)eep modifier, e.g. k3, kl2, kh2';
          }
          break;
        case 'd':
          const dropArgs = options.nextWith(keepDropArguments);
          if(dropArgs){
            if(ro[props.keep]){
              ro[props.isValid] = false;
              ro[props.error] = 'Cannot enable both "keep" and "drop" options simultaneously.';
            } else {
              if(dropArgs[1] === 'h' || dropArgs[1] === 'H'){
                ro[props.highestRolls] = true;
                ro[props.lowestRolls] = false;
              } else {
                ro[props.lowestRolls] = true;
                ro[props.highestRolls] = false;
              }
              ro[props.drop] = parseInt(dropArgs[2], 10);
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (d)rop modifier, e.g. d3, dl2, dh3';
          }
          break;
        case 'r':
          const rerollArgs = options.nextWith(rerollArguments);
          if(rerollArgs){
            const target = parseInt(rerollArgs[2], 10);
            if(isNaN(target)){
              ro[props.isValid] = false;
              ro[props.error] = 'You must supply a number for reroll options';
            } else {
              if(rerollArgs[1].length){
                const operator = rerollArgs[1][0];
                const orEquals = rerollArgs[1].length > 1;
                ro.reroll.push(comparisonReroll(target, operator, orEquals));
              } else {
                //simple match reroll
                ro.reroll.push(simpleReroll(target));
              }
            }
          } else {
            ro[props.isValid] = false;
            ro[props.error] = 'You must specify valid options for the (r)eroll modifier, e.g. r1, r<5, r>=10';
          }
          break;
      }
    }
  }
};

/**
 * An object to parse and represent the options for a particular roll
 */
class RollOptions {
  /**
   * Create a new set of roll options
   * @param {string} options 
   * @constructs RollOptions
   */
  constructor(options){
    this[props.original] = options;
    this[props.isValid] = true;
    this[props.error] = '';
    this[props.keep] = false;
    this[props.drop] = false;
    this[props.highestRolls] = false;
    this[props.lowestRolls] = false;
    this[props.explodingRolls] = false;
    this[props.reroll] = [];

    parseOptions(this, new StringInspector(options));
  }
  /** @member {boolean} isValid - if true, the roll options are valid */
  get isValid() { return this[props.isValid]; }
  /** @member {string} error - if truthy, the error that was encountered while parsing the options */
  get error() { return this[props.error]; }
  /** @member {(number|boolean)} keep - if true-ish, keep only that number of dice rolls from the roll set  */
  get keep() { return this[props.keep]; }
  /** @member {(number|boolean)} drop - if true-ish, drop that number of dice rolls from the roll set  */
  get drop() { return this[props.drop]; }
  /** @member {boolean} highestRolls - if true, keep/drop applies to the highest rolls */
  get highestRolls() { return this[props.highestRolls]; }
  /** @member {boolean} lowestRolls - if true, keep/drop applies to the lowest rolls */
  get lowestRolls() { return this[props.lowestRolls]; }
  /** @member {boolean} explodingRolls - if true, max value rolls should be rolled an additional time */
  get explodingRolls() { return this[props.explodingRolls]; }
  /** @member {Array} reroll - the collection of reroll callbacks */
  get reroll() { return this[props.reroll]; }

  /**
   * Check a roll to see if it needs to be rerolled
   * @param {number} num - the roll value to check for needs to reroll
   */
  needReroll(num){
    for(const rule of this.reroll){
      if(rule(num)){
        return true;
      }
    }
    return false;
  }

  toString(){
    return this[props.original];
  }

  /**
   * Try to get all possible options from a string inspector
   * @param {StringInspector} parser 
   * @returns {string} the resulting options string
   */
  static findOptions(parser) {
    const options = [];
    while(isCommandChar(parser.peek())){
      const letter = parser.next();
      options.push(letter);
      switch(letter){
        case 'k':
        case 'd':
          const kdArgs = parser.nextWith(keepDropArguments);
          if(kdArgs){
            options.push(kdArgs[0]);
          }
          break;
        case 'r':
          const rArgs = parser.nextWith(rerollArguments);
          if(rArgs){
            options.push(rArgs[0]);
          }
          break;
      }
    }
    return options.join('');
  }
}

/**
 * Represents a singlar dice roll
 * @class
 */
class RawRoll{
  /**
   * Create a new raw roll
   * @constructs RawRoll
   * @param {number} value - the value rolled
   */
  constructor(value, rerolled, dropped, exploded){
    /** @member {number} value - the value of the roll */
    this.value = value;
    /** @member {boolean} rerolled - if true, the die was rerolled */
    this.rerolled = !!rerolled;
    /** @member {boolean} dropped - if true, the die was dropped */
    this.dropped = !!dropped;
    /** @member {boolean} exploded - if true, the die exploded */
    this.exploded = !!exploded;
  }

  /**
   * Gets a string representation of the RawRoll
   * @returns {string}
   */
  toString(){
    const rr = this.rerolled ? '\u{1f503}' : '';
    const dr = this.dropped ? '\u2716' : '';
    const ex = this.exploded ? '!' : '';
    return `${this.value}${ex}${dr}${rr}`;
  }
}

const defaultRoll = (numFaces) => {
  return (options) => {
    const rollResult = math.randomInt(numFaces)+1;
    const rerolled = options.needReroll(rollResult);
    const exploded = (rollResult === numFaces && options.explodingRolls);
    return new RawRoll(rollResult, rerolled, false, exploded);
  }
};



// module.exports = defaultRoll;

const ROLL_RANGE = [-1, 0, 1];

const fudgeRoll = () => {
  return (options) => {
    const roll = math.pickRandom(ROLL_RANGE);
    const reroll = options.needReroll(roll);
    return new RawRoll(roll, reroll);
  }
};


// module.exports = fudgeRoll;

/**
 * A collection of dice rolling functions
 * @prop {Function} default - the default dice roller. Takes a number of sides and returns a callback that takes a RollOptions argument
 * @prop {Function} f - the fudge dice roller. Returns a callback that takes a RollOptions argument
 */
const rollFunctions = Object.freeze({
  default: defaultRoll,
  f: fudgeRoll
});


// module.exports = rollFunctions;

/**
 * Sort function for an array of RawRoll objects
 * @param {RawRoll} a 
 * @param {RawRoll} b 
 */
const rollSort = (a, b) => {
  if(a.value < b.value){
    return -1;
  } else if(a.value > b.value){
    return 1;
  } else {
    return 0;
  }
};

/**
 * Sum the values of a collection of rolls
 * @param {RawRoll[]} rolls 
 */
const sumRolls = (rolls) => {
  return rolls.map(r => r.value)
    .reduce((sum, v) => sum + v, 0);
};

/**
 * Trim a set of rolls based upon its start and end indices, then sum the values
 * @param {RawRoll[]} rolls - the array of rolls
 * @param {number} start - the start index (included)
 * @param {number} end - the end index (excluded)
 */
const trimRolls = (rolls, start, end) => {
  rolls.sort(rollSort);

  if(end == null){
    end = rolls.length;
  }
  [...rolls.slice(0,start), ...rolls.slice(end)]
    .forEach(x => x.dropped = true);

  return sumRolls(rolls.slice(start, end));
};

const numericTest = /[0-9.]/;
/**
 * Check if a string contains a number
 * @param {string} str 
 * @returns {boolean}
 */
const isNumeric = (str) => {
  return numericTest.test(str);
};

const MAX_REROLL = 50;
const basicRollPattern = /^(\d*)[dD](\d+|f)/;

/**
 * A function to process rolls
 * @callback rollFunction
 * @param {RollOptions} options - the options for this roll
 * @returns {RawRoll}
 */

/**
 * Do all the necessary rolls for this roll group
 * @param {DiceValue} val 
 * @param {rollFunction} roller 
 */
const doRolls = (val, roller) => {
  let rollCount = val.dice;
  let rerollCount = 0;
  for(let idx = 0; idx < rollCount; idx++){
    const result = roller(val.options);
    val.details.push(result);

    //if the roll explodes, increment the total roll count
    if(result.exploded){
      rollCount++;
    }
    //if the roll must be rerolled, increment rollcount and reroll count
    if(result.rerolled){
      if(rerollCount < MAX_REROLL){
        rollCount++;
        rerollCount++;
      } else {
        result.rerolled = false;
      }
    }
  }

  const validRolls = val.details.filter(x => !x.rerolled);

  if(val.options.drop){
    if(val.options.highestRolls){
      //drop highest
      val.value = trimRolls(validRolls, 0, validRolls.length - val.options.drop);
    } else {
      //drop lowest
      val.value = trimRolls(validRolls, val.options.drop);
    }
  } else if(val.options.keep){
    if(val.options.lowestRolls){
      //keep lowest
      val.value = trimRolls(validRolls, 0, val.options.keep);
    } else {
      //keep highest
      val.value = trimRolls(validRolls, validRolls.length - val.options.keep);
    }
  } else {
    //no drop/keep, sum all
    val.value = sumRolls(validRolls);
  }
};

/**
 * A value that represents a dice roll
 * @extends Value
 */
class DiceValue extends Value {
  /**
   * Create a new dice roll value
   * @constructs DiceValue
   * @param {string} dice - the number of dice being rolled
   * @param {string} faces - the number of faces on the dice
   * @param {string} options - the options for this rollset
   */
  constructor(dice, faces, options){
    super('0');
    /** @member {number} dice - the number of dice being rolled */
    this.dice = parseInt(dice || '1', 10);
    /** @member {(number|string)} faces - the type of dice being rolled */
    this.faces = faces;
    /** @member {RollOptions} options - the options for this dice roll */
    this.options = new RollOptions(options);
    /** @member {RawRoll[]} details - the detailed results of the roll */
    this.details = [];

    if(!this.dice || isNaN(this.dice) || this.dice < 1 || this.dice >= 1000){
      this.error = 'Invalid number of dice';
    } else {
      if(isNumeric(this.faces)){
        this.faces = parseInt(this.faces);
        if(this.faces < 2){
          this.error = 'You must have at least 2 faces to roll dice';
        }
      } else {
        if(!rollFunctions.hasOwnProperty(this.faces)){
          this.error = `Invalid dice type: ${this.faces}`;
        }
      }
    }


    if(this.isValid){
      if(this.options.isValid){
        // ensure the options are valid for this dice roll
        if(this.options.drop && this.options.drop >= this.dice){
          this.error = `Cannot drop ${this.options.drop} dice when only ${this.dice} are being rolled.`;
        }
        if(this.options.keep && this.options.keep > this.dice){
          this.error = `Cannot keep ${this.options.keep} dice when only ${this.dice} are being rolled.`;
        }
      } else {
        this.error = `Invalid options: ${this.options}`;
      }
    }

  }

  /**
   * Perform the dice rolls for this roll
   */
  roll(){
    if(this.isValid){
      if(typeof this.faces === 'string'){
        doRolls(this, rollFunctions[this.faces]());
      } else {
        doRolls(this, rollFunctions.default(this.faces));
      }
    }
  }

  /** @member {string} notation - the dice notation for this roll */
  get notation() {
    return `${this.dice}d${this.faces}${this.options}`;
  }

  /**
   * Get a string representation of this dice roll
   * @returns {string}
   */
  toString(){
    return `(${this.notation}) ${this.value}`;
  }

  /**
   * Get a detailed readout of the roll results
   * @returns {string}
   */
  toDetails(){
    const detailsString = this.details
      .map(detail => detail.toString())
      .join(',');
    return `(${this.notation}) [${detailsString}] = ${this.value}`;
  }

  /**
   * Try to find a dice roll in the provided StringInspector
   * @param {StringInspector} inspector 
   * @returns {DiceValue} or null of no roll was found
   */
  static findDiceRoll(inspector){
    const maybe = inspector.peek(10);
    if(basicRollPattern.test(maybe)){
      const match = inspector.nextWith(basicRollPattern);
      const numDice = match[1] || '1';
      const faces = match[2];
      const options = RollOptions.findOptions(inspector);
      return new DiceValue(numDice, faces, options);
    } else {
      return null;
    }
  }
}

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

const syntax = [
  'Supports standard dice notation, as well as some extended functionality.',
  'syntax: <roll>[<operator><roll><operator><roll>...][<operator><constant>]',
  'roll: [<number of dice>]d<number of sides>[<modifiers>]',
  '      default number of dice: 1',
  'number of sides: any integer, or f (for Fudge dice)',
  'operator: + or -',
  'constant: any integer',
  'modifiers:',
  '  ! - exploding dice, a maximum roll value causes recursive reroll and summation',
  '  d<number> - drop the lowest X rolls from this group',
  '  k<number> - keep the highest X rolls from this group',
  '  h - alter either d or k modifier to affect the highest rolls, e.g. dh3: drop the highest 3 rolls',
  '  l - alter either d or k modifier to affect the lowest rolls, e.g. kl2: keep the lowest 2 rolls',
  '  r - reroll based on certain rules',
  '    r4 - reroll all 4s',
  '    r<3 - reroll anything less than 3',
  '    r>=11 - reroll anything greater than or equal to 11',
  'modifiers can be combined, but d and k are mutually exclusive'
].join('\n');

const specialData = new Map();
specialData.set('barrel', 'Donkey Kong rolls a barrel down the ramp and crushes you. -1000pts');
specialData.set('rick', 'No.');
specialData.set('katamari', 'Na naaaaa, na na na na na na, na na Katamari Damacy....');
specialData.set('help', syntax);
specialData.set('syntax', syntax);

/**
 * Exposes an api to check for special responses
 */
class SpecialFunctions{
  /**
   * Check for a special response to a roll argument
   * @param {string} expression the roll expression to check against the special functions
   */
  getSpecial(expression){
    if(expression && specialData.has(expression)){
      return specialData.get(expression);
    }
    return null;
  }
}

var SpecialFunctions$1 = new SpecialFunctions();

const inputProperty = Symbol('DiceRoll.input');
const resultProperty = Symbol('DiceRoll.result');
const expressionProperty = Symbol('DiceRoll.expression');

/**
 * A DiceRoll request
 */
class DiceRoll {
  /**
   * Create a new DiceRoll
   * @param {string} input - the request string 
   * @param {object} options - the options object
   * @param {boolean} options.detailed - if you want the detailed roll output
   */
  constructor(input, options){
    if(!options) options = {};
    this[inputProperty] = input;
    const isSpecial = SpecialFunctions$1.getSpecial(input);
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

  /** @member {string} input - the input string */
  get input() { return this[inputProperty]; }

  /** @member {string} result - the result of any dicerolls */
  get result() { return this[resultProperty]; }

  /** @member {DiceExpression} expression - if not null, the dice expression that was parsed */
  get expression () { return this[expressionProperty]; }

  /**
   * Get the result string of this DiceRoll
   */
  toString(){
    return this.result;
  }
}

module.exports = DiceRoll;
