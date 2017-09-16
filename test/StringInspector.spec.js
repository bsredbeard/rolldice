/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const StringInspector = require('../src/StringInspector');

describe('StringInspector', function(){
  it('should accept no input and have 0 length', function(){
    const a = new StringInspector();
    expect(a).to.be.an.instanceof(StringInspector);
    expect(a.str, 'str should have been an empty array').to.be.empty;
    expect(a.hasNext, 'hasNext should have been false').to.be.false;
    expect(a.toString(), 'toString() should have been an empty string').to.equal('');
    expect(a.next(), "next() should have returned false").to.be.false;
  });

  it('should accept invalid and have 0 length', function(){
    const a = new StringInspector(true);
    expect(a).to.be.an.instanceof(StringInspector);
    expect(a.str, 'str should have been an empty array').to.be.empty;
    expect(a.hasNext, 'hasNext should have been false').to.be.false;
    expect(a.toString(), 'toString() should have been an empty string').to.equal('');
    expect(a.next(), "next() should have returned false").to.be.false;
  });

  it('should accept a valid string input', function(){
    const a = new StringInspector('abc');
    expect(a).to.be.an.instanceof(StringInspector);
    expect(a.toString()).to.equal('abc');
    expect(a.hasNext).to.be.true;
  });

  it('should return the next character when next() is called', function(){
    const a = new StringInspector('abc');
    expect(a.next()).to.equal('a');
    expect(a.next()).to.equal('b');
    expect(a.next()).to.equal('c');
  });
  
  it('should advance the position when calling next', function(){
    const a = new StringInspector('abc');
    expect(a.position).to.equal(0);
    expect(a.next()).to.equal('a');
    expect(a.position).to.equal(1);
  });

  it('should return false when no characters are left', function(){
    const a = new StringInspector('abc');
    expect(a.next()).to.equal('a');
    expect(a.next()).to.equal('b');
    expect(a.next()).to.equal('c');
    expect(a.next()).to.be.false;
  });

  it('should have valid output for nextUntil(fn)', function(){
    const a = new StringInspector('abc');
    expect(a).to.be.an.instanceof(StringInspector);
    expect(a.nextUntil(char => char === 'c')).to.equal('ab');
    expect(a.peek()).to.equal('c');
    expect(a.next()).to.equal('c');
    expect(a.next()).to.be.false;
    expect(a.nextUntil(() => true)).to.equal('');
    expect(a.nextUntil(() => false)).to.equal('');
  });

  it('should have valid output for nextWhile(fn)', function(){
    const a = new StringInspector('aaabc');
    expect(a).to.be.an.instanceof(StringInspector);
    expect(a.nextWhile(char => char === 'a')).to.equal('aaa');
    expect(a.peek()).to.equal('b');
    expect(a.nextWhile(() => true)).to.equal('bc');
    expect(a.next()).to.be.false;
    expect(a.nextWhile(() => true)).to.equal('');
    expect(a.nextWhile(() => false)).to.equal('');
  });
});