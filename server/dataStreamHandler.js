// This file uses the twitter API in order to stream tweets as they come in. We specify a filter parameter to listen to only tweets 
// that we are interested in. This filter param is formed by a combination of the input hashtags . Since twitter API streaming 
// connections are limited to 1 per account, we disconnect and change the query filter everytime there is a new connection.

var sessionInputManager = require('./sessionInputManager.js')
var localDataStore = require('./localDataStore.js')
var Twit = require('twit');

// Read the twitter API access environment variables
var accessConfig = {
    consumer_key:         process.env['CONSUMER_KEY'] ,
    consumer_secret:      process.env['CONSUMER_SECRET'] ,
    access_token:         process.env['ACCESS_TOKEN'] ,
    access_token_secret:  process.env['ACCESS_TOKEN_SECRET'] ,
};

// Starts streaming tweets that are part of the battle
module.exports.startBattle = function (sessionID) {
    localDataStore.initialize(sessionInputManager.getSessionInput(sessionID), sessionID, function () {
        var filterInputString = localDataStore.getFilterInputString();
        var filterInputs = localDataStore.getFilterInputs();
  
        // If the twitter stream connection is currently closed , reopen it
        if (filterInputString == "") {
            twitterStreamClient = new Twit(accessConfig); 
        } else {
            stream.stop();
        }

        // Update the filterString to be used
        filterInputString = localDataStore.getFilterInputs().toString();
        localDataStore.setFilterInputString(filterInputString);

        // We combine filter Inputs to handle multiple connections. Twitter allows only one standing streaming connection per account. 
        // Working around this by recreating the stream with new filterInputs. Ideally an api like firehose should be used.
        // Setup a stream which provides tweets that match any of the input hashtags
        stream = twitterStreamClient.stream('statuses/filter', { track: filterInputString });

        setupStreaming(stream);
    });
}

// Stops the battle and returns a final count of hashtags to the client
module.exports.stopBattle = function (sessionID) {
    if (!sessionInputManager.sessionExists(sessionID)) {
        return "";
    }
    var data = localDataStore.getHashtagTweetInfo(sessionInputManager.getSessionInput(sessionID), sessionID);
    localDataStore.removeTrackedInputs(sessionInputMap[sessionID], sessionID, function () {
        if(localDataStore.getFilterInputs().length == 0 ) {
            stream.stop();
        }
        sessionInputManager.removeSessionEntry(sessionID);
    });
    return data;
}

// Gets the hashtag count for the different hashtag inputs mapped to the sessionID
module.exports.getHashtagCount = function (sessionID) {
    if (sessionInputManager.sessionExists(sessionID)) {
        return localDataStore.getHashtagTweetInfo(sessionInputManager.getSessionInput(sessionID), sessionID);
    } else {
        return "";
    }
}

// Set up receivers for different streaming events
function setupStreaming() {
    stream.on('tweet', function (tweet) {
        localDataStore.updateTweetInfo(tweet);
    });

    stream.on('connected', function (response) {
        // Connection successful
    })

    stream.on('blocked', function (response) {
        console.log("BLOCKED" + response);
    })

    stream.on('disconnect', function (response) {
        console.log("ERROR" + response);
        // Set up exponential backoff and retry 
    });

    stream.on('warning', function (warning) {
        console.log("WARNING" + warning);
    });
     
    stream.on('error', function (error) {
        console.log("ERROR" + error);
        twitterStreamClient = new Twit(accessConfig);
    });
}