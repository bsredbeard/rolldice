var RollOptions = require('./RollOptions');

/**
 * Iterates through a number of random outputs to make random a little less predictable
 */
function primeRandomizer(){
  var primer = new Date().getTime() % 10;
  for(var jk = 0; jk < primer; jk++){
    Math.random();
  }
}

/**
 * A hash of special dice functions that will do special rolling mechanics
 */
var specialDiceTypes = {
  'f': function () {
    var sides = [-1, 0, 1];
    var choice = Math.floor(Math.random() * sides.length);
    return sides[choice];
  }
};

/**
 * Executes a single roll and returns the result of it
 * @param {(number|string)} numberOfFaces 
 */
function roll(numberOfFaces){
  primeRandomizer();

  if (specialDiceTypes.hasOwnProperty(numberOfFaces)) {
    return specialDiceTypes[numberOfFaces]();
  }

  return Math.ceil(numberOfFaces * Math.random());
}

/**
 * Executes a dice roll, inspecting each roll against modifiers,
 * and deciding whether to keep or discard it.
 */
function execute(){
  var d, currentRolls = [];
  if(this.isValid){
    while(currentRolls.length < this.numberOfDice){
      d = roll(this.numberOfFaces);
      this.results.raw.push(d);
      if(!this.rollOptions.needReroll(d)){
        currentRolls.push(d);
      }
    }
    if(this.rollOptions.keep){
      currentRolls.sort();
      var desiredLength = this.rollOptions.keep;
      if(this.rollOptions.lowestRolls){
        currentRolls = currentRolls.slice(0, desiredLength);
      } else {
        currentRolls = currentRolls.slice(currentRolls.length - desiredLength);
      }
    }
    if(this.rollOptions.drop){
      currentRolls.sort();
      var amtToDrop = this.rollOptions.drop;
      if(this.rollOptions.lowestRolls){
        currentRolls = currentRolls.slice(amtToDrop);
      } else {
        currentRolls = currentRolls.slice(0, currentRolls.length - amtToDrop);
      }
    }
    this.results.kept = currentRolls;
    this.results.total = currentRolls.reduce(function(a, b){
      return a + b;
    }, 0);
  }
}

function toString(){
  var niceTryPartner = this.niceTry ? '(nice try)' : '';
  return niceTryPartner + this.numberOfDice + 'd' + this.numberOfFaces + this.rollOptions.toString() + '(' + this.results.total + '=' + this.results.kept.join('+') + ')';
}

/**
 * @typedef RollResult
 * @prop {number[]} raw - all rolls that were made as part of this roll
 * @prop {number[]} kept - only the rolls that were kept based on the keep / drop rules
 * @prop {number} total - the total for this group of dice rolls
 */

/**
 * Represents a diceroll that was identified within the syntax
 * @class
 * @param {number} numDice - the number of dice being rolled here
 * @param {(number|string)} numFaces - the type of dice that was requested
 * @param {string} options - the options syntax for modifying this roll
 */
function DiceRoll(numDice, numFaces, options){
  if(!numDice) numDice = '1';
  /**
   * @member {(number|string)} - the number of dice faces to roll, or a function that will perform the roll
   */
  this.numberOfDice = parseInt(numDice, 10);
  if (specialDiceTypes.hasOwnProperty(numFaces)){
    this.numberOfFaces = numFaces;
  } else {
    this.numberOfFaces = parseInt(numFaces, 10);
  }
  /**
   * @member {RollOptions} rollOptions - the parsed options for this roll
   */
  this.rollOptions = new RollOptions(options);
  /**
   * @member {RollResult} results - the results of this roll
   */
  this.results = {
    raw: [],
    kept: [],
    total: 0
  };
  /**
   * @member {boolean} niceTry - this roll was skipped because someone requested a silly number of dice
   */
  this.niceTry = false;
  
  if(this.numberOfDice > 1000){
    this.numberOfDice = 1000;
    this.niceTry = true;
  }

  var numFacesAcceptable = (!isNaN(this.numberOfFaces) && this.numberOfFaces > 1) ||
                           specialDiceTypes.hasOwnProperty(this.numberOfFaces);
  
  /**
   * @member {boolean} isValid - true if this has been determined to be a valid dice roll
   */
  this.isValid = !isNaN(this.numberOfDice)
    && numFacesAcceptable
    && this.rollOptions.isValid
    && this.numberOfDice > 0;
  
  /**
   * Executes the dice rolls in this object
   * @func execute
   */
  this.execute = execute.bind(this);

  /**
   * Returns a string notation of this dice roll result
   * @func toString
   */
  this.toString = toString.bind(this);
}

module.exports = DiceRoll;