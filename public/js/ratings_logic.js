var debug = false;
var socket = undefined;

isNumeric = function(obj) {
        return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }


$(document).ready(function() {
    console.log('in ratings_logic.js and ready');
    $('#submit').show();
    if(debug)
    {
      socket = io.connect('http://127.0.0.1:8008');
    }
    else
    {
      socket = io.connect('https://www.freemarketlite.cc:443', { secure: true });
    }
    var errors = [];
	
    /**
     *socket.io
     **/
	socket.emit('getRatings', { address: $('#address').text() });
	var avg = 0;
    socket.on('getRatingsResult', function(data) {
		result = data.result;
		var index=0;
		if(result.length > 0){
			$('#ratingsDiv').append('<tr><td>Number of Ratings:</td><td>' + result.length + '</td></tr>');
			$('#ratingsDiv').append('<tr class="blank_row"></tr><tr class="blank_row"></tr>');
			for(index=0; index < result.length; index++){
				avg += Number(result[index].stars);
				$('#ratingsDiv').append('<tr><td>Overall (1-5):</td><td>' + result[index].stars + '</td></tr>');			
				$('#ratingsDiv').append('<tr><td>Item:</td><td>' + result[index].item_title + '</td></tr>');
				$('#ratingsDiv').append('<tr><td>Feedback:</td><td>' + result[index].feedback + '</td></tr>');
				$('#ratingsDiv').append('<tr class="blank_row"></tr><tr class="blank_row"></tr>');
			}
			avg /= result.length;
			$('#avgDiv').append('<span><b>Overall Rating: ' + avg + '</b></span>');
		} else
			$('#ratingsDiv').append('<tr><td>This Seller Has No Ratings</td></tr>');
		
    });


   


});
