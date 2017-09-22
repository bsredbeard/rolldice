/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const DiceValue = require('../src/DiceValue');

describe('DiceValue', function(){
  it('should have an initial value of 0', function(){
    const a = new DiceValue('1', '6');
    expect(a.value).to.equal(0);
  });

  it('should be invalid if no options are passed', function(){
    const a = new DiceValue();
    expect(a).to.be.instanceof(DiceValue);
    expect(a.isValid).to.be.false;
    expect(a.error).to.equal('Invalid dice type: undefined');
  });

  it('should be invalid if 0 dice are to be rolled', function(){
    const a = new DiceValue('0', '6');
    expect(a).to.be.instanceof(DiceValue);
    expect(a.isValid).to.be.false;
    expect(a.error).to.equal('Invalid number of dice');
  });

  it('should be invalid if 1000 or more dice are to be rolled', function(){
    const a = new DiceValue('1000', '6');
    expect(a).to.be.instanceof(DiceValue);
    expect(a.isValid).to.be.false;
    expect(a.error).to.equal('Invalid number of dice');

    const b = new DiceValue('4321', '6');
    expect(b).to.be.instanceof(DiceValue);
    expect(b.isValid).to.be.false;
    expect(b.error).to.equal('Invalid number of dice');
  });

  it('should be invalid if the options are invalid', function(){
    const a = new DiceValue('1', '6', 'd1k1');
    expect(a.isValid).to.be.false;
    expect(a.error).to.equal('Invalid options: d1k1');
  });

  it('should be valid if at least 1 die of 2 sides is rolled', function(){
    const faceValues = [];
    while(faceValues.length < 400){
      faceValues.push({
        value: '' + (faceValues.length + 2),
        expected: faceValues.length + 2
      });
    }

    expect(faceValues.length).to.equal(400);

    faceValues.forEach(x => {
      const a = new DiceValue('1', x.value);
      expect(a.isValid, a.error).to.be.true;
      expect(a.dice).to.equal(1);
      expect(a.faces).to.equal(x.expected);
    });
  });

  it('should accept between 1 and 999 dice to be rolled', function(){
    const diceValues = [];
    while(diceValues.length < 999){
      diceValues.push({
        value: '' + (diceValues.length + 1),
        expected: diceValues.length + 1
      })
    }

    diceValues.forEach(x => {
      const a = new DiceValue(x.value, '6');
      expect(a.isValid, a.error).to.be.true;
      expect(a.dice).to.equal(x.expected);
      expect(a.faces).to.equal(6);
    });
  });

  it('should be valid for fudge dice', function(){
    const a= new DiceValue('1', 'f');
    expect(a.isValid, a.error).to.be.true;
    expect(a.faces).to.equal('f');
  });

  it('should return valid notation', function(){
    const a = new DiceValue('4', '6', 'd3!');
    expect(a.isValid, a.error).to.be.true;
    expect(a.notation).to.equal('4d6d3!');
  });

  it('should have an appropriate toString() output', function(){
    const a = new DiceValue('4', '6', 'd3!');
    expect(a.isValid, a.error).to.be.true;
    expect(a.toString()).to.equal('(4d6d3!) 0');
  });
});