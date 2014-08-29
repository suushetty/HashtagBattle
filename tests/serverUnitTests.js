// Unit Tests different server side components

var sessionInputManager = require('../server/sessionInputManager.js')
var localDataStore = require('../server/localDataStore.js')
var requestHandler = require('../server/requestHandler.js')
var dataStreamHandler = require('../server/dataStreamHandler.js')
var assert = require("assert")

describe('sessionInputManager', function () {
    describe('sessionExists', function () {
        it('should return false when session is absent from the sessionMap', function () {
            assert.equal(false, sessionInputManager.sessionExists(''));
        })
        it('should return true when session is absent from the sessionMap', function () {
            sessionInputManager.createSessionEntry({body:{inputs:['als']}, sessionID:'testSession'});
            assert.equal(true, sessionInputManager.sessionExists('testSession'));
        })
    })

    describe('createSessionEntry', function() {
        it('should create a valid input', function () {
            sessionInputManager.createSessionEntry({body:{inputs:['als']}, sessionID:'testSession'});
            assert.equal('als',  sessionInputManager.getSessionInput('testSession')[0]);
        })
    })

    describe('removeSessionEntry', function() {
        it('should remove a session entry', function () {
            sessionInputManager.createSessionEntry({body:{inputs:['als']}, sessionID:'testSession'});
            assert.equal(true,  sessionInputManager.sessionExists('testSession'));
            sessionInputManager.removeSessionEntry('testSession');
            assert.equal(false,  sessionInputManager.sessionExists('testSession'));
        })
    })

});


describe('requestHandler', function () {
    describe('startBattleRequest', function () {

        it('should return error string if the body does not have input' , function () {
             assert.equal("Atleast one hashtag input is required!", requestHandler.startBattleRequest({body:{inputs:[]}, sessionID:'testSession'}).msg);
        })

        it('should return error string if the body is empty' , function () {
             assert.equal("Atleast one hashtag input is required!", requestHandler.startBattleRequest({body:{},sessionID:'testSession'}).msg);
        })
    })
});

describe('localDataStore', function () {
    describe('initialize', function () {
        it('should update the filter string' , function () {
             localDataStore.initialize(['als'], 'testSession');
             assert.equal("#als", localDataStore.getFilterInputs().toString());
        })
    })

    describe('getHashtagTweetInfo', function () {
        it('should return empty string when there is not input' , function () {
             assert.deepEqual({}, localDataStore.getHashtagTweetInfo([], 'testSession'));
        })
    })

});


