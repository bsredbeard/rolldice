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

module.exports = StringInspector;