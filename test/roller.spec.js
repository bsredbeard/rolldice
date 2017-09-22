/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const roller = require('../src/rollFunctions/roller');

describe('roller', function(){
  it('should produce an even distribution over 10000 rolls', function(){
    const targetPercentage = 0.05;
    const threshold = 0.015;
    const numRolls = 10000;
    const results = ['x',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    for(var idx = 0; idx < numRolls; idx++){
      results[roller(20)]++;
    }
    const analysis = results.filter(x => typeof x !== 'string')
      .map((count, idx) => ({ pct: count / numRolls, val: idx + 1}))
      .filter(x => x.pct < (targetPercentage - threshold) || x.pct > (targetPercentage + threshold));
    expect(analysis).to.be.empty;
  });
});