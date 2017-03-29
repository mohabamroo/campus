var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Club = require('../models/club');
var Event = require('../models/event');
var multer  = require('multer');
var eventStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/club_uploads/events');
  },
  filename: function (req, file, callback) {
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
  	createEventHelper(req, newfilename, callback);
    callback(null, newfilename);
    var eventName = req.body.name;
  }
});

var eventUpload = multer({ storage : eventStorage}).single('eventPhoto');

function printError(err) {
	if(err) {
		console.log(JSON.stringify(err));
		throw err;
	}
}

function printResult(result) {
	console.log("Result: " + JSON.stringify(result));
}

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
	res.render('eventViews/eventsIndex.html');
})

router.get('/current', function(req, res) {
	var d = new Date();
	var today = d.yyyymmdd();
	var todayint = parseInt(today);
	var events = [];
	var i = 0;
	Event.find( function(err, eventsres) {
		if(eventsres!=null && eventsres.length>0)
			eventsres.forEach(function(event) {
				i++;
				if(event.fromDate!=null&&event.toDate!=null) {
					var fromDate = event.fromDate.toString();
					var fromInt = parseInt(convertDashedDate(fromDate));
					var toDate = event.toDate.toString();
					var toInt = parseInt(convertDashedDate(toDate));
					if((todayint >= fromInt) && (todayint <= toInt)) {
						events.push(event);
					}
				}
				if(i>=eventsres.length)
					res.json(events);
			});
		else		
			res.json(events);
	});
});

router.get('/old', function(req, res) {
	var d = new Date();
	var today = d.yyyymmdd();
	var todayint = parseInt(today);
	var events = [];
	var i = 0;
	Event.find( function(err, eventsres) {
		if(eventsres!=null && eventsres.length>0)
			eventsres.forEach(function(event) {
				i++;
				if(event.fromDate!=null&&event.toDate!=null) {
					var fromDate = event.fromDate.toString();
					var fromInt = parseInt(convertDashedDate(fromDate));
					var toDate = event.toDate.toString();
					var toInt = parseInt(convertDashedDate(toDate));
					if((todayint >= fromInt) && (todayint > toInt)) {
						events.push(event);
					}
				}
				if(i>=eventsres.length)
					res.json(events);
			});
		else		
			res.json(events);
	});
});

router.get('/coming', function(req, res) {
	var d = new Date();
	var today = d.yyyymmdd();
	var todayint = parseInt(today);
	var events = [];
	var i = 0;
	Event.find( function(err, eventsres) {
		if(eventsres!=null && eventsres.length>0)
			eventsres.forEach(function(event) {
				i++;
				if(event.fromDate!=null&&event.toDate!=null) {
					var fromDate = event.fromDate.toString();
					var fromInt = parseInt(convertDashedDate(fromDate));
					var toDate = event.toDate.toString();
					var toInt = parseInt(convertDashedDate(toDate));
					if((todayint < fromInt)) {
						events.push(event);
					}
				}
				if(i>=eventsres.length)
					res.json(events);
			});
		else		
			res.json(events);
	});
});

router.get('/getEvent/:id', function(req, res) {
	var eventId = req.params.id;
	Event.getEventById(eventId, function(err, eventRes) {
		printError(err);
		res.json(eventRes);
	});
})
router.get('/addEvent', ensureAuthenticated, function(req, res) {
	res.render('clubViews/addEvent.html');
});

function createEventHelper(req, filename, callback) {
	var name = req.body.name;
	var fromDate = req.body.fromDate;
	var fromTime = req.body.fromTime;
	var toDate = req.body.toDate;
	var toTime = req.body.toTime;
	var description = req.body.description;
	var location = req.body.location;
	var type = req.body.type || "public";
	var target = req.body.target || "general";
	var newEvent = new Event({
		name: name,
		fromDate: fromDate,
		fromTime: fromTime,
		toDate: toDate,
		toTime: toTime,
		location: location,
		description: description,
		type: type,
		photo: filename,
		target: target,
		organizer: req.user.name
	});
	Event.createEvent(newEvent, function(err, eventres) {
		printError(err);
		printResult(eventres);
		Club.update({userid: req.user.id}, {$push: {events: eventres._id}},
			function(err2, pushRes) {
				printError(err2);
				printResult(pushRes);
		});
	});
}

router.post('/addEvent', ensureAuthenticated, function(req, res) {
	eventUpload(req, res, function(err1) {
	    if(err1) {
		   	printError(err1);
	        return res.end("Error uploading event.\n"+err1);
	    } else {
			res.redirect('/clubs/viewClub/'+req.user.id);
	    }
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