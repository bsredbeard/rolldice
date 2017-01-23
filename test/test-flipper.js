var hubot = require('hubot');
var Helper = require('hubot-test-helper');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var helper = new Helper('../index.coffee');

describe('tableflip', function(){
  var room = null;
  beforeEach(function(){
    room = helper.createRoom({httpd:false});
  });
  afterEach(function(){
    try {
      room.destroy();
    }catch(ex){}
  });

  it('should return table after flip', function(){
    return room.user.say('user1', '(tableflip)').then(function(){
      expect(room.messages).to.have.length(2);
      expect(room.messages[0][0]).to.equal('user1');
      expect(room.messages[0][1]).to.equal('(tableflip)');
      expect(room.messages[1][0]).to.be.a('string');
      expect(room.messages).to.deep.equal([
        ['user1', '(tableflip)'],
        ['hubot', '┬──┬◡ﾉ(° -°ﾉ)']
      ]);
    });
  });
});
