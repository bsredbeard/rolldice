var hubot = require('hubot');
var Helper = require('hubot-test-helper');
var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var helper = new Helper('../rolldice.js');

describe('rolldice', function(){
  var room = null;
  beforeEach(function(){
    room = helper.createRoom({httpd:false});
  });
  afterEach(function(){
    try {
      room.destroy();
    }catch(ex){}
  });
  
  it('should roll some default dice', function(){
    return room.user.say('user1', '!roll').then(function(){
      expect(room.messages).to.have.length(2);
      expect(room.messages[1][1]).to.be.a('string');
      expect(room.messages[1][1]).to.match(/@user1 Total: \d rolls: 1d6\(\d\)/);
    });
  });
  
  it('should not attempt an invalid roll', function(){
    return room.user.say('user1', '!roll something').then(function(){
      expect(room.messages).to.have.length(2);
      expect(room.messages[1][1]).to.equal('@user1 Invalid dice roll.')
    });
  });
  
  it('should respond to valid complex rolls', function(){
    return room.user.say('user1', '!roll 4d6k2 + 3d10-8').then(function(){
      expect(room.messages).to.have.length(2);
      expect(room.messages[1][1]).to.match(/@user1 Total: \d+ rolls: 4d6k2\(\d+\) \+ 3d10\(\d+\) - 8/);
    });
  });
});