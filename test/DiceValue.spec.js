/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const DiceValue = require('../src/DiceValue');
const StringInspector = require('../src/StringInspector');

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

  it('should be able to transfer result values onto a scope object', function(){
    const rolls = [
      { value: ['1', '6', 'r1' ], name: '$0', expected: (num) => num > 1 && num<=6 },
      { value: ['1', '20', 'r<10'], name: '$1', expected: (num) => num >= 10 && num <= 20 }
    ]
    const s = rolls.map(item => {
      const a = new DiceValue(...item.value);
      expect(a).to.be.an.instanceOf(DiceValue);
      expect(a.isValid).to.be.true;
      a.name = item.name;
      a.roll();
      expect(item.expected(a.value), `Invalid result for ${a.notation}`).to.be.true;
      return a;
    }).reduce((scope, roll) => {
      return roll.transfer(scope);
    }, null);

    rolls.forEach(item => {
      expect(s).to.have.property(item.name);
      expect(item.expected(s[item.name])).to.be.true;
    });
  });

  it('should find valid dice rolls at the current positon of an inspector', function(){
    [
      { roll: 'd5', position: 0, expected: ['1', '5', ''], next: false },
      { roll: 'd6k5', position: 0, expected: ['1', '6', 'k5'], next: false },
      { roll: '!', position: 0, expected: null, next: '!' },
      { roll: '5d20r1', position: 0, expected: ['5', '20', 'r1'], next: false },
      { roll: '20d2r<10', position: 0, expected: ['20', '2', 'r<10'], next: false },
      { roll: 'd1000r>=100', position: 0, expected: ['1', '1000', 'r>=100'], next: false },
      { roll: '2d6r1! ', position: 0, expected: ['2', '6', 'r1!'], next: ' '},
      { roll: 'blah', position: 0, expected: null, next: 'b' },
      { roll: '+', position: 0, expected: null, next: '+' },
      { roll: '-', position: 0, expected: null, next: '-' },
      { roll: '/', position: 0, expected: null, next: '/' },
      { roll: '*', position: 0, expected: null, next: '*' },
      { roll: '(', position: 0, expected: null, next: '(' },
      { roll: ')', position: 0, expected: null, next: ')' },
      { roll: ' k5r1!', position: 0, expected: null, next: ' '},
      { roll: ' 208d12k5r1!+', position: 1, expected: ['208', '12', 'k5r1!'], next: '+'},
      { roll: 'd6+d8-20', position: 0, expected: ['1','6',''], next: '+'}
    ].forEach(x => {
      const inspector = new StringInspector(x.roll);
      inspector.position = x.position;

      const roll = DiceValue.findDiceRoll(inspector);
      if(x.expected){
        expect(roll).to.exist;
        const expected = new DiceValue(...x.expected);
        expect(roll.dice).to.equal(expected.dice);
        expect(roll.faces).to.equal(expected.faces);
        expect(roll.options.toString()).to.equal(expected.options.toString());
      } else {
        expect(roll).to.be.null;
      }
      expect(inspector.next()).to.equal(x.next);
    });
  });
});