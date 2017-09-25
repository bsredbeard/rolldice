import StringInspector from './StringInspector';

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
export default class RollOptions {
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
    this[props.reroll] = []

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