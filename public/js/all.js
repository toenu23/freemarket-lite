var isMobile = window.matchMedia("only screen and (max-width: 760px)");

function initBuy() {
    $('#show_listing_div').find('#buyBtn').hide();
    socket.emit('get_listing', {
        listing_id: buyId
    });
}

if ( $( "#listing_table" ).length ) {
	$.fn.dataTable.ext.search.push(
	
		function( settings, data, dataIndex ) {
		        
		    var categoryField = data[3];
			var category = $('#filterCategory').text();
		 
		    if ( category == false || categoryField == category )
		    {
		        return true;
		    }
		        
		    return false;
		}
	);
}

$('.category').click(function(e) {
	
	var element = e.target;
	var category = $(e.target).text();

	if(category == 'All Items') {
		category = '';
	}

	$('#filterCategory').html(category);

	$('#listing_table').DataTable().draw();
	
	$('#listing_head').html('Item');
	$('#show_listing_table').empty();
	$('#no_item_selected').show();
	$('#buyBtn').hide();
	$('#listing_image').empty();
	$('#listing_image').hide();
	
	if (isMobile.matches) {
	    $('html, body').animate({
            scrollTop: $('#listings_heading').offset().top
        }, 500);
	}
	
});

var _hash = {
    init: SHA256_init,
    update: SHA256_write,
    getBytes: SHA256_finalize
};

function byteArrayToBigInteger(byteArray, startIndex) {
    var value = new BigInteger("0", 10);
    var temp1, temp2;
    for (var i = byteArray.length - 1; i >= 0; i--) {
      temp1 = value.multiply(new BigInteger("256", 10));
      temp2 = temp1.add(new BigInteger(byteArray[i].toString(10), 10));
      value = temp2;
    }

    return value;
}

function simpleHash(message) {
    _hash.init();
    _hash.update(message);
    return _hash.getBytes();
}


function getPublicKey(secretPhrase) {
    
      var secretPhraseBytes = converters.stringToByteArray(secretPhrase);
      var digest = simpleHash(secretPhraseBytes);
      return curve25519.keygen(digest).p;
}


function getAccountIdFromPublicKey(publicKey, RSFormat) {
    var hex = converters.hexStringToByteArray(publicKey);

    _hash.init();
    _hash.update(hex);

    var account = _hash.getBytes();

    account = converters.byteArrayToHexString(account);

    var slice = (converters.hexStringToByteArray(account)).slice(0, 8);

    var accountId = byteArrayToBigInteger(slice).toString();

    if (RSFormat) {
      var address = new NxtAddress();

      if (address.set(accountId)) {
        return address.toString();
      } else {
        return "";
      }
    } else {
      return accountId;
    }
}


$(document).ready(function() {
    console.log('all ready');
	
	$('#createnxtaccount').on('click', function() {
		
		bootbox.prompt ({
			title: "Enter a password for your NXT account. All converted coins will be sent here. (Keep it safe!)",
			inputType: "password",
			callback: function(result) {
				if (result.length <= 0)
					bootbox.alert("Please Enter a valid Passphrase");
				else
					socket.emit('getWithdrawalNXTAddr', {secret: result});
			}
		}); //END get NXT Passphrase
	
	});

		$('#shapeShiftBTC').on('click', function() {
		
			bootbox.confirm("<form id='infos' action=''>\
        Generate from Secret:<input type='password' id='password' /><button type='button' class='btn btn-default' id='shapeshift-generate-account'>Generate</button><br/>\
				NXT Address:<input type='text' id='address' /><br/>\
				Public Key:<input type='text' id='pubkey' />\
        <script>$('#shapeshift-generate-account').on('click', function() {\
          var public_key = converters.byteArrayToHexString(getPublicKey($('password').val()));\
          $('#pubkey').val(public_key);\
          $('#address').val(getAccountIdFromPublicKey(public_key, true));});</script>\
				</form>", function(result) {
					if(result){
						doshapeShiftBTC({accountRS: $('#infos').find('#address').val(), publicKey:  $('#infos').find('#pubkey').val()});
					}
					else
						bootbox.alert("Please Enter Valid Data");
			});
	
	});
	
	
	
	
	
	$('table tbody').on('click', 'tr', function() {

        $('#show_listing_div').empty();
        $('#listing_head').show().empty();
        var id = $(this).attr("id");
        
        var index = -1;

        for (var i = 0; i < all_data.length; i++) {
            if (all_data[i].listing_id == id)
                index = i;
        }

        if (index != -1) {

			$('#show_listing_table').empty();
			$('#no_item_selected').hide();
			$('#buyBtn').show();
			$('#listing_image').show();
			
            $('#listing_head').append(all_data[index].item_title);

			$('#listing_image').html('<a target="_blank" href="' + all_data[index].main_image_url + '"><img src="' + all_data[index].main_image_url + '" class="pull-left img-responsive" style="padding-right:3px; max-width:100%;max-height:500px;"/></a>');

			$('#show_listing_table').append('<tr><td>ID</td><td>' + all_data[index].listing_id + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Title</td><td>' + all_data[index].item_title + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Description</td><td>' + all_data[index].item_description + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Price</td><td>' + Number(all_data[index].price) / 100000000 + ' NxT</td></tr>');
			$('#show_listing_table').append('<tr><td>Seller ID</td><td><a href=\"/ratings/'+ all_data[index].seller_id +'\">' + all_data[index].seller_id + '</a></td></tr>');
			$('#show_listing_table').append('<tr><td>Category</td><td>' + all_data[index].category1 + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Quantity</td><td>' + all_data[index].quantity + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Item Status</td><td>' + all_data[index].item_status + '</td></tr>');
			$('#show_listing_table').append('<tr><td>Shipping Method 1</td><td>' + all_data[index].shippingMethod1 + ' -- ' + all_data[index].shippingCost1 + ' NxT</td></tr>');
			$('#show_listing_table').append('<tr><td>Shipping Method 2</td><td>' + all_data[index].shippingMethod2 + ' -- ' + all_data[index].shippingCost2 + ' NxT</td></tr>');
			$('#show_listing_table').append('<tr><td>Shipping Method 3</td><td>' + all_data[index].shippingMethod3 + ' -- ' + all_data[index].shippingCost3 + ' NxT</td></tr>');
			
        }

        buyId = all_data[index].listing_id;

	    if (isMobile.matches) {
	        $('html, body').animate({
                scrollTop: $('#listing_head').offset().top
            }, 500);
	    }

    });


    $('#nxt_form').submit(function(e) {
    	e.preventDefault();
        var data = {
            pass: $('#pass').val()
        };
        console.log('emitting');
        socket.emit('login', data);
    });



});
