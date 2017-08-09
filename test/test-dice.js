/* global describe, it */
'use strict';
var chai = require('chai');
var expect = chai.expect;
var Dice = require('../index');
var roll = null;

describe('rolldice', function(){
  it('should not attempt an invalid roll', function(){
    roll = new Dice('something');
    expect(roll.isValid).to.equal(false);
  });
  
  it('should respond to valid complex rolls', function(){
    roll = new Dice('4d6k2 + 3d10-8');
    expect(roll.isValid).to.equal(true);
    expect(roll.result).to.be.greaterThan(0);
    expect(roll.details).to.match(/4d6k2\(\d+=\d\+\d\) \+ 3d10\(\d+=(?:\d+\+?){3,3}\) - 8/);
  });
  
  it('should not appreciate the abstract humor of Rick Astley popping up everywhere', function(){
    roll = new Dice('rick');
    expect(roll.toString()).to.equal('No.');
  });
  
  it('should help you out with some syntax', function(){
    roll = new Dice('help').toString();
    expect(roll).to.be.a('string')
      .and.to.satisfy(function(syntax){
        return syntax.indexOf('Supports standard dice notation') === 0; 
      });
    roll = new Dice('syntax').toString();
    expect(roll).to.be.a('string')
      .and.to.satisfy(function(syntax){
        return syntax.indexOf('Supports standard dice notation') === 0; 
      });
  });
});
