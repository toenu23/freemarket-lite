
/*
 * Rate a Vendor.
   db entries have the form:
   { address, stars, listing_id, feedback, item_title }
 */

var mongode = require('mongode');
var db = mongode.connect("mongodb://127.0.0.1:27017/test");

var ERROR = {
    NOT_ENOUGH_DATA: "Error. Please submit a vendor address, feedback, and a star rating."
}
var SUCCESS_RESULT = {
    SUCCESS: "Success"
}
var rating_db = db.collection('rating_db');

exports.rateUser = function (addr, feedback, numStars, listing_id, item_title, finalCallback) {
    addr = addr.toString();
    feedback = feedback.toString();
	var stars;
	switch(numStars){
		case "one":
			stars = 1;
			break;
		case "two":
			stars = 2;
			break;
		case "three":
			stars = 3;
			break;
		case "four":
			stars = 4;
			break;
		case "five":
			stars = 5;
			break;
		default:
			stars = "null";
			break;
	}
    stars = Number(stars); //1 <= stars <= 5
	listing_id = listing_id.toString();
	item_title = item_title.toString();

	if (addr && feedback && stars && listing_id && item_title) {
		if(stars < 1 || stars > 5)
			finalCallback({err: ERROR.NOT_ENOUGH_DATA});
		else{
			var rating = {
				address: addr,
				feedback: feedback,
				stars: stars,
				listing_id: listing_id,
				item_title: item_title
			};
			rating_db.insert(rating, function (err, object) {

				if (err) {//errors
					console.log("couldn't rate user: " + err);
					finalCallback({ err: err }); //return error
				}
				else {//no errors
					finalCallback({ result: SUCCESS_RESULT.SUCCESS }); //return
				}

			});
		}
	}
	else{
		finalCallback({err: ERROR.NOT_ENOUGH_DATA});
	}
}

