// This class manages the incoming requests from the router, handling error conditions or updating the session informaion
// for the input. 

var sessionInputManager = require('./sessionInputManager.js')
var dataStreamHandler = require('./dataStreamHandler.js')

module.exports.startBattleRequest = function (req) {
    // Validate that there is atleast one hashtag as input
    if (req.body.inputs == null || req.body.inputs == undefined || req.body.inputs.length == 0) {
        result = { msg: "Atleast one hashtag input is required!" };
    } else {
        console.log(req.sessionID);
        
        if (sessionInputManager.sessionExists(req.sessionID)) {
            dataStreamHandler.stopBattle(req.sessionID);
        }
        sessionInputManager.createSessionEntry(req, function() {
            dataStreamHandler.startBattle(req.sessionID);
        });
        result = { msg: '' };
    }
    return result;
}

module.exports.stopBattleRequest = function (req) {
    return { data: dataStreamHandler.stopBattle(req.sessionID) };
}

module.exports.getHashtagCountRequest = function (req) {
    return { data: dataStreamHandler.getHashtagCount(req.sessionID) };
}
