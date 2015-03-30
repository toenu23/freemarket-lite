/**************************************************************
                        2015 FreeMarketLite
**************************************************************/
/**
 * Module dependencies.
 **/
debug = false;

var nxtHost = "http://127.0.0.1";
var nxtPort = 7876;
var fmUrl = "http://127.0.0.1:17776/nxtpass";

if(debug) nxtPort = 6876;
var nxtUrl = nxtHost + ":" + nxtPort + "/nxt";

var express = require('express');
var https = require('https');
var http = require('http');
var path = require('path');
var request = require('request');
var fs = require('fs');

var mongode = require('mongode');
var db = mongode.connect("mongodb://127.0.0.1:27017/test");

var app = express();
var httpApp = express();

var rateUser = require('./routes/rateUser.js');
var getRating = require('./routes/getRating.js');

var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// ssl cert
var sslOptions = {};

if(!debug)
{
  sslOptions = {
    key: fs.readFileSync(__dirname + '/../ssl/freemarketlite.key'),
    cert: fs.readFileSync(__dirname + '/../ssl/freemarketlite_cc.crt'),
    ca: [
        fs.readFileSync(__dirname + '/../ssl/AddTrustExternalCARoot.crt'),
        fs.readFileSync(__dirname + '/../ssl/COMODORSAAddTrustCA.crt'),
        fs.readFileSync(__dirname + '/../ssl/COMODORSADomainValidationSecureServerCA.crt')
    ],
	
    requestCert: true,
    rejectUnauthorized: false
  };
}


// all environments
app.set('port', process.env.PORT || 443); //std https port
if(debug) app.set('port', process.env.PORT || 8008); //std http port

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// all environments
httpApp.set('port', process.env.PORT || 8008); //std http port
httpApp.use(express.favicon());
httpApp.use(express.logger('dev'));
httpApp.use(express.json()); // to support JSON-encoded bodies
httpApp.use(express.urlencoded()); // to support URL-encoded bodies
httpApp.use(express.methodOverride());
httpApp.use(httpApp.router);
httpApp.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
console.log('Welcome to NxT FreeMarket Lite Browser!');

/*
* database
**/
var rating_db = db.collection("rating_db");

/**
 *Create Server and router
 **/

var server = undefined;
if(debug)
{
  server = http.createServer(app);
}
else
{
  server = https.createServer(sslOptions,app);
}

//start socket.io
var io = require('socket.io').listen(server);


server.listen(app.get('port'), function(err, result) {
    console.log('Express server listening on port ' + app.get('port'));
});

if(!debug)
{
  // set up plain http server
  var redirect = http.createServer(httpApp);

  // have it listen on 80
  redirect.listen(80);
}


/**
 *routes
 **/


app.get('/', function(req, res) {
    res.render('all');
});

app.get('/listitem', function(req, res) {
    res.render('listitem');
});

app.get('/ratings/:addr', function(req, res) {
	    res.render("ratings", {address: req.params.addr});
});

app.get('/purchases', function(req, res) {
    res.render('myPurchases');
});

app.get('/rateSeller/:addr/:item/:listing_id', function(req,res){
	res.render('rateSeller', { address: req.params.addr, item_title: req.params.item, listing_id: req.params.listing_id });
});


httpApp.get('*', function(req, res) {
    res.redirect('https://www.freemarketlite.cc'+req.url)
});



/**
 *NxT API
 **/



//Generic function to query Nxt API
var nxtApi = function(op, callback) {
    request(op, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback(error);
        }
    })
}

/**
 *socket.io variables
 **/

//all listings
var listings = {};
// Set the headers
var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}

// Configure the request
var options = {
    url: fmUrl,
    method: 'POST',
    headers: headers,
    form: {
        requestType: 'all_listings'
    }
}

//Get all current FreeMarket listings
var getAllListings = function(callback) {
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback(error);
        }
    })
}

//Delay between updates (1 minute)
var sleepTime = 60 * 1000;

//Infinite loop to update all clients every minute with latest listings.
var updateLoop = function(callback) {
	console.log("in update loop");
    getAllListings(function(data) {
        if (data.errno) {
            io.sockets.emit('updateListings', {
                error: data.errno
            });
            callback(data);
        } else {
            io.sockets.emit('updateListings', {
                message: data
            });
            callback(data);
        }
        console.log('updating listings...');
    });
}

//Run initial update loop
updateLoop(function(data) {
    listings = data;
});

// Run updateLoop every sleepTime milliseconds
setInterval(function() {
    updateLoop(function(data) {
        listings = data;
    });
}, sleepTime);



//Lists an item on the FreeMarket
var listItem = function(options, callback) {
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            callback(error);
        }
    })
}




//on connection, send the new client the latest listings
io.sockets.on('connection', function(socket) {
    console.log('connection from ' + socket.request.connection.remoteAddress);
    socket.emit('updateListings', {
        message: listings
    });

    socket.on('list_new_item', function(data) {

        //LIST NEW ITEM
        if (data.requestType == "listItem" && data.item_title != "" && data.category1 != "" && data.item_description != "" && data.usersSecretPhrase != "") {

            // Configure the request
            var options = {
                url: fmUrl,
                method: 'POST',
                headers: headers,
                form: data
            }

            listItem(options, function(result) { //list the item! :)
                var result = JSON.parse(result);
                var postingResponse = result.query_status;
                if (postingResponse == 'good') {
                    var listingID = result.listing_id;
                    fs.appendFile('./log', 'listed item ' + listingID);
                    socket.emit('listing_complete', {
                        message: "Success! You have posted item number:" + listingID + "."
                    });
                } else {
                    var errorDescription = result.errorDescription;
                    var errorCode = result.errorCode;
                    if (errorCode == 9) {
                        socket.emit('listing_complete', {
                            message: "FAILURE! Your item listing may be too long. Please make your Description or image URL shorter."
                        });
                    } else {
                        socket.emit('listing_complete', {
                            message: "FAILURE! Reason: " + result.query_status
                        });
                    }
                }
            }); //end of listItem


        } else {
            socket.emit('listing_complete', {
                message: "FAILURE! One or more of your required values were not valid."
            });
        }
        //END OF LIST NEW ITEM
    });

	
    socket.on('login', function(password) {
        var account = {};
        // Configure the request
        var nxtOptions = {
            url: nxtUrl,
            method: 'POST',
            headers: headers,
            form: {
                requestType: "getAccountId",
                secretPhrase: password.pass
            }
        }
        nxtApi(nxtOptions, function(data) {
            data = JSON.parse(data);
            account.accountRS = data.accountRS;
            account.account = data.account;
            nxtOptions = {
                url: nxtUrl,
                method: 'POST',
                headers: headers,
                form: {
                    requestType: "getBalance",
                    account: account.account
                }
            }
            nxtApi(nxtOptions, function(data) {
                account.balance = Number(JSON.parse(data).balanceNQT) / 100000000;
                socket.emit('loginResponse', account); //respond with account information
            }); //nxtApi() getbalance callback		


        }); //nxtApi() getaccount callback	

    }); //socket.on('login')



    socket.on('get_listing', function(data) {

        console.log('get listing: ' + data.listing_id);
        var id = String(data.listing_id);
        // Configure the request
        var options = {
            url: fmUrl,
            method: 'POST',
            headers: headers,
            form: {
                requestType: "searchSingleItem",
                listing_id: id.toString()
            }
        }

        nxtApi(options, function(data) {
            socket.emit('singleItem', data);
        }); //nxtApi() getbalance callback		



    });

    ////////////BUY ITEM
    socket.on('buyItem', function(buyData) {

        var account = {};
        // Configure the request
        var nxtOptions = {
            url: nxtUrl,
            method: 'POST',
            headers: headers,
            form: {
                requestType: "getAccountId",
                secretPhrase: buyData.usersSecretPhrase
            }
        };

        console.log('url: ' + nxtUrl);

        nxtApi(nxtOptions, function(data) {
            data = JSON.parse(data);
            account.accountRS = data.accountRS;
            account.account = data.account;
            nxtOptions = {
                url: nxtUrl,
                method: 'POST',
                headers: headers,
                form: {
                    requestType: "getBalance",
                    account: account.account
                }
            }
            nxtApi(nxtOptions, function(data) { //get balance callback
                console.log(JSON.stringify(data) + JSON.stringify(account));
                account.balance = Number(JSON.parse(data).balanceNQT) * 100000000;
                console.log("\n\nbalance is: " + Number(account.balance * 100000000) + "\nfinal price: " + Number(Number(buyData.finalPrice) + Number(400000000)) + "\n");
                if (Number(Number(account.balance) * 100000000) >= Number(Number(buyData.finalPrice) + 100000000)) { //enough balance, initiate buy




                    //////////////////////////////////////buy
                    var listing_id = buyData.listing_id;
                    var shippingAddress = buyData.shippingAddress
                    var shippingMethod = buyData.shippingMethod;
                    var finalPrice = buyData.finalPrice;
                    var quantity = buyData.quantity;
                    var message = buyData.message;
                    var usersSecretPhrase = buyData.usersSecretPhrase;

                    // Configure the buy request

                    var options = {
                        url: fmUrl,
                        method: 'POST',
                        headers: headers,
                        form: {

                            requestType: "buyItem",
                            listing_id: listing_id,
                            shippingAddress: shippingAddress,
                            shippingMethod: shippingMethod,
                            finalPrice: finalPrice,
                            quantity: quantity,
                            message: message,
                            usersSecretPhrase: usersSecretPhrase
                        }

                    }
                    nxtApi(options, function(data) { //buy the item! :)
                        var returned_id = JSON.parse(data).listing_id;
                        fs.appendFile('./log', 'buy fm item ' + listing_id + 'returns: \n' + JSON.stringify(data));
                        if (data.query_status == "bad") { //no good :(
                            socket.emit('buyItemResult', {
                                query_status: 'bad'
                            });
                        } else { //was successful! :)

                            // Configure the send nxt request
                            /*options = {
                                url: 'http://127.0.0.1:7876/nxt',
                                method: 'POST',
                                headers: headers,
                                form: {
                                    requestType: "sendMoney",
                                    secretPhrase: usersSecretPhrase,
                                    recipient: "8487914090854355174",
                                    amountNQT: 300000000,
                                    feeNQT: 100000000,
                                    deadline: 10
                                }
                            }


                            //send nxt for fee
                            nxtApi(options, function(data) {

                                fs.appendFile('./log', '\n\nsend fee returns:' + JSON.stringify(data));

                            }); //nxtApi() send fee callback	*/

                            socket.emit('buyItemResult', {
                                query_status: 'good',
                                txid: returned_id
                            });
                        }

                    }); //end fm buy

                    /////////////////////////////////////endbuy



                } //if enough balance
                else { //not enough balance, failed
                    socket.emit('buyItemResult', {
                        query_status: 'not enough funds'
                    });
                }


            }); //nxtApi() getbalance callback		


        }); //end nxtApi() getaccount callback	
    });

    /////////END BUY
	
	socket.on('getPurchases', function(data){

		//configure the request
		var options = {
			url: fmUrl,
			method: 'POST',
			headers: headers,
			form: {
			requestType: "own_purchases",
			usersSecretPhrase: data.secret
         }

        }
		console.log("about to call getpurchases");
        nxtApi(options, function(data) { //get my purchases
			console.log("getpurchases returned " + JSON.stringify(data));
			socket.emit('getPurchasesResult', data);
		});					
							

		
	});
	
	
	////////FMLite Reputation System
	
	socket.on('rateSeller', function(seller){
		console.log(JSON.stringify(seller));
		/*
			1. check if seller has already been rated for this listing_id
							   actually sold this item
							   item is actually sold already
			2. check if rater actually bought this listing
		*/
	console.log(seller.address + seller.listing_id + seller.stars + seller.item_title + seller.secret);	
		if(seller.feedback.length > 10 && seller.address != "" && seller.item_title != "" && seller.stars != "" && seller.secret != ""){
			console.log('SELLER FEEDBACK LENGTH:' + seller.feedback.length);
			rating_db.findOne({ address: seller.address, listing_id: seller.listing_id }, function (err, item) { //1. see if seller has already been rated for this item
			if(err){
				console.log('error doing db lookup: ' + err);
				socket.emit('rateSellerResponse', {result: err});
			}
			else if(item){
				console.log("item has already been rated");
				socket.emit('rateSellerResponse', {result: "This item has already been rated"});
			}
			else{
				//console.log('no errors finding seller address. ' + JSON.stringify(objects));
						
						//    check if seller really sold this item and its status is 'Sold'
						// Configure the request
						var options = {
							url: fmUrl,
							method: 'POST',
							headers: headers,
							form: {
								requestType: "searchSingleItem",
								listing_id: seller.listing_id.toString()
							}
						}

						nxtApi(options, function(data) {
							data = JSON.parse(data);
							console.log("seller: " + data.seller_id + " status: " + data.item_status);
							if(data.seller_id == seller.address && data.item_status == "Sold"){
								// All good up to this point. now number 2 (confirm the buyer did indeed purchase this item)
								console.log("Seller " + seller.address + " has not already been rated for listing " + seller.listing_id + " and its status is 'Sold'." );

								//configure the request
								var options = {
									url: fmUrl,
									method: 'POST',
									headers: headers,
									form: {
									requestType: "own_purchases",
									usersSecretPhrase: seller.secret
									}
								}
								nxtApi(options, function(purchases) { //get buyer's purchases
									purchases = JSON.parse(purchases);
									if(purchases.query_status == "bad"){
										socket.emit('rateSellerResponse', {result: purchases.errorDescription } );
									}
									else {
									var bought = 0;
									for(var i=0; i < purchases.items.length; i++)
										if(purchases.items[i].listing_id == seller.listing_id)
											bought = 1;
									if(bought == 1){
										//Done Checking. Able to Rate Seller! :)
										console.log("ready!");
										
										rateUser.rateUser(seller.address, seller.feedback, seller.stars, seller.listing_id, seller.item_title, function(result){
											console.log("rated seller. Result: " + JSON.stringify(result));
											socket.emit('rateSellerResponse', result);
										});
										
										
										
										
										
										
										
										
									}
									else //unable to rate seller
										socket.emit('rateSellerResponse', {result: "You did not purchase this listing"});
									}
										
								});		
								
							}
							else
								socket.emit('rateSellerResponse', {result: "The specified account did not sell this item or it is not yet sold."});
		
						}); //nxtApi() getbalance callback
						
				}
			});
		} else{
			socket.emit('rateSellerResponse', {result: "Please enter a feedback of more than 10 characters and a valid secret key"});
		}

	}); //End rateSeller
	
	socket.on('getRatings', function(seller){
		getRating.getRating(seller.address, function(data){
				socket.emit('getRatingsResult', data);
		});
	}); //End getRatings
	//END FMLITE REPUTATION SYSTEM
	
}); //io.sockets.on('connection')

////END SOCKET.IO


/**
 * API
 **/


//Return JSON-formatted string of all current FreeMarket listings

app.get('/all_listings', function(req, res) {
    res.send(listings);
});
