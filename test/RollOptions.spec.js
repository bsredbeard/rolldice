/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const RollOptions = require('../src/RO');

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
      expect(options1.error).to.equal('Must specify options for the (r)eroll modifier, e.g. r3, r<3, or r>=11');
  
      const options2 = new RollOptions('ra');
      expect(options2.isValid).to.be.false;
      expect(options2.error).to.equal('Invalid (r)eroll options: a');
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

});