$(document).ready(function(){

		$('#listing_head').hide();
		var socket = io.connect('https://localhost:443', {secure: true});
		var all_data = {};

        //server sent a new list of all items for sale
		socket.on('updateListings', function(data){
            data = JSON.stringify(data);
            data = JSON.parse(data);
			if(data.message.errno){
				$('#loading').hide();
				$('#listing_table').hide();
				$('#show_all_div').empty().append('Oops! Something went wrong. :( <br /> '+ data.message.errno);
			}
			else{
				var myData = data.message;
				$('#loading').hide();
				$('#listing_table').show();
				$('#all_listings').empty();

				for(var i=0; i<myData.items.length; i++){

					$('#all_listings').append(
					'<tr>'+
					'<td class="col-md-3 listing">'+ myData.items[i].listing_id + '</td>' +
					'<td class="col-md-3">' +
					myData.items[i].item_title +
					'</td>'+
					'<td class="col-md-3">' + Number(myData.items[i].price)/100000000 + '</td>' +
					'</a></tr>'
					);
				}
				all_data = myData.items;
			}
		}); //end of socket.on('updateListings')


        //server responded with account data
		socket.on('loginResponse', function(data){
			if(data){
				$('#login').empty();
				$('#login').append(
				'<div>'+
				'<span>' + data.accountRS + '</span><br />' +
				'<span>' + data.account + '</span><br />' +
				'<span>Balance: ' + data.balance + ' NxT</span>'+
				'</div>'
				);
			}

		}); //end of socket.on('loginResponse')

    //User clicked a listing
	$(document).on('click', 'table > tbody > tr', function() {

		$('#show_listing_div').empty();
		$('#listing_head').show().empty();
		var id = $(this).find('.listing').text();

		var index = -1;

		for(var i=0; i<all_data.length; i++){
			if(all_data[i].listing_id == id)
				index = i;
		}

		if(index != -1){

			$('#listing_head').append(all_data[index].item_title);

			$('#show_listing_div').append(
				'<dt>&nbsp</dt>'+
				'<dd><img src="' + all_data[index].main_image_url + '"></img></dd>' +
				'<dt>ID</dt>' +
				'<dd>' + all_data[index].listing_id + '</dd>' +
				'<dt>Title</dt>' +
				'<dd>' + all_data[index].item_title + '</dd>' +
				'<dt>Description</dt> ' +
				'<dd>' + all_data[index].item_description + '</dd>' +
				'<dt>Price</dt>' +
				'<dd>' + Number(all_data[index].price)/100000000 + ' NxT</dd>' +
				'<dt>Seller ID</dt>' +
				'<dd>' + all_data[index].seller_id + '</dd>' +
				'<dt>Category</dt>' +
				'<dd>' + all_data[index].category1 + '</dd>' +
				'<dt>Quantity</dt>' +
				'<dd>' + all_data[index].quantity + '</dd>' +
				'<dt>Item Status</dt>' +
				'<dd>' + all_data[index].item_status + '</dd>' +
				'<dt>Shipping Method 1</dt>' +
				'<dd>' + all_data[index].shippingMethod1 + ' -- ' + all_data[index].shippingCost1 + ' NxT</dd>' +
				'<dt>Shipping Method 2</dt>' +
				'<dd>' + all_data[index].shippingMethod2 + ' -- ' + all_data[index].shippingCost2 + ' NxT</dd>' +
				'<dt>Shipping Method 3</dt>' +
				'<dd>' + all_data[index].shippingMethod3 + ' -- ' + all_data[index].shippingCost3 + ' NxT</dd>'
			);
			$('html, body').animate({
        			scrollTop: $('#show_listing_div').offset().top
    			}, 500);

		}

	});

    //client initiated a login attempt
	$('#nxt_submit').click(function(){
		var data = { pass: $('#pass').val() }; console.log('emitting');
		socket.emit('login', data);
	});

	});
