/* global describe, it */
const chai = require('chai');
const expect = chai.expect;
const Value = require('../src/Value');

describe('Value', function(){
  it('should be invalid if passed non-numeric string', function(){
    [
      { value: '', error: 'Specified value, , is not a number.' },
      { value: ' ', error: 'Specified value,  , is not a number.' },
      { value: 'abc', error: 'Specified value, abc, is not a number.' },
      { value: 'a23', error: 'Specified value, a23, is not a number.' }
    ].map((item) => {
      const a = new Value(item.value);
      expect(a).to.be.an.instanceof(Value);
      expect(a.isValid, `${item.value} should not have been valid`).to.be.false;
      expect(a.error).to.equal(item.error);
    });
  });

  it('should be valid if passed a numeric string', function(){
    [
      { value: '1', expected: 1, str: '1' },
      { value: '-1', expected: -1, str: '-1' },
      { value: '0', expected: 0, str: '0' },
      { value: '3.5', expected: 3, str: '3' },
      { value: '200', expected: 200, str: '200' },
      { value: '040', expected: 40, str:'40' }
    ].map((item) => {
      const a = new Value(item.value);
      expect(a).to.be.an.instanceof(Value);
      expect(a.isValid, `${item.value} should have been valid`).to.be.true;
      expect(a.value).to.equal(item.expected);
      expect(a.notation).to.equal(item.str);
      expect(a.toString()).to.equal(item.str);
      expect(a.toDetails()).to.equal(`(constant) ${item.str}`);
    });
  });

  it('should be able to transfer values onto a scope object', function(){
    const source = [
      { name: '$0', value: '1', expected: 1 },
      { name: '$1', value: '2', expected: 2 },
      { name: '$2', value: '3', expected: 3 },
      { name: '$3', value: '4', expected: 4 },
      { name: '$4', value: '5', expected: 5 },
      { name: '$5', value: '6', expected: 6 }      
    ];
    const scope = source.map(item => {
      const a = new Value(item.value);
      expect(a).to.be.an.instanceof(Value);
      a.name = item.name;
      expect(a.value).to.equal(item.expected);
      expect(a.name).to.equal(item.name);
      expect(a.isValid).to.be.true;
      return a;
    }).reduce((scope, val) => {
      return val.transfer(scope);
    }, null);

    source.forEach(item => {
      expect(scope[item.name], `${item.name} expected to be ${item.expected}`).to.equal(item.expected);
    });
  });
});