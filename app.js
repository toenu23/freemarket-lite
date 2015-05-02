/**************************************************************
                        2015 FreeMarketLite
**************************************************************/
/**
 * Module dependencies.
 **/
debug = true;

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

// Pass through to FM core
app.post('/nxtpass', function(req,res) {

  request.post(fmUrl, {form : req.body}, function(e){
    if(e) console.log(e);
  }).pipe(res);

});

httpApp.get('*', function(req, res) {
    res.redirect('https://www.freemarketlite.cc'+req.url)
});

/**
 *socket.io
 **/
io.sockets.on('connection', function(socket) {

    console.log('connection from ' + socket.request.connection.remoteAddress);

	/*
         * FMLite Reputation System
         */
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

});

////END SOCKET.IO


/**
 * API
 **/
//Return JSON-formatted string of all current FreeMarket listings

app.get('/all_listings', function(req, res) {
    //res.send(listings); TODO
});
