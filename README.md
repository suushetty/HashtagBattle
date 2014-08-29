Hashtag Battle
============

**Welcome to the hashtag battle project**

This project lets you play a simple game of hashtag battle between two or more hashtags. It provides a web app where you can enter the hashtag inputs. On starting the battle, the backend creates a streaming connection to the **Twitter API**. It then starts receiving tweet events that are used to kept track of different tweet related attributes including tweetcount, retweetcount and number of followers. On the frontend it shows a running count of the hashtags via a bar graph. It also displays the winner and tweets related analytics on completion.

Architecture
------------
The architecture is as follows
 
 * Frontend - The frontend is divided into two components 
  - The first component handles making requests to the backend server, processing the responses, displaying the appropriate error messages
  - The second component manages user events and displaying/refreshing the bar graph periodically. It is also responsible for showing different battle related insights.
 
* Backend -The backend has four components
  - There is a request handler that handles incoming requests from different clients. 
  - There is a simple session manager that is used to keep stateful information about client inputs across different calls
  - There is a streaming data handler that connects to the twitter API and manages this connection across different client requests
  - There is a local data storage component which stores data corresponding to different tweets. This should be easily swappable with a persistent data storage system
*

The folders\files are laid out as follows
>  public
>  
>  routes
>
>  server
>
>  views
>
>
>  tests
>
>  bin
>  
> package.json
>
> app.js

###public###
This has the web client's javascript files, image files and stylesheets. There are two main javascript files in the javascripts/feature folder.
* hashtagBattleIndex.js - This handles all the client side logic for displaying and processing information based on user events. It is also responsible for displaying the bar graph charts.
* serverRequests.js - This handless making calls to the backend for getting information about tweets, starting/stopping the battle

###routes###
This is a serve side folder that has the index.js file. The index.js helps route all the incoming client requests (GETS/POSTS) into the right api.

###server###
This contains the main server side component files
* dataStreamHandler.js- This handles the streaming connection to the twitter API and connects/disconnects when appropriate.
* sessionInputManager.js- This does a simple session management by storing information(hashtag inputs) across different sessions.
* localDataStore.js -This manages the data storage layer of the server. Currently uses a bunch of in memory components to handle and store tweet related info. Can be replaced with a persistent data storage.
* requestHandler.js -This manages the incoming server requests performing basic error handling on them.

###views###
This contains jade files that are responsible for the html display
* layout.jade - This has the basic header and loads all the scripts required by the app
* index.jade - Displays some text and links to battleContent
* battleContent.jade - This has all the main html content to support the webapp
* error.jade - For displaying errors

###tests###
There is a serverUnitTests.js file that runs mocha tests on the different server side components

###bin###
This starts up the web server

###package.json###
This has all the packages required by node to run this app

###app.js###
This is responsible for setting up the webserver

Battle Analytics
----------------
There are some analytics that are displayed once the battle is over. These include
* Hashtag Count - This is a raw count of how many tweets there were for a given hashtaag. Its natually insightful to see what hashtag got the most tweets
* Brand Reach Metric - This is the number of people that saw the hashtags. There will definitely be overlap because the same person could be subscribed to different tweeters who tweeted the same hashtag
* Retweets - This is a indication of how the hashtag is travelling, if its being retweeted a lot  or if its spreading through word of mouth.
* Virality Factor - This has two components. The rate at which the tweets are being tweeted indicates if its popular. The second component is the number of percentage who are retweeting it. Both combined give a good idea of whether the hashtag is trending/viral.

How to Run
----------
* Installation
> npm install
* Environment variables
 - You have to add the following environment variables before you can run- CONSUMER_KEY,CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, EXPRESS_SESSION_SECRET. The first four refer to your twitter api account and the last one for creating an express session.
 Create an env file with the below data
     - export CONSUMER_KEY=your key
     - export CONSUMER_SECRET=your key
     - export ACCESS_TOKEN=your key
     - export ACCESS_TOKEN_SECRET=your key
     - export EXPRESS_SESSION_SECRET=your key
> source env
* Server
> npm start
* Tests
> mocha tests/serverUnitTests.js