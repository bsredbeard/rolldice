import { expect } from 'chai';
import RollOptions from '../src/RollOptions';
import StringInspector from '../src/StringInspector';

describe('RollOptions', function() {
  it('should accept an empty string', function(){
    const options = new RollOptions('');
    expect(options).to.be.instanceof(RollOptions);
    expect(options.isValid).to.be.true;
    expect(options.isValid).to.equal(true);
    expect(options.error).to.be.empty;
  });

  describe('~reroll', function(){
    it('should not have reroll if no reroll is specified', function(){
      const options = new RollOptions('');
      expect(options).to.be.instanceof(RollOptions);
      expect(options.isValid).to.be.true;
      expect(options.isValid).to.equal(true);
      expect(options.error).to.be.empty;
      expect(options.reroll.length).to.equal(0);
    });

    it('should work if needsReroll() is called with no reroll option', function(){
      const options = new RollOptions('');
      expect(options).to.be.instanceof(RollOptions);
      expect(options.isValid).to.be.true;
      expect(options.isValid).to.equal(true);
      expect(options.error).to.be.empty;
      expect(options.reroll.length).to.equal(0);
      expect(options.needReroll(14)).to.be.false;
    });

    it('should have an error for invalid reroll strings', function(){
      const options1 = new RollOptions('r');
      expect(options1.isValid).to.be.false;
      expect(options1.error).to.equal('You must specify valid options for the (r)eroll modifier, e.g. r1, r<5, r>=10');
  
      const options2 = new RollOptions('ra');
      expect(options2.isValid).to.be.false;
      expect(options2.error).to.equal('You must specify valid options for the (r)eroll modifier, e.g. r1, r<5, r>=10');
    });
  
    it('should accept a valid simple reroll', function(){
      const options = new RollOptions('r0');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(1);
      expect(options.needReroll(0)).to.be.true;
      expect(options.needReroll(1)).to.be.false;
    });
  
    it('should accept multiple valid simple rerolls', function(){
      const options = new RollOptions('r0r1');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(2);
      expect(options.needReroll(0)).to.be.true;
      expect(options.needReroll(1)).to.be.true;
      expect(options.needReroll(2)).to.be.false;
    });
  
    it('should accept a valid less-than range reroll', function(){
      const options = new RollOptions('r<4');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(1);
      expect(options.needReroll(2)).to.be.true;
      expect(options.needReroll(3)).to.be.true;
      expect(options.needReroll(4)).to.be.false;
      expect(options.needReroll(5)).to.be.false;
    });
  
    it('should accept a valid greater-than range reroll', function(){
      const options = new RollOptions('r>3');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(1);
      expect(options.needReroll(2)).to.be.false;
      expect(options.needReroll(3)).to.be.false;
      expect(options.needReroll(4)).to.be.true;
      expect(options.needReroll(5)).to.be.true;
    });
  
    it('should accept a valid less-than-or-equals range reroll', function(){
      const options = new RollOptions('r<=4');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(1);
      expect(options.needReroll(3)).to.be.true;
      expect(options.needReroll(4)).to.be.true;
      expect(options.needReroll(5)).to.be.false;
      expect(options.needReroll(6)).to.be.false;
    });
  
    it('should accept a valid greater-than-or-equals range reroll', function(){
      const options = new RollOptions('r>=3');
      expect(options.isValid).to.be.true;
      expect(options.reroll.length).to.equal(1);
      expect(options.needReroll(1)).to.be.false;
      expect(options.needReroll(2)).to.be.false;
      expect(options.needReroll(3)).to.be.true;
      expect(options.needReroll(4)).to.be.true;
    });
  });

  describe('~explodingRolls', function(){
    it('should not have exploding rolls on by default', function(){
      const options = new RollOptions('');
      expect(options.explodingRolls).to.be.false;
    });

    it('should have exploding rolls if specified', function(){
      const options1 = new RollOptions('!');
      expect(options1.explodingRolls).to.be.true;

      const options2 = new RollOptions('r3!');
      expect(options2.explodingRolls).to.be.true;

      const options3 = new RollOptions('!r3');
      expect(options3.explodingRolls).to.be.true;
    });
  });
  
  describe('~drop', function(){
    it('should not have drop options enabled by default', function(){
      const options = new  RollOptions('');
      expect(options.drop).to.be.false;
    });

    it('should have an error if no drop options are specified', function(){
      const options = new  RollOptions('d');
      expect(options.isValid).to.be.false;
      expect(options.error).to.equal('You must specify valid options for the (d)rop modifier, e.g. d3, dl2, dh3');
    });

    it('should have an error if drop options are invalid', function(){
      const options = new RollOptions('dxxx');
      expect(options.isValid).to.be.false;
      expect(options.error).to.equal('You must specify valid options for the (d)rop modifier, e.g. d3, dl2, dh3');
    });

    it('should default to dropping lowest dice', function(){
      const options = new RollOptions('d1');
      expect(options.isValid).to.be.true;
      expect(options.drop).to.equal(1);
      expect(options.lowestRolls).to.be.true;
      expect(options.highestRolls).to.be.false;
    });

    it('should allow any number of dice', function(){
      const options1 = new RollOptions('d2');
      expect(options1.isValid).to.be.true;
      expect(options1.drop).to.equal(2);
      
      const options2 = new RollOptions('d4');
      expect(options2.isValid).to.be.true;
      expect(options2.drop).to.equal(4);
    });

    it('should recognize the "highest rolls" modifier', function(){
      const options = new RollOptions('dh3');
      expect(options.isValid).to.be.true;
      expect(options.highestRolls).to.be.true;
      expect(options.lowestRolls).to.be.false;
      expect(options.drop).to.equal(3);
    });
  });
    
  describe('~keep', function(){
    it('should not have keep options enabled by default', function(){
      const options = new  RollOptions('');
      expect(options.keep).to.be.false;
    });

    it('should have an error if no keep options are specified', function(){
      const options = new  RollOptions('k');
      expect(options.isValid).to.be.false;
      expect(options.error).to.equal('You must specify valid options for the (k)eep modifier, e.g. k3, kl2, kh2');
    });

    it('should have an error if keep options are invalid', function(){
      const options = new RollOptions('kxxx');
      expect(options.isValid).to.be.false;
      expect(options.error).to.equal('You must specify valid options for the (k)eep modifier, e.g. k3, kl2, kh2');
    });

    it('should default to keepping lowest dice', function(){
      const options = new RollOptions('k1');
      expect(options.isValid).to.be.true;
      expect(options.keep).to.equal(1);
      expect(options.highestRolls).to.be.true;
      expect(options.lowestRolls).to.be.false;
    });

    it('should allow any number of dice', function(){
      const options1 = new RollOptions('k2');
      expect(options1.isValid).to.be.true;
      expect(options1.keep).to.equal(2);
      
      const options2 = new RollOptions('k4');
      expect(options2.isValid).to.be.true;
      expect(options2.keep).to.equal(4);
    });

    it('should recognize the "lowest rolls" modifier', function(){
      const options = new RollOptions('kl3');
      expect(options.isValid).to.be.true;
      expect(options.lowestRolls).to.be.true;
      expect(options.highestRolls).to.be.false;
      expect(options.keep).to.equal(3);
    });
  });

  it('should recognize a variety of options', function(){
    const options1 = new RollOptions('!kh3r3r>17');
    expect(options1.isValid).to.be.true;
    expect(options1.keep).to.equal(3);
    expect(options1.highestRolls).to.be.true;
    expect(options1.lowestRolls).to.be.false;
    expect(options1.explodingRolls).to.be.true;
    expect(options1.reroll.length).to.equal(2);
    expect(options1.needReroll(3)).to.be.true;
    expect(options1.needReroll(18)).to.be.true;
    expect(options1.needReroll(1)).to.be.false;
    expect(options1.needReroll(10)).to.be.false;
  });

  it('should error if both keep and drop are specified', function(){
    const options1 = new RollOptions('k1d1');
    expect(options1.isValid).to.be.false;
    expect(options1.error).to.equal('Cannot enable both "keep" and "drop" options simultaneously.');

    const options2 = new RollOptions('d1k1');
    expect(options2.isValid).to.be.false;
    expect(options2.error).to.equal('Cannot enable both "keep" and "drop" options simultaneously.');
  });

  it('should recognize and return valid roll options in a string inspector', function(){
    [
      { option: 'd5', position: 0, expected: 'd5', next: false },
      { option: 'k5', position: 0, expected: 'k5', next: false },
      { option: '!', position: 0, expected: '!', next: false },
      { option: 'r1', position: 0, expected: 'r1', next: false },
      { option: 'r<10', position: 0, expected: 'r<10', next: false },
      { option: 'r>=100', position: 0, expected: 'r>=100', next: false },
      { option: 'r1! ', position: 0, expected: 'r1!', next: ' '},
      { option: 'blah', position: 0, expected: '', next: 'b' },
      { option: ' k5r1!', position: 0, expected: '', next: ' '},
      { option: ' k5r1!+', position: 1, expected: 'k5r1!', next: '+'}
    ].forEach(x => {
      const inspector = new StringInspector(x.option);
      if(x.position){
        inspector.position = x.position;
      }
      expect(RollOptions.findOptions(inspector)).to.equal(x.expected);
      expect(inspector.next()).to.equal(x.next);
    });
  });

});