//production
var debug = false;
var socket = undefined;

$(document).ready(function() {
  console.log('socket_logic ready');
  if(debug)
  {
    socket = io.connect('http://127.0.0.1:8008');
  }
  else
  {
    socket = io.connect('https://www.freemarketlite.cc:443', { secure: true });
  }

	socket.on('updateListings', function(data) {
        if (data.message.errno) {
            $('#loading').hide();
            $('#listing_table').hide();
	    $('#show_listing_div').empty();
            $('#show_listing_div').append('Oops! Something went wrong  :( <br /> ' + data.message.errno);
        } else if(data.message) {
            var myData = JSON.parse(data.message);
            $('#loading').hide();
            $('#listing_table').show();
            $('#all_listings').empty();

            for (var i = 0; i < myData.items.length; i++) {

                $('#all_listings').append(
                    '<tr id="' + myData.items[i].listing_id + '">' +
                    '<td class="col-md-3 listing">' + myData.items[i].listing_id + '</td>' +
                    '<td class="col-md-3">' + myData.items[i].item_title + '</td>' +
                    '<td class="col-md-3">' + Number(myData.items[i].price) / 100000000 + ' NXT</td>' +
                    '<td class="col-md-3">' + myData.items[i].category1 + '</td>' +
                    '</a></tr>'
                );
            }
            all_data = myData.items;
           
           if ( $( "#listing_table" ).length ) {
	           $('#listing_table').dataTable().fnDestroy();
	           var table = $('#listing_table').DataTable( {
	           	"bLengthChange": false,
	           	 "bSort" : false,
	           	 "responsive" : {
				 	details: false
				 },
				 "oLanguage": { "sSearch": "" } 
	           });
	           
	           $('.dataTables_filter input').attr("placeholder", "Search");
           }
        }
    });


    socket.on('loginResponse', function(data) {
        if (data) {
        	
        	bootbox.dialog({
        		title: 'Your account',
        		message:
        			'<table class="table"><tbody>'+
        			'<tr><td style="border-top:0px;">Account ID</td><td style="border-top:0px;">'+ data.accountRS + '</td>'+
	                '<tr><td>Balance</td><td>' + data.balance + ' NXT</td>'+
	                '</tbody></table>'
        	});
        }

    });

    socket.on('singleItem', function(data) {
        data = JSON.parse(data);
        buyItem(data);

    });


    socket.on('buyItemResult', function(data) {

        if (data.query_status == 'good') {
            bootbox.alert('Success! TxId:' + data.txid);
        } else if (data.query_status == 'bad') {
            bootbox.alert('Buy Item failed');
        } else if (data.query_status == "not enough funds") {
            bootbox.alert("Not enough Funds");
        } else {
            bootbox.alert('Failure');
        }
        $('#show_listing_div').find('#buyBtn').fadeIn();
    });




});
