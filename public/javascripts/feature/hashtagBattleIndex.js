$(document).ready(function () {
    var hashtagInputs = [];
    inputSubmission(hashtagInputs);
    startBattle(hashtagInputs);
    stopBattle();
    enableMetricGraphs();
});

// Enables bar graphs for the different metric options in analytics 
function enableMetricGraphs() {
    // Highlight the pill that got clicked
    $('.insights li').click(function() {
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
    });

    $('#hashtagCountMetric').click(function(event) {
        event.preventDefault();
        $('#metricDescription').html("This metric indicates the number of people who tweeted with the input hashtags");
        drawBarChart("count");
    });

    $('#brandReachMetric').click(function(event) {
        event.preventDefault();
        $('#metricDescription').html("This metric measures the impact of the hashtag by estimating how many people it has reached. This does \
            not account for duplicates, i.e some followers might be included multiple times");
        drawBarChart("reach");
    });

    $('#retweets').click(function(event) {
        event.preventDefault();
        $('#metricDescription').html("This metric indicates the percentage of people who retweeted a tweet that had the input hashtags");
        drawBarChart("retweet count");
    });

    $('#viralityFactor').click(function(event) {
        event.preventDefault();
        $('#metricDescription').html("Virality Factor measures if the hashtag has chances of going viral. It takes the no of retweets \
            and the rate of tweets into account. It varies from a scale of 0 to 100 with 100 indicating that the content is probably viral");
        drawBarChart("virality factor");
    });
}

// Validates and stores all the input hashtag inputs
function inputSubmission(hashtagInputs) {
    $('#hashtag').submit( function (event) {
        event.preventDefault();
        var hashtag = $('#hashtag :input')[0].value.toLowerCase();

        // Check if the hashtag input conforms to the following rules
        // Does not contain only numbers
        // Starts with a number or a letter
        var match = /^\d*[a-z]+[a-z\d_]*$/i.exec(hashtag);

        if (match == null || match[0] != hashtag) {
            bootbox.alert("Hashtags cannot contain spaces or special characters and should have atleast one letter");
        } else if (hashtagInputs.indexOf(hashtag) >=0) {
            bootbox.alert("Duplicate Hashtags not allowed");
        } else {
            hashtagInputs.push(hashtag);
            $('#hashtagList').append("#" + hashtag + "  ");
            $('#startBattle').removeAttr('disabled');
        }
    });
}

// Updates the hashtag counts for each of the hashtaginputs and displays the bar graph everytime
var updateHashtagCounts = function (hashtagCount, callback) {
    var data = [];
    var leaderCount = 0;
    var leaders = [];
    for (var hashtag in hashtagCount) {    
        if (hashtagCount.hasOwnProperty(hashtag)) {
           var tweetCount = hashtagCount[hashtag].count
            if (leaderCount < tweetCount) {
                leaders.length = 0;  
                leaderCount = tweetCount;
                leaders.push('#' + hashtag);
            } else if (leaderCount == tweetCount) {
                leaders.push('#' + hashtag);
            }
           
            var entry= {};
           
            entry["hashtag"] = hashtag;
            entry["count"] = tweetCount;
            entry["retweet count"] = (tweetCount == 0 ? 0 : Math.round(hashtagCount[hashtag].retweetCount * 100 / tweetCount));
            entry["virality factor"] = calculateViralityFactor(tweetCount, hashtagCount[hashtag].retweetCount);
            entry["reach"] = hashtagCount[hashtag].reach;
            data.push(entry);
            console.log(hashtag + ":" + hashtagCount[hashtag].count);
        }
    }

    drawBarChart(data, "count");
    if(callback) {
        callback({"leaderCount" : leaderCount, "leaders": leaders});
    }
}

// Calculates the virality factor of a given hashtag  by considering 2 factors
// 1. The rate at which the tweets are posted ( 100/ minute is considered good)
// 2. Percentage of tweets that are actually retweets. A higher number indicates a higher chance of the content going viral
function calculateViralityFactor(tweetCount, retweetCount) {
    var viralityFactor = 0;
    if(tweetCount !=0 ) {
        var battleTime = (endTime - startTime) / (1000 * 60);
        var tweetRate = (tweetCount / battleTime) / 100;
        var viralTimeFactor = (tweetRate > 1 ? 1 : tweetRate);
        var viralityFactor = Math.round((0.25 * (retweetCount / tweetCount) + 0.75 * viralTimeFactor) * 100);
    }
    return viralityFactor;
}

// Display the winner of the battle and enable the battle analytics metric weidget
function updateWinner(input) {
    $('#leader').html(input.leaders.toString() + " won with " + input.leaderCount + " tweets");
    $('#leader').append("<hr>")
                .append("<div class='battleInsights'>Battle Analytics</div>");
    $('.insights').show();
    $('#hashtagCountMetric').click();

}

// This method draws the hortizontal bar chart using d3.
// It displays one of the four metric graphs based on the input
function drawBarChart(data, dataType){
    var chart = d3.select(".chart").selectAll("g").remove();
    var chart = d3.select(".chart").selectAll("text").remove();
    //Set up width and height variables for the bar graph display
    var width = 1000;
    var barHeight = 40;
    var height = data.length * 40;
    var maxCount = Math.max.apply(Math, data.map(function(o) {return o[dataType];} ));
   
    // Determines how the max value of the x -axis should scale. 
    // To scale, we set the max width as the nearest(ceil) multiple of a 10^x-1, where x is the number of characters in the max value of the data 
    var temp = Math.pow(10, (Math.floor(Math.log(maxCount == 0 ? 1 : maxCount) / Math.LN10)));
    var maxXaxisValue = (Math.floor(maxCount/temp) + 1) * temp;

    var xAxisTickerData = [];
    // Adjusts the offset for the bar graph left margin based on data
    var hashtagCountPixelOffset = d3.max(data, function(d) { return (d.hashtag.length + 2) * 15}) + 10;

    // Adjusts the width of the hashtag and the count label based on the data
    var maxlabelPixelWidth =  30 + d3.max(data, function (d) { 
        var labelLength = d.hashtag.length + 2 + d[dataType].toString().length;
        var labelPixelWidth = labelLength * 15;
        return labelPixelWidth; 
    });

    // Sets up the range and scales for x axis
    var x = d3.scale.linear()
        .range([0, width - maxlabelPixelWidth])
        .domain([0, maxXaxisValue]);

    // Sets up the range and scales for y axis
    var y = d3.scale.linear()
        .range([0, height]);

    // Ajust the number of  x axis points based on the max value in the data
    var totalXAxisPoints = (maxCount > 10000) ? 5 : 10;

    // Calculates the values for the ticker points on x axis.
    for(var i = 0; i <= totalXAxisPoints; i++) {
       xAxisTickerData.push(Math.round((maxXaxisValue * i / totalXAxisPoints)));
    }

    // Draw the chart inside which the bargrpah will reside
    var chart = d3.select(".chart")
        .attr("width", width + hashtagCountPixelOffset)
        .attr("height", barHeight * data.length + 50 );

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

    // Append the actual bar graph
    bar.append("rect")
        .attr("width", function(d) { return x(d[dataType]); })
        .attr("height", barHeight - 1)
        .attr("x", maxlabelPixelWidth)
        .attr("fill", function(d) {
            return "rgb(0, 0, " + (d * 10) + ")";
        });

    // Display the hashtag on the y axis
    bar.append("text")
        .attr("x", 0)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return "#" + d.hashtag + "  "; });

    // Display the hashtag count on the y axis
    bar.append("text")
        .attr("x",  hashtagCountPixelOffset)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return  d[dataType]; });
 
    // Set up X axis tick
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + maxlabelPixelWidth + "," + height + ")")
        .call(setupXaxis());

    // Set up Y axis tick
    chart.append("g")
        .attr("transform", "translate(" + maxlabelPixelWidth + "," + 0 + ")")
        .call(setupYaxis());

    chart.append("text")
        .attr("x",  (hashtagCountPixelOffset +  (width - maxlabelPixelWidth) / 2))
        .attr("y", height + 40)
        .attr("dy", ".35em")
        .text(dataType);

    function setupXaxis() {        
        return d3.svg.axis()
             .scale(x)
             .orient("bottom")
             .tickValues(xAxisTickerData)
             .tickSize(10)
    }

    function setupYaxis() {        
        return d3.svg.axis()
             .scale(y)
             .orient("left")
             .ticks([])
    }

    function type(d) {
      d[dataType] = +d[dataType]; // coerce to number
      return d;
    }
}
