// Description:
//   Roll some custom dice, supports multiple rolls, multiple dice, constants
//   and certain roll modifiers, such as "[k]eep x highest rolls & reroll rest"
//
// Commands:
//   !roll - roll 1d6
//   !roll [your dice] - roll some dice, e.g. 3d10k1+d6-3
//
// Notes:
//   It probably has errors somewhere. You are welcome to fix them.
//
// Author:
//   github.com/mentalspike


/* eslint-env node */
/* eslint strict:"off" */
'use strict';

/**
 * The data structure containing the parsed syntax, result data, etc. regarding a roll string
 */
function SyntaxTree(){
  this.label = null;
  this.operations = [];
  this.isProcessed = false;
  this.isValid = false;
  this.results = {
    total: null,
    rolls: []
  };
  
  //bind in functions so they don't get messed up
  this.validate = validateSyntaxTree.bind(this);
  this.process = processSyntaxTree.bind(this);
  this.humanReadable = humanReadableRolls.bind(this);
  this.toString = syntaxTreeToString.bind(this);
}

/**
 * The result of a roll
 */
function RollResult(rollResults, numberOfDice, faces, keep){
  this.rolls = rollResults;
  this.total = this.rolls.reduce(function(a,b){ return a + b});
  this.numberOfDice = numberOfDice;
  this.faces = faces;
  this.keep = keep ? keep : false;
  
  this.toString = function(){
    return '' + this.numberOfDice + 'd' + this.faces + (this.keep ? 'k' + this.keep : '') + '(' + this.total + ')';
  }
}

/**
 * An operator to combine two rolls/constants
 */
function OperatorResult(title, delegate){
  this.title = title;
  this.delegate = delegate;
  
  this.toString = function(){
    return this.title;
  }
}

/**
 * A constant number to modify a roll total
 */
function ConstantResult(val){
  this.total = val;
  this.toString = function(){
    return '' + this.total;
  };
}

/**
 * Performs a roll for the given number of faces on the die
 */
function doRoll(diceFaces){
  var entropy = new Date().getTime() % 10;
  while(entropy > 0){
    entropy--;
    Math.random();
  }
  return Math.ceil(Math.random() * diceFaces);
}

/**
 * Ensures the syntax tree is valid after parsing
 */
function validateSyntaxTree(){
  var hasOperations = this.operations.length > 0;
  var hasAtLeastOneRoll = false;
  var doesNotStartWithOperator = true;
  var doesNotEndWithOperator = true;
  var noInvalid = true;
  for(var jk = 0; jk < this.operations.length; jk++){
    var op = this.operations[jk];
    
    if(jk === 0 && op.nodeType === 'operator'){
      doesNotStartWithOperator = false;
    }
    if(jk === this.operations.length - 1 && op.nodeType === 'operator'){
      doesNotEndWithOperator = false;
    }
    if(op.nodeType === 'roll'){
      hasAtLeastOneRoll = true;
    }
    if(op.invalid){
      noInvalid = false;
    }
  }
  this.isValid = hasOperations && hasAtLeastOneRoll && doesNotStartWithOperator && doesNotEndWithOperator && noInvalid;
  return this.isValid;
}

/**
 * Iterates through the parsed syntax tree and processes each node
 */
function processSyntaxTree(){
  var results = [];
  
  if(this.isValid){
    for(var opIndex in this.operations){
      var op = this.operations[opIndex];
      switch(op.nodeType){
        case 'roll':
          var rollResults = [];
          for(var jk=0; jk < op.numberOfDice; jk++){
            rollResults.push(doRoll(op.faces));
          }
          if(op.keep){
            rollResults.sort();
            rollResults.length = op.keep;
            for(var jk=0; jk < op.numberOfDice - op.keep; jk++){
              rollResults.push(doRoll(op.faces));
            }
          }
          rollResults.sort();
          results.push(new RollResult(rollResults, op.numberOfDice, op.faces, op.keep));
          break;
        case 'operator':
          if(op.operator === '+'){
            results.push(new OperatorResult('+', function(left, right){
              return left + right;
            }));
          } else if(op.operator === '-'){
            results.push(new OperatorResult('-', function(left, right){
              return left - right;
            }));
          }
          break;
        case 'constant':
          results.push(new ConstantResult(op.value));
          break;
      }
    }
    this.results.rolls = results;
    
    var currentTotal = 0;
    var operatorBuffer = null;
    
    for(var rIndex in results){
      var r = results[rIndex];
      if(r instanceof OperatorResult){
        if(operatorBuffer === null){
          operatorBuffer = r;
        } else {
          throw new Error('Pre-existing operator');
        }
      } else {
        if(operatorBuffer){
          currentTotal = operatorBuffer.delegate(currentTotal, r.total);
          operatorBuffer = null;
        } else {
          currentTotal = r.total;
        }
      }
    }
    
    this.results.total = currentTotal;
    this.isProcessed = true;
  }
}

/**
 * Processes each roll result into a human readable format
 */
function humanReadableRolls(){
  return this.results.rolls
    .map(function(r){ return r.toString(); })
    .join(' ');
}

/**
 * toString method for the SyntaxTree
 */
function syntaxTreeToString(){
  if(this.isValid && this.isProcessed){
    var items = ['Total:', this.results.total, this.label, 'rolls:', this.humanReadable()]
      .filter(function(x){ return !!x; });
    return items.join(' ');
  }
  return 'Invalid dice roll.';
}



/**
 * Performs processing on an individual roll's worth of regex data
 */
function parseRoll(numberOfDice, diceFaces, modifier, modifierValue){
  var result = { nodeType: 'roll' },
    rollString = '',
    errors = [];
  
  //check for multiple dice
  result.numberOfDice = parseInt(numberOfDice, 10);
  if(isNaN(result.numberOfDice)) {
    result.numberOfDice = 1;
  }
  rollString += result.numberOfDice;
  
  //parse the number of faces on the dice
  result.faces = parseInt(diceFaces, 10);
  if(isNaN(result.faces)){
    errors.push('Invalid number of dice faces: ' + diceFaces);
  } else {
    rollString += 'd' + result.faces;
  }
  
  //check for a modifier
  if(modifier){
    switch(modifier){
      case 'k':
      case 'K':
        //k - keep the highest X dice rolls
        result.keep = parseInt(modifierValue, 10);
        if(isNaN(result.keep)){
          errors.push('Invalid [k]eep modifier: ' + modifierValue);
          delete result.keep;
        } else {
          if(result.keep >= result.numberOfDice){
            errors.push('Invalid [k]eep modifier, cannot match or exceed the number of dice rolled');
          } else {
            rollString += 'k' + result.keep;
          }
        }
        break;
    }
  }
  
  if(errors.length){
    result.invalid = true;
    result.errors = errors;
  }
  
  return result;
}

/**
 * Consumes the first [matchLength] characters off of [str]
 */
function truncateMatch(matchLength, str){
  if(str){
    if(matchLength < str.length){
      return str.substr(matchLength);
    }
  }
  return null;
}

/**
 * Parses the whole roll
 */
function parseRollQuery(roll){
  var result = new SyntaxTree();
  if(roll){
    var rollTest = /^\s*([+-])?\s*([1-9][0-9]*)?d([1-9][0-9]*)(?:([k])([1-9][0-9]*))?/i;
    var testString = roll;
    while(testString){
      var match = rollTest.exec(testString);
      if(match){
        if(match[1]){
          result.operations.push({nodeType:'operator', operator: match[1]});
        }
        var thisRoll = parseRoll(match[2], match[3], match[4], match[5]);
        result.operations.push(thisRoll);
        testString = truncateMatch(match[0].length, testString);
      } else {
        //test for constants
        var constantTest = /^\s*([+-])\s*([1-9][0-9]*)/;
        var constantResult = constantTest.exec(testString);
        if(constantResult){
          var op = { nodeType:'operator', operator: constantResult[1] };
          var cVal = parseInt(constantResult[2], 10);
          //this shouldn't be possible, but check for it anyway
          if(isNaN(cVal)) {
            result.operations.push({
              nodeType: 'constant',
              invalid: true,
              errors: [ 'Invalid constant value: ' + constantResult[2] ]
            });
          } else {
            result.operations.push(op);
            result.operations.push({nodeType: 'constant', value: cVal });
          }
          testString = truncateMatch(constantResult[0].length, testString);
        }
        
        var labelTest = /for\s+(.*)/;
        var labelResult = labelTest.exec(testString);
        if(labelResult){
          result.label = labelResult[1];
        }
        
        testString = null;
      }
    }
  }
  return result;
}


/**
 * Execute a dice roll from a given dice roll string
 */
function execute(rollToParse){
  var syntaxTree = parseRollQuery(rollToParse);
  if(syntaxTree.validate()){
    syntaxTree.process();
  }
  return syntaxTree;
}

module.exports = function(robot){
  robot.hear(/!roll$/i, function(msg){
    var diceRoll = execute('d6');
    msg.reply(diceRoll.toString());
  });
  robot.hear(/!roll\s+(.+)/i, function(msg){
    var rollString = msg.match[1];
    var diceRoll = execute(rollString);
    msg.reply(diceRoll.toString());
  })
};
