const Value = require('./Value');
const RollOptions = require('./RollOptions');
const rollFunctions = require('./rollFunctions');
const utils = require('./utils');

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
      val.value = utils.trimRolls(validRolls, 0, validRolls.length - val.options.drop);
    } else {
      //drop lowest
      val.value = utils.trimRolls(validRolls, val.options.drop);
    }
  } else if(val.options.keep){
    if(val.options.lowestRolls){
      //keep lowest
      val.value = utils.trimRolls(validRolls, 0, val.options.keep);
    } else {
      //keep highest
      val.value = utils.trimRolls(validRolls, validRolls.length - val.options.keep);
    }
  } else {
    //no drop/keep, sum all
    val.value = utils.sumRolls(validRolls);
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
      if(utils.isNumeric(this.faces)){
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

module.exports = DiceValue;