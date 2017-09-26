import './RawRoll';

/**
 * Internal utilities used by various functions in the library
 * @module internal/utils
 */

/**
 * Sort function for an array of RawRoll objects
 * @param {RawRoll} a 
 * @param {RawRoll} b 
 * @returns {number}
 * @memberof module:internal/utils
 */
export const rollSort = (a, b) => {
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
 * @returns {number}
 * @memberof module:internal/utils
 */
export const sumRolls = (rolls) => {
  return rolls.map(r => r.value)
    .reduce((sum, v) => sum + v, 0);
};

/**
 * Trim a set of rolls based upon its start and end indices, then sum the values
 * @param {RawRoll[]} rolls - the array of rolls
 * @param {number} start - the start index (included)
 * @param {number} end - the end index (excluded)
 * @returns {RawRoll[]}
 * @memberof module:internal/utils
 */
export const trimRolls = (rolls, start, end) => {
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
 * @memberof module:internal/utils
 */
export const isNumeric = (str) => {
  return numericTest.test(str);
};