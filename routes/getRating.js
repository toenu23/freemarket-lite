
/*
 * Get a vendor's rating.
   db entries have the form:
   { address, feedback, stars }
 */

var mongode = require('mongode');
var db = mongode.connect("mongodb://127.0.0.1:27017/test");

var ERROR = {
	NOT_FOUND: "Vendor has no ratings",
    NOT_ENOUGH_DATA: "Error. Please submit a vendor address."
}
var SUCCESS_RESULT = {
    SUCCESS: "Success"
}
var rating_db = db.collection('rating_db');

exports.getRating = function (addr, finalCallback) {
    addr = addr.toString();
	if (addr) {
		rating_db.find({address: addr}).toArray(function(err, ratings){
			if (err)
				finalCallback({result: "NOT_FOUND"});
		if(ratings){
			console.log("result: " + JSON.stringify(ratings));
			finalCallback({result: ratings});
		}
    });
	} else {
			console.log('in else');
			finalCallback({err: ERROR.NOT_ENOUGH_DATA});
	}
}

