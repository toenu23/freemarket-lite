var debug = true;
var socket = undefined;

isNumeric = function(obj) {
        return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }


$(document).ready(function() {
    console.log('in myPurchases.js and ready');
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
	$('#myPurchasesBtn').on('click', function(){
		socket.emit('getPurchases', {secret: $('#secretkey').val() }); 
	});
    socket.on('getPurchasesResult', function(data) {
		if(JSON.parse(data).query_status == "bad")
			bootbox.alert(JSON.parse(data).errorDescription);
		else {
			result = JSON.parse(data).items;
			var index=0;
			if(result.length > 0){
				for(index=0; index < result.length; index++){
					$('#purchases').append('<tr><td>Title:</td><td>' + result[index].item_title + '</td></tr>');			
					$('#purchases').append('<tr><td>ID</td><td>' + result[index].listing_id + '</td></tr>');
					$('#purchases').append('<tr><td>Title</td><td>' + result[index].item_title + '</td></tr>');
					$('#purchases').append('<tr><td>Description</td><td>' + result[index].item_description + '</td></tr>');
					$('#purchases').append('<tr><td>Price</td><td>' + Number(result[index].price) / 100000000 + ' NxT</td></tr>');
					$('#purchases').append('<tr><td>Seller ID</td><td><a href=\"/ratings/'+ result[index].seller_id +'\">' + result[index].seller_id + '</a>&nbsp;&nbsp;&nbsp;<a href="/rateSeller/'+ result[index].seller_id + '/' + result[index].item_title +'/' + result[index].listing_id + '">Rate This Seller?</a></td></tr>');
					$('#purchases').append('<tr><td>Category</td><td>' + result[index].category1 + '</td></tr>');
					$('#purchases').append('<tr><td>Quantity</td><td>' + result[index].quantity + '</td></tr>');
					$('#purchases').append('<tr><td>Item Status</td><td>' + result[index].item_status + '</td></tr>');
					$('#purchases').append('<tr><td>Shipping Method 1&nbsp;&nbsp;</td><td>' + result[index].shippingMethod1 + ' -- ' + result[index].shippingCost1 + ' NxT</td></tr>');
					$('#purchases').append('<tr><td>Shipping Method 2&nbsp;&nbsp;</td><td>' + result[index].shippingMethod2 + ' -- ' + result[index].shippingCost2 + ' NxT</td></tr>');
					$('#purchases').append('<tr><td>Shipping Method 3&nbsp;&nbsp;</td><td>' + result[index].shippingMethod3 + ' -- ' + result[index].shippingCost3 + ' NxT</td></tr>');
					$('#purchases').append('<tr class="blank_row"></tr><tr class="blank_row"></tr>');
				}
			}
		}
    });


   


});
