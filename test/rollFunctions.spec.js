/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const rollFunctions = require('../src/rollFunctions');
const RollOptions = require('../src/RollOptions');

describe('rollFunctions', function(){
  describe('~default', function(){
    it('should produce an even distribution over 10000 rolls', function(){
      const opts = new RollOptions('');
      const targetPercentage = 0.05;
      const threshold = 0.015;
      const numRolls = 10000;
      const results = ['x',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      for(var idx = 0; idx < numRolls; idx++){
        const x = rollFunctions.default(20)(opts);
        results[x.value]++;
      }
      const analysis = results.filter(x => typeof x !== 'string')
        .map((count, idx) => ({ pct: count / numRolls, val: idx + 1}))
        .filter(x => x.pct < (targetPercentage - threshold) || x.pct > (targetPercentage + threshold));
      expect(analysis, 'Bad results: ' + analysis.join(',')).to.be.empty;
    });
    it('should be able to mark rerolls', function(){
      const roller = rollFunctions.default(3);
      const options = new RollOptions('r1');
      var numSeen = 0;
      for(var idx = 0; idx < 1000; idx++){
        const result = roller(options);
        if(result.value === 1){
          expect(result.rerolled).to.be.true;
          numSeen++;
        } else {
          expect(result.rerolled).to.be.false;
        }
      }
      expect(numSeen).to.be.greaterThan(0);
    });
  });
  describe('~fudge', function(){
    it('should always produce a value of -1, 0, or 1', function(){
      const roller = rollFunctions.f();
      const options = new RollOptions('');
      for(var idx = 0; idx < 1000; idx++){
        const result = roller(options).value;
        expect(result).to.be.greaterThan(-2);
        expect(result).to.be.lessThan(2);
      }
    });
    it('should be able to mark rerolls', function(){
      const roller = rollFunctions.f();
      const options = new RollOptions('r0');
      var numSeen = 0;
      for(var idx = 0; idx < 1000; idx++){
        const result = roller(options);
        expect(result.value).to.be.greaterThan(-2);
        expect(result.value).to.be.lessThan(2);
        if(result.value === 0){
          expect(result.rerolled).to.be.true;
          numSeen++;
        } else {
          expect(result.rerolled).to.be.false;
        }
      }
      expect(numSeen).to.be.greaterThan(0);
    });
  });
});