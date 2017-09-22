const RawRoll = require('./RawRoll');

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
}

/**
 * Sum the values of a collection of rolls
 * @param {RawRoll[]} rolls 
 */
const sumRolls = (rolls) => {
  return rolls.map(r => r.value)
    .reduce((sum, v) => sum + v, 0);
}

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
}

const numericTest = /[0-9\.]/;
const isNumeric = (str) => {
  return numericTest.test(str);
};

exports.rollSort = rollSort;
exports.sumRolls = sumRolls;
exports.trimRolls = trimRolls;
exports.isNumeric = isNumeric;