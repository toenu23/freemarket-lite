var debug = false;
var socket = undefined;

isNumeric = function(obj) {
        return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }


$(document).ready(function() {
    console.log('in rateSeller.js and ready');
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
	$('#rateUserBtn').on('click', function(){
		var e = document.getElementById("numStars");
		var strUser = e.options[e.selectedIndex].value;
		var rateInfo = {
			address: $('#address').text(),
			stars: strUser,
			item_title: $('#item_title').text(),
			listing_id: $('#listing_id').text(),
			secret: $('#secretkey').val()
		};
		rateInfo.feedback = $('#feedback').val();
		socket.emit('rateSeller', rateInfo);

    });

	socket.on('rateSellerResponse', function(data){
		bootbox.alert(data.result);
		});
   


});
