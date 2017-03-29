var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Club = require('../models/club');

router.get('/', function(req, ress) {
	var people = [];
	User.find(function(err, res) {
		res.forEach(function(person) {
			var str = person.name.toString();
			var pstr;
			if(person.profilephoto)
				pstr = person.profilephoto.toString();
			if(person.usertype!="developer") {
				var link = ""; var photolink = "";
				if(person.links!=null && person.links.length>0)
					link = person.links[0].name;
				if(person.photos!=null && person.photos.length>0)
					photolink = person.photos[0].name;
				person = {name: str, id: person.id, photo: pstr, link: link, photolink: photolink};
				people.push(person);
			}
		});
		ress.render('index.html', {
			people: people
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