var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Club = require('../models/club');
var Event = require('../models/event');

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

var convertDashedDate = function(datestring) {
	var dateArr = datestring.split("-");
	return dateArr.join("");
}

router.get('/', function(req, res) {
	var d = new Date();
	var today = d.yyyymmdd();
	var todayint = parseInt(today);
	var events = [];
	Event.find({type: "public"}, function(err, eventsres) {
		eventsres.forEach(function(event) {
			var fromDate = event.fromDate.toString();
			var fromInt = parseInt(convertDashedDate(fromDate));
			var toDate = event.toDate.toString();
			var toInt = parseInt(convertDashedDate(toDate));
			if((todayint >= fromInt) && (todayint <= toInt)) {
				events.push(event);
			}
		});
		res.render('eventViews/eventsIndex.html', {
			events: events
		});
	});
	
});

function ensureAuthenticated(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/signin');
	}
}

module.exports = router;