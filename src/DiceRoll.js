var RollOptions = require('./RollOptions');

function roll(numberOfFaces){
  var primer = new Date().getTime() % 10;
  for(var jk = 0; jk < primer; jk++){
    Math.random();
  }
  return Math.ceil(numberOfFaces * Math.random());
}

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

function DiceRoll(numDice, numFaces, options){
  if(!numDice) numDice = '1';
  this.numberOfDice = parseInt(numDice, 10);
  this.numberOfFaces = parseInt(numFaces, 10);
  this.rollOptions = new RollOptions(options);
  this.results = {
    raw: [],
    kept: [],
    total: 0
  };
  this.niceTry = false;
  
  if(this.numberOfDice > 1000){
    this.numberOfDice = 1000;
    this.niceTry = true;
  }
  
  this.isValid = !isNaN(this.numberOfDice)
    && !isNaN(this.numberOfFaces)
    && this.rollOptions.isValid
    && this.numberOfFaces > 1
    && this.numberOfDice > 0;
    
  this.execute = execute.bind(this);
  this.toString = toString.bind(this);
}

module.exports = DiceRoll;