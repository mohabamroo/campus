var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Club = require('../models/club');
var sendmail = require('sendmail')();
var mailer = require('express-mailer');
var app = require('../app.js');
console.log("my app")
console.log(app)
mailer.extend(app, {
  from: 'communityguc@gmail.com',
  host: 'smtp.gmail.com', // hostname 
  secureConnection: true, // use SSL 
  port: 465, // port for secure SMTP 
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts 
  auth: {
    user: 'communityguc@gmail.com',
    pass: 'community1234567890'
  }
});
router.get('/', function(req, ress) {
	app.mailer.send('email', {
      to: 'mohabamr1@gmail.com, mohab.abdelmeguid@student.guc.edu.eg', // REQUIRED. This can be a comma delimited string just like a normal email to field.  
      subject: 'final', // REQUIRED. 
      otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables. 
    }, function (err) {
      if (err) {
        // handle error 
        console.log(err);
        console.log('There was an error sending the email');
        return;
      }
      console.log('Email Sent');
    });
    sendmail({
	    from: 'communityguc@gmail.com',
	    to: 'mohabamr1@gmail.com, mohab.abdelmeguid@student.guc.edu.eg',
	    subject: 'test sendmail without pass',
	    html: 'Mail of test sendmail ',
	  }, function(err, reply) {
	    console.log(err && err.stack);
	    console.dir(reply);
	});
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