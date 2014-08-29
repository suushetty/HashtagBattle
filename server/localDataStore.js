// This file manages all the data that is stored locally in order to support the hashtag battle. It provides methods
// to other modules enabling access to certain params. 

var hashtagCount = {};
var hashtagInputs = [];
var filterInputs = [];
var filterInputString = "";

// Setters and getters for the filter Input String. This filters what tweets we get from the API
module.exports.getFilterInputString = function() {
    return filterInputString;
}

module.exports.setFilterInputString = function(input) {
    filterInputString = input;
}

module.exports.addFilterInput = function(input) {
    filterInputs.push(input);
}

module.exports.removeFilterInput = function(input) {
    if(filterInputs.indexOf(input) >= 0) {
        filterInputs.splice(filterInputs.indexOf(input), 1);
        filterInputString = filterInputs.toString();
    }
}

module.exports.getFilterInputs = function() {
    return filterInputs;
}

// Initializes the memory data structures we will be using to track the hashtag counts
module.exports.initialize = function(hashtagInput, sessionID, callback) {
    inputLength = hashtagInput.length;
    // Construct the filter string for querying the twitter api from the hashtagInputs . Also initialize the data structures that will be used
    // to manage  Hashtag related counts
    for (var i = 0; i < inputLength; i++) {
        var hashtag = hashtagInput[i];

        if (hashtagInput[i] != null && hashtagInput[i] != undefined) {
            module.exports.addFilterInput("#" + hashtagInput[i] );
        }
        var countEntry = { count: 0, retweetCount: 0, reach: 0, sessionID : sessionID } ;

        if (hashtagInputs.indexOf(hashtag) >= 0) {
            hashtagCount[hashtag].push(countEntry);
        } else {
            hashtagCount[hashtag] = [countEntry];
        } 
    }
    
    hashtagInputs.push.apply(hashtagInputs, hashtagInput);

    if (callback) {
        callback();
    }
}

// Updates the various tweet related counts on the local data structures  
module.exports.updateTweetInfo = function (tweet) {
    var hashtags = tweet.entities.hashtags;
    var user = tweet.user;
    // Increment the count of the hashtags that are being tracked
    for (var i = 0 ; i < hashtags.length; i++) {
        var hashtag = hashtags[i].text.toLowerCase();
        if (hashtagInputs.indexOf(hashtag) >= 0) {
            //Increment the count of the hashtag for every session that is tracking it
            for (var j = 0; j < hashtagCount[hashtag].length; j++) {
                if (hashtagCount[hashtag][j] != undefined) {
                    hashtagCount[hashtag][j].count += 1;
                    //should ideally exclude retweets that were created before the battle start time
                    hashtagCount[hashtag][j].retweetCount += ((tweet.retweeted_status == undefined ) ? 0 : 1);
                    hashtagCount[hashtag][j].reach += tweet.user.followers_count;
                }
            }
        }

    }
}

// Gets the updated Hashtag count info to return data to the client
module.exports.getHashtagTweetInfo = function (hashtags, sessionID) {
    var output = {};
    for (var i=0; i < hashtags.length; i++) {
        var hashtag = hashtags[i];
        //Increment the count of the hashtag for every session that is tracking it
        for (var j = 0; j < hashtagCount[hashtag].length; j++) {
            if (hashtagCount[hashtag][j] != undefined && hashtagCount[hashtag][j].sessionID == sessionID) {
                var metricCounts = {};
                metricCounts["count"] = hashtagCount[hashtag][j].count;
                metricCounts["retweetCount"] = hashtagCount[hashtag][j].retweetCount;
                metricCounts["reach"] = hashtagCount[hashtag][j].reach;
                output[hashtag] = metricCounts;
                break;
            }
        }
    }
    return output;
}

// Clean up and remove all the tracked inputs. This is usually called when the battle is over
module.exports.removeTrackedInputs = function (hashtags, sessionID, callback) {
    if (hashtags != undefined && hashtags.length > 0 ) {
        for(var i = 0; i < hashtags.length; i++) {
            var hashtag = hashtags[i];
            if (hashtagInputs.indexOf(hashtag) >= 0) {
                releaseHashtags(hashtag, sessionID);
                hashtagInputs.splice(hashtagInputs.indexOf(hashtag), 1);
                module.exports.removeFilterInput("#" + hashtag);
            }
        }
    }
    if (callback) {
        callback();
    }
}

function releaseHashtags(hashtag, sessionID) {
    for (var j = 0; j < hashtagCount[hashtag].length ; j++) {;
        if (hashtagCount[hashtag][j] != undefined && hashtagCount[hashtag][j].sessionID == sessionID) {
            delete hashtagCount[hashtag][j];
        }
    }
}