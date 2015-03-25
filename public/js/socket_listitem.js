isNumeric = function(obj) {
        return !$.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
    }


$(document).ready(function() {
    console.log('in socket_listitem and ready');
    $('#submit').show();
    var socket = io.connect('https://freemarketlite.com:443', {
        secure: true
    });
    var errors = [];


    /**
     *socket.io
     **/
    socket.on('listing_complete', function(data) {
        bootbox.alert(data.message + ' You may need to refresh the page to be able to submit your item again.');
    });


    $('#submit').on('click', function() {

        $('#errors').empty();
        errors = [];

        /*Get All Values*/
        /***	 '*' --required***/
        var image_url = $('#image_url').val();
        var title = $('#title').val(); //*
        var description = $('#description').val(); //*
        var price = $('#price').val(); //*
        var category = $('#category').val();
        var tag1 = $('#tag1').val();
        var tag2 = $('#tag2').val();
        var tag3 = $('#tag3').val();
        var shipping_method_1 = $('#shipping_method_1').val();
        var shipping_price_method_1 = $('#shipping_price_method_1').val();
        var shipping_method_2 = $('#shipping_method_2').val();
        var shipping_price_method_2 = $('#shipping_price_method_2').val();
        var shipping_method_3 = $('#shipping_method_3').val();
        var shipping_price_method_3 = $('#shipping_price_method_3').val();
        var passphrase = $('#passphrase').val(); //*

        /*Check for Required Fields*/
        if (title == "")
            errors.push("Please Enter a Title");
        if (description == "")
            errors.push("Please Enter a Description");
        if (category == "")
            category = "Everything Else";
        if (isNumeric(price) == false || Number(price) <= 0 || price.toString().indexOf("e") > -1)
            errors.push("Please enter a valid decimal price");
        if (passphrase == "")
            errors.push("Please Enter your Secret Key");

        /*If errors...*/
        if (errors.length > 0) {
            for (var i = 0; i < errors.length; i++) {
                $('#errors').append('<p style="color:red;">' + errors[i] + '</p>');
            }

        }
        /*If not...*/
        else {
            $('#submit').hide(); //disable submit button
            var data = {
                "requestType": "listItem",
                "item_title": title,
                "category1": category,
                "item_tag1": tag1,
                "item_tag2": tag2,
                "item_tag3": tag3,
                "price": Number(price) * 100000000,
                "item_description": description,
                "main_image_url": image_url,
                "shippingMethod1": shipping_method_1,
                "shippingCost1": shipping_price_method_1,
                "shippingMethod2": shipping_method_2,
                "shippingCost2": shipping_price_method_2,
                "shippingMethod3": shipping_method_3,
                "shippingCost3": shipping_price_method_3,
                "usersSecretPhrase": passphrase
            };

            socket.emit('list_new_item', data);



        }

    });


});
