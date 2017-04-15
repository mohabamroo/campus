var express = require('express');
var router = express.Router();
var Offer = require('../models/offer');
var multer  = require('multer');

var offerStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/offers_uploads');
  },
  filename: function (req, file, callback) {
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
  	createOfferHelper(req, newfilename, callback);
    callback(null, newfilename);
  }
});

var offerUpload = multer({storage : offerStorage}).single('offerPhoto');

function ensureAuthenticated(req, res, next){	
	if(req.isAuthenticated()) {
		console.log("code: "+req.user.verificationCode)
		if(req.user.verificationCode==="XwPp9xazJ0ku5CZnlmgAx2Dld8SHkAe") {
			return next();
		} else {
			req.flash('error_msg','You are not verified!');
			res.redirect('/users/signin');
		}
	} else {
		req.flash('error_msg','You are not logged in!');
		res.redirect('/users/signin');
	}
}

function ensureAdmin(req, res, next) {
	if(req.isAuthenticated()) {
		console.log("code: "+req.user.verificationCode)
		if(req.user.verificationCode==="X3PpQxaOJ0k95CjnlmgAx2DXm8yHkAR") {
			return next();
		} else {
			req.flash('error_msg','You are not verified!');
			res.redirect('/users/signin');
		}
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/signin');
	}
}

function printError(err) {
	if(err) {
		console.log(JSON.stringify(err));
		throw err;
	}
}

function printResult(result) {
	console.log("Result: " + JSON.stringify(result));
}

function createOfferHelper(req, newfilename, callback) {
	var company = req.body.name;
	var summary = req.body.summary;
	var type = req.body.type;
	var description = req.body.description;
	var fromDate = req.body.fromDate;
	var toDate = req.body.toDate;
	var newOffer = new Offer({
		company: company,
		summary: summary,
		type: type,
		from: fromDate,
		to: toDate,
		description: description,
		photo: newfilename
	});
	Offer.createOffer(newOffer, function(err, offer) {
		printError(err);
		printResult(offer);
	});
}


router.get('/', ensureAuthenticated, function(req, res) {
	res.render('offerViews/offersIndex.html');

});

router.get('/viewOffers/:type', ensureAuthenticated, function(req, res) {
	var type = req.params.type;
	Offer.find({type: type}, function(err, offers) {
		printError(err);
		res.json(offers);
	});
});

router.get('/addOffer', ensureAdmin, function(req, res) {
	res.render('offerViews/addOffer.html');

});

router.post('/addOffer', ensureAdmin, function(req, res) {
	offerUpload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('../users/viewprofile/'+req.user.id);
    });
});

router.get('/getOffer/:id', ensureAuthenticated, function(req, res) {
	var offerID = req.params.id;
	Offer.findById(offerID, function(err, offer) {
		printError(err);
		res.json(offer);
	});
});

module.exports = router;