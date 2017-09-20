const Value = require('./Value');
const RollOptions = require('./RollOptions');
const rollFunctions = require('./rollFunctions');

/**
 * Do all the necessary rolls for this roll group
 * @param {DiceValue} val 
 * @param {Function<RawRoll>} roller 
 */
const doRolls = (val, roller) => {
  let rollCount = val.dice;
  for(let idx = 0; idx < rollCount; idx++){
    const result = roller(val.options);
    val.details.push(result);

    //if either reroll or explode, increment the total roll count
    if(result.rerolled || result.exploded){
      rollCount++;
    }
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
    /** @member {string} dice - the number of dice being rolled */
    this.dice = dice || '1';
    /** @member {(number|string)} faces - the type of dice being rolled */
    this.faces = faces;
    /** @member {RollOptions} options - the options for this dice roll */
    this.options = new RollOptions(options);
    /** @member {RawRoll[]} details - the detailed results of the roll */
    this.details = [];

    if(this.options.isValid){
      const numFaces = parseInt(this.faces, 10);
      if(isNaN(numFaces)){
        if(!rollFunctions.hasOwnProperty(this.faces)){
          this.isValid = false;
        }
      } else {
        this.faces = numFaces;
        if(numFaces < 2){
          this.isValid = false;
        }
      }
    }
  }

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
    return `${this.toString()} [${detailsString}]`;
  }
}

module.exports = DiceValue;