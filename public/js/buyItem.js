
function doshapeShiftBTC(data){
	
	$.ajax({
  url: "https://shapeshift.io/rate/btc_nxt",
})
  .done(function( shapeRate ) {
	  console.log(JSON.stringify(data));
	var rate = shapeRate.rate;
	//var btcPrice = parseFloat(listing.price/(100000000*rate)).toFixed(8);
	//var nxtPrice = parseFloat(listing.price/(100000000)).toFixed(8);
	var rs = data.accountRS;
	var pubkey = data.publicKey;
	$.post("https://shapeshift.io/shift",
    {
        withdrawal: rs,
        pair: "btc_nxt",
		rsAddress: pubkey
    },
    function(data, status){
		
        bootbox.dialog({
			title: "ShapeShift.io Bitcoin to NXT conversion",
			message: "Deposit any amount BTC to: <b>" + data.deposit + "</b><br />NXT will be sent to: <b>" + data.withdrawal + "</b><br />1 Bitcoin = <b>" + parseFloat(rate).toFixed(8) + "</b> NXT"   
    });
  
  
  }
  ); //END ajax rate call

  });

    }

	


function buyItem(data){

  if(data.item_status == "Available"){
	bootbox.dialog({
                title: "<center>Purchase Item</center>",
                message:

	                '<table class="table"><tbody>'+
					'<tr><td style="border-top:0px;">Title</td><td style="border-top:0px;">'+ data.item_title +'</td></tr>'+
					'<tr><td>ID</td><td>'+ data.listing_id +'</td></tr>'+
					'<tr><td>Seller</td><td>'+ data.seller_id +'</td></tr>'+
					'<tr><td>Price</td><td>'+ data.price/100000000 +' NXT</td></tr>'+
					'<tr><td>Description</td><td>'+ data.item_description +'</td></tr>'+
					'<tr><td>Status</td><td>Available</td></tr>'+
					'</tbody></table>'+
					'<form class="form" role="form">'+
	                '<div class="form-group">'+
	                '<label for="shippingmethod">Shipping Method</label>'+
	                '<select class="form-control" id="shippingmethod">'+
	                '<option value="1">' + data.shippingMethod1 + ' -- ' + data.shippingCost1 + ' NXT</option>'+
	                '<option value="2">' + data.shippingMethod2 + ' -- ' + data.shippingCost2 + ' NXT</option>'+
	                '<option value="3">' + data.shippingMethod3 + ' -- ' + data.shippingCost3 + ' NXT</option>'+
	                '</select>'+
	                '</div>'+
	                '<div class="form-group>"'+
	                '<label for="deliveryaddress"><b>Delivery Address</b></label>'+
	                '<textarea class="form-control" placeholder="100 characters max." cols="30" rows="3" maxlength="300" id="deliveryaddress"></textarea>'+
	                '</div>'+
	                '<div class="form-group">'+
	                '<label for="secretkey"><b>Secret Key</b></label>'+
					'<input type="password" id="secretkey" class="form-control" />'+
	                '</div>'+
	                '</form>',
					
                buttons: {
                    success: {
                        label: "Buy",
                        className: "btn-success",
                        callback: function () {
			    var shipping = {shippingMethod: "", shippingCost: 0};
                            switch($('#shippingmethod').val()){
				case "1":
				  shipping.shippingMethod = data.shippingMethod1;
				  shipping.shippingCost = data.shippingCost1;
				  break;

				case "2":
				  shipping.shippingMethod = data.shippingMethod2;
				  shipping.shippingCost = data.shippingCost2;
				  break;
			
				case "3":
				  shipping.shippingMethod = data.shippingMethod3;
				  shipping.shippingCost = data.shippingCost3;
				  break;

				default:
				  bootbox.alert("Error parsing shipping method and cost.");
				  return;
				  break;

			    }
			    var listing_id = data.listing_id;
			    var shippingAddress = $('#deliveryaddress').val();
                            var finalPrice = Number(Number(shipping.shippingCost*100000000)+data.price);
			    var quantity = 1;
			    var message = "";
			    var usersSecretPhrase = $('#secretkey').val();

			    if(listing_id=="" || shippingAddress == "" || finalPrice==null || usersSecretPhrase==""){
				bootbox.alert('Please fill out the form completely');
				return;
			    }

                bootbox.confirm('Id: ' + listing_id + 
				'<br />Shipping Method: ' + shipping.shippingMethod + 
				'<br />Delivery Address: '+ shippingAddress + 
				'<br />Final Price: ' + finalPrice/100000000 + ' NXT', 
				function(confirm){
				if(confirm)
					socket.emit('buyItem', {
					  listing_id: listing_id,
					  shippingAddress: shippingAddress,
					  shippingMethod: shipping.shippingMethod,
					  finalPrice: finalPrice,
					  quantity: 1,
					  message: "",
					  usersSecretPhrase: usersSecretPhrase								
					});
					
				else
					bootbox.alert("You have cancelled your buy order");
					return;
				});	
                        }
                    }
                }
            }
        );
}

  else{
	bootbox.alert("Item is no longer Available");
}

    }
