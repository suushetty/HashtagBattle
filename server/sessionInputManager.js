// Manages session-hashtag input mapping. This provides a light weight statefulness on the server side
// to the incoming requests.

sessionManager = {};
sessionInputMap = {};

module.exports.sessionExists = function (sessionID) {
    return sessionManager[sessionID] !=  undefined;
}

module.exports.createSessionEntry = function(req, callback) {
    sessionInputMap[req.sessionID] = req.body.inputs;
    sessionManager[req.sessionID] = true;
    if (callback) {
        callback();
    } 
}

module.exports.getSessionInput = function(sessionID) {
    return sessionInputMap[sessionID];
}

module.exports.removeSessionEntry = function(sessionID) {
    delete sessionInputMap[sessionID];
    delete sessionManager[sessionID];
}