// Starts a battle by passing the input hashtags that needs to be tracked
function startBattle(hashtagInputs) {
    $('#startBattle').click(function (event) {
        $('#hashtagList').remove();
        event.preventDefault();
        
        // Post server request to start fetching tweets for the hashtags passed in the input
        $.ajax({
            type: 'POST',
            data: {inputs: hashtagInputs},
            url: "/startBattle",
            dataType: 'JSON',
            success: function (response) {
                if (response.msg == '') {
                    getHashtagCount();
                    // Disable the hashtag input and startBattle buttons and enable the stopBattle buttons
                    $('.resultContainer').show();
                    $('#startBattle').attr('disabled', true);
                    $('#stopBattle').removeAttr('disabled');
                    $('#hashtagSubmit').attr('disabled', true);
                    $('#metricDescription').append('<img src="/images/ajax-loader.gif" id="loading-indicator" style="margin-left: 500px;" />');
                    startTime = Date.now();
                } else {
                    bootbox.alert('Error: ' + response.msg);
                }
            }, 
            error: function(xhr, status) {
                bootbox.alert('Error: Something went wrong');
            }
        });
    });    
 }

// Stops the battle and receives the final hashtag related counts and displays the winner of the battle
function stopBattle() {
    $('#stopBattle').click(function (event) {
        event.preventDefault();
        $('#stopBattle').attr('disabled',true);
        clearTimeout(updateInIntervals);

        $.ajax({
            type: 'GET',
            url: "/stopBattle",
            dataType: 'JSON',
            success: function (response, status, err) {
                if(response.data == '') {
                    bootbox.alert('Error:' + 'Data not available from server for this session. Maybe the session was terminated');
                } else {
                    // On Success update the hashtag counts and display it on the bar graph
                    endTime = Date.now();
                    updateHashtagCounts(response.data, function (res) {
                        enableMetricGraphs(res.data);
                        updateWinner(res);
                    });
                }
                $('#loading-indicator').remove();
            },
            error: function(xhr, status) {
                bootbox.alert('Error: Something went wrong');
            }
        });
    });
 }

 // Get updated data for the hashtag counts
function getHashtagCount() {
    $.ajax({
        type :'GET',
        url: '/getHashtagCount',
        dataType: 'JSON',
        success: function (response, status, xhr) {
            if (xhr.status == 304)  {
                //dont update since nothing changed
            } else {
                if (response.data == "") {
                    bootbox.alert('Error:' + 'Data not available from server for this session. Maybe the session was terminated');
                    clearTimeout(updateInIntervals);
                    $('#loading-indicator').remove();
                } else {
                    endTime = Date.now();
                    updateHashtagCounts(response.data);
                }
            }    
        },
        error: function (xhr, status) {
            bootbox.alert('Error: Something went wrong');
            clearTimeout(updateInIntervals);
        }
    });
    updateInIntervals = setTimeout(getHashtagCount, 2000);
}