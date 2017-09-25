var chai = require('chai');
var expect = chai.expect;
var Dice = require('../src');

describe('DiceRoll', function(){
  it('should not attempt an invalid roll', function(){
    const roll = new Dice('something');
    expect(roll.expression.isValid).to.equal(false);
    expect(roll.toString()).to.equal('Invalid roll: No dice to roll. Try help');
  });
  
  it('should respond to valid complex rolls', function(){
    const roll = new Dice('4d6k2 + 3d10-8', { detailed: true });
    expect(roll.expression.isValid).to.equal(true);
    expect(roll.expression.result).to.be.greaterThan(0);

    const lines = roll.toString().split('\r\n');
    
    expect(lines[0]).to.match(/^Total: \d+$/);
    expect(lines[1]).to.equal('Formula: 4d6k2 + 3d10 - 8');
    expect(lines[2]).to.equal('Rolls:');
    expect(lines[3]).to.match(/^\(4d6k2\) \[(\d[^,]*,?){4}\] = \d+$/);
    expect(lines[4]).to.match(/^\(3d10\) \[(\d{1,2},?){3}\] = \d+$/);
    
    expect(lines.length).to.equal(5);
  });
  
  it('should not appreciate the abstract humor of Rick Astley popping up everywhere', function(){
    const roll = new Dice('rick');
    expect(roll.toString()).to.equal('No.');
  });
  
  it('should help you out with some syntax', function(){
    const roll1 = new Dice('help').toString();
    expect(roll1).to.be.a('string')
      .and.to.satisfy(function(syntax){
        return syntax.indexOf('Supports standard dice notation') === 0; 
      });
    const roll2 = new Dice('syntax').toString();
    expect(roll2).to.be.a('string')
      .and.to.satisfy(function(syntax){
        return syntax.indexOf('Supports standard dice notation') === 0; 
      });
  });
});
