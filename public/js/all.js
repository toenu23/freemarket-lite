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


$(document).ready(function() {
    console.log('all ready');
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
			$('#show_listing_table').append('<tr><td>Seller ID</td><td>' + all_data[index].seller_id + '</td></tr>');
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
