const whitespace = ' \t\r\n';

const strSymbol = Symbol('StringInspector.str');


export default class StringInspector{
  /**
   * Create a new string inspector
   * @param {string} str - the input string
   * @constructs StringInspector
   */
  constructor(str){
    if(typeof str !== 'string'){
      str = '';
    }
    this[strSymbol] = str;
    /**
     * @member {number} position - the current position in the string
     * @memberof StringInspector
     * @instance
     */
    this.position = 0;
  }
  
  /**
   * @member {string} str - the original value
   * @memberof StringInspector
   * @instance
   */
  get str() { return this[strSymbol]; }

  /**
   * @member {boolean} hasNext - if the inspector still has characters in the bin
   * @memberof StringInspector
   * @instance
   */
  get hasNext(){
    return this.position < this.str.length;
  }

  /**
   * @member {string} remainder - the remaining characters in the string
   * @instance
   * @memberof StringInspector
   */
  get remainder(){
    return this.str.substring(this.position);
  }

  /**
   * Get the next character
   * @memberof StringInspector
   * @instance
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
   * @memberof StringInspector
   * @instance
   * @param {Function} predicate - a function to inspect each character and return true if it should be captured
   * @returns {string} - the characters that were matched
   */
  nextWhile(predicate){
    return this.nextUntil(char => !predicate(char));
  }

  /**
   * Gets characters until the predicate returns true
   * @memberof StringInspector
   * @instance
   * @param {Function} predicate - a function to inspect each character and return true when capture should end
   * @returns {string} - the characters that occurred until the match
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
   * @memberof StringInspector
   * @instance
   * @param {RegExp} expression - the regex to find in the remaining string
   * @returns {ArrayLike} - a regexp result, or null of nothing was found
   */
  nextWith(expression){
    const result = expression.exec(this.str.substr(this.position));
    if(result){
      this.position += (result.index + result[0].length);
    }
    return result;
  }

  /**
   * Skip all whitespace currently at the cursor
   * @memberof StringInspector
   * @instance
   */
  skipWhitespace(){
    this.nextWhile(x => whitespace.indexOf(x) >= 0);
  }

  /**
   * Peek at a character (or characters) without advancing the position
   * @memberof StringInspector
   * @instance
   * @param {number=} distance - the number of characters to peek at
   * @returns {string}
   */
  peek(distance){
    if(!distance){
      distance = 1;
    }
    return this.str.substr(this.position, distance);
  }

  /**
   * Get the string that is represented by this inspector
   * @memberof StringInspector
   * @instance
   * @returns {string}
   */
  toString(){
    return this.str;
  }
}