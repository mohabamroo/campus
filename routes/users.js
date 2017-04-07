var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require("path");
var userUploadsPath = path.resolve(__dirname, "user_uploads");
var User = require('../models/user');
var Club = require('../models/club');
var Tag = require('../models/tag');
var Member = require('../models/member');
var multer  = require('multer');
var mailer = require('express-mailer');
var app = require('../app.js');
var randomstring = require("randomstring");
var storagetype = "screenshot";
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/user_uploads');
  },
  filename: function (req, file, callback) {
  	console.log(file.originalname);
  	console.log
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
    callback(null, newfilename);
    console.log(req.body.photoName);
    var str;
    if(storagetype=="screenshot")
    	str = req.body.photoName.toString();
    if(str==null || str=="")
    	str = filename;
    console.log(str);
    var newphoto = {'name': str, 'src': newfilename};

    User.getUserbyUsername(req.user.username, function(err, user) {
    	if(storagetype=="screenshot") {
			var oldphotos = user.photos;
			oldphotos.push(newphoto);
			User.update({_id:req.user.id}, {$set:{photos:oldphotos, portifolio: "true"}}, function(err, res) {
				if(err)
					console.log(err);
			});
    	} else {
    		if(storagetype=="profilephoto") {
    			var oldphotos = user.photos;
				oldphotos.push(newphoto);
				User.update({_id:req.user.id}, {$set:{profilephoto: newfilename}}, function(err, res) {
				if(err)
					console.log(err);
				});
    		}
    	}
		
	});
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

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

function printError(err) {
	if(err) {
		console.log(JSON.stringify(err));
		throw err;
	}
}

function printResult(result) {
	console.log("Result: " + JSON.stringify(result));
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

router.get('/profile/:id', ensureAuthenticated, function(req, res) {
	if(req.isAuthenticated() && req.user.id == req.params.id) {
		res.render('userViews/profile.html');
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/signin');
	}

});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserbyUsername(username, function(err, user) {
   		if(err)
   			throw err;
   		if(!user) {
   			return done(null, false, {message: 'Unknown User'});
   		}
   	User.validatePassword(password, user.password, function(err, res){
   		if(err)
   			throw err;
   		if(res==true){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
	// saves user in req
	done(null, user.id);

});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });

});

router.post('/signin', passport.authenticate('local', {
  	successRedirect: '/',
    failureRedirect: '/users/signin'
	}), function(req, res) {

});

router.get('/signin', function(req, res) {
	res.locals.pagetitle = 'Sign In';
	res.render('sign_in.html', {
		selectedType: "users"
	});

});

router.get('/signup', function(req, res) {
	res.locals.pagetitle = 'Sign In';
	res.render('sign_up.html');

});

router.post('/signup', function(req, res) {
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;
	var username = req.body.username;
	var type = req.body.type;
	var gucid = req.body.gucid;
	var major = req.body.major || "none";
	var year = req.body.year;
	var birthdate = req.body.birthdate;
	console.log(type);
	req.checkBody('name', 'Name is empty!').notEmpty();
	req.checkBody('email', 'Email is empty!').notEmpty();
	req.checkBody('password', 'Password is empty!').notEmpty();
	req.checkBody('username', 'Username is empty!').notEmpty();
	req.checkBody('type', 'Type is not chosen!').notEmpty();
	if(password != null && confirmpassword != null) {
		req.checkBody('confirmpassword', 'Passwords do not match!').equals(req.body.password);
	}
	errors = req.validationErrors();

	if(errors) {
		errors.forEach(function(error) {
			console.log(error.msg);
		});
		res.render('sign_up.html', {
			errors: errors
		});
	} else {
		User.getUserbyUsername(username, function(err, findRes) {
			printError(err);
			console.log("inside get")
			if(findRes!=null) {
				console.log('found username')
				req.flash('error_msg', 'Duplicate Username!');
				res.redirect('/users/signup');
			} else {
				var rand = randomstring.generate();
				var newUser = new User({
					name: name,
					email: email,
					gucid: gucid,
					username: username,
					password: password,
					usertype: type,
					birthdate: birthdate,
					links: [],
					summary: "No summary.", 
					phone: "No phone",
					major: major,
					year: year,
					profilephoto: "default-photo.jpeg",
					organizations: [],
					verificationCode: rand,
					tags: []
				});

				User.createUser(newUser, function(err, user) {
					printError(err);
    				var host = req.get('host');
    				var link = "http://"+req.get('host')+"/users/verify/"+user.id+"/"+rand;
					app.mailer.send('email', {
				      to: email,
				      subject: 'Community-<DON\'T REPLY> Email Verification',
				      link: link,
				      name: username
				    }, function (errEmail) {
				      if (err) {
				      	console.log('There was an error sending the email');
				        printError(errEmail);
				      } else {
				      	console.log('Email Sent');
				      }
				    });
				   	console.log('before club')
					if(type=="club") {
						console.log("inside if")
						var newClub = new Club({
							name: name,
							password: user.password,
							userid: user.id,
							alias: '',
							email: email,
							photos: [],
							summary: 'no summary',
							logo: '',
							phone: '',
							president: "",
							newDepartments: [],
							events: []
						});
						newClub.save(function(err, clubRes) {
							printError(err);
							printResult(clubRes);
							console.log("saved ")
							res.locals.pagetitle = 'Sign In';
							req.flash('success_msg','You signed up successfully!');
							res.redirect('/users/signin');
						})
					} else {
						res.locals.pagetitle = 'Sign In';
						req.flash('success_msg','You signed up successfully!');
						res.redirect('/users/signin');
					}
						
				});
			}
		});
		
			
	}

});

router.get('/signout', function(req, res){
	if(req.isAuthenticated()){
		req.logout();
	} else {
		req.flash('error_msg','You are not logged in');
	}

	req.flash('success_msg', 'You are signed out');
	res.redirect('/users/signin');

});

router.get('/verify/:userID/:code', function(req, res) {
	var userID = req.params.userID;
	var code = req.params.code;
	User.getUserById(userID, function(err, resuser) {
		printError(err);
		if(resuser!=null) {
			if(resuser.verificationCode===code) {
				User.update({_id: userID}, {$set: {verificationCode: "XwPp9xazJ0ku5CZnlmgAx2Dld8SHkAe"}},
					function(err2, updateRes) {
						printError(err2);
						printResult(updateRes);
						req.flash('success_msg','Your email is verified!');
						res.redirect('/users/signin');
				});
			} else {
					req.flash('error_msg','Wrong verification code!');
					res.redirect('/users/signin');
			}
		} else {
			req.flash('error_msg','No such user!');
			res.redirect('/users/signin');
		}
	});

});

router.post('/addlink', ensureAuthenticated, function(req, res) {
	if(req.body.reponame!="" && req.body.url!="") {
		var newlink = {name: req.body.reponame, url: req.body.newlink};
		User.getUserbyUsername(res.locals.user.username, function(err, user) {
			var oldlinks = user.links;
			oldlinks.push(newlink);
			User.update({_id:res.locals.user.id}, {$set:{links:oldlinks, portifolio: "true"}}, function(err, res) {
			if(err)
				console.log(err);
			});
		});	
	} else {
		req.flash("error_msg", "Fill all the fields!")
	}
	res.redirect('/users/profile/'+req.user.id);
	res.send(res.locals.user.username);

});

router.post('/addTags', ensureAuthenticated, function(req, res) {
	if(req.body.tags!="") {
		var tagsStr = req.body.tags;
		var tagsArr = tagsStr.split(', ');
		User.getUserbyUsername(res.locals.user.username, function(err, user) {
			var oldTags = user.tags;
			tagsArr.forEach(function(tag) {
				User.update({_id:res.locals.user.id}, {$push: {tags: tag}}, function(err1, ress) {
					if(err)
						console.log(err1);
				});
				var userToAdd = {name: user.username, profileid: user.id, photo: user.profilephoto};
				Tag.getTagbyTagname(tag, function(err2, tagres) {
					if(tagres!=null) {
						Tag.update({_id: tagres.id}, {$push: {users: userToAdd}}, function(errpush, pushRes) {
							if(errpush)
								throw errpush;
						});
					} else {
						var newTag = new Tag({tag: tag, users: [userToAdd]});
						Tag.createTag(newTag, function(err3, resnewtag) {
							if(err3)
								throw err3;
							else
								console.log(resnewtag);
						});
					}
				});
			});
		});	
	} else {
		req.flash("error_msg", "Fill all the fields!")
	}
	res.redirect('/users/profile/'+req.user.id);	

});

router.post('/deletelink/:link', ensureAuthenticated, function(req, res) {
	var url = req.params.link;
	User.update({_id: req.user.id},
		{$pull: {
		   		'links': {url: url}
		   	}}, function(err, pullRes) {
		   		if(err) {
			  		console.log("Error:\n" + err);
			  		throw err;
			  	} else {
			  		console.log("Deleted link!\n" + JSON.stringify(pullRes));
			  	}
	});
	res.redirect('/users/profile/'+req.user.id);	

});

router.post('/addscreenshot', ensureAuthenticated, function(req,res) {
	storagetype = "screenshot";
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/users/profile/'+req.user.id);
    });

});

router.post('/deletescreenshot/:screenshot', ensureAuthenticated, function(req, res) {
	var url = req.params.screenshot;
	User.update({_id: req.user.id},
		{$pull: {
		   		'photos': {src: url}
		   	}}, function(err, pullRes) {
		   		if(err) {
			  		console.log("Error:\n" + err);
			  		throw err;
			  	} else {
			  		console.log("Deleted screenshot!\n" + JSON.stringify(pullRes));
			  	}
	});
	res.redirect('/users/profile/'+req.user.id);	

});

router.post('/search', function(req, res) {
	var searchterm = req.body.searchusername;
	search(req, res, searchterm);
	
});

router.get('/searchShort/:searchterm', function(req, res) {
	search(req, res, req.params.searchterm);
});

function search(req, res, searchterm) {
	var usersFound = [];
	User.getUserbyUsername(searchterm, function(err, user) {
		if(err)
			console.log('err: '+err);
		else {
			if(user!=null)
				usersFound.push(user);
			Tag.getTagbyTagname(searchterm, function(err, tagres) {
				if(err)
					throw err;
				else {
					if(tagres!=null) {
						var counter = tagres.users.length;
						if(counter>0)
							tagres.users.forEach(function(userintaglist) {
								User.getUserById(userintaglist.profileid, function(err2, userobj) {
									if(err2)
										throw err2;
									else
										if(userobj!=null) {
											console.log("java:\n"+userobj);
											usersFound.push(userobj);	
										}
										counter--;
										console.log(counter)
										if(counter==0) {
											res.render('searchresults.html', {
														'users': usersFound
											});
										}
								});
							});
						else {
							res.render('searchresults.html', {
								'users': usersFound
							});
						}
					} else {
						res.render('searchresults.html', {
							'users': usersFound
						});
					}	
				}
			});
		}
	});
}

router.get('/viewprofile/:id', function(req,res) {
	User.getUserById(req.params.id, function(err, resuser) {
		if(err) {
			console.log(err);
			throw err;
		}
		else {
			var Bdate = resuser.birthdate;
		    var Bday = +new Date(Bdate);
		    var Q4A = ~~ ((Date.now() - Bday) / (31557600000));
			console.log(Q4A);
			if(resuser.usertype=="student") {
				res.render('viewprofile.html', {
					dude : resuser, age: Q4A
			   	});
			} else {
				if(resuser.usertype=="club") {
					res.redirect('/clubs/viewClub/'+req.params.id);
				} else {
					if(resuser.usertype==="admin") {
						console.log("admin")
						res.redirect('/users/admin');
					}
				}
			}
		}			
	});
    
});

router.get('/admin', ensureAdmin, function(req, res) {
	res.render('admin.ejs');
});

router.post('/updateProfilePhoto', ensureAuthenticated, function(req, res) {
	storagetype = "profilephoto";
	upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/users/profile/'+req.user.id);
    });

});

router.post('/saveChanges', ensureAuthenticated, function(req, res) {
	var phone = req.body.phone;
	var email = req.body.email;
	var summary = req.body.userDesc;
	var major = req.body.major;
	var year = req.body.year;
	var birthdate = req.body.birthdate;
	var gender = req.body.gender;
	User.update({_id:req.user.id},
		{$set: 
			{	phone: phone,
				email: email,
				summary: summary,
				year: year,
				major: major,
				birthdate: birthdate,
				gender: gender
			}}, function(err, updateRes) {
					printError(err);
					printResult(updateRes);
	});
	res.redirect('/users/profile/'+req.user.id);

});

router.post('/deleteOrganization/:memberID', ensureAuthenticated, function(req, res) {
	var memberID = req.params.memberID;
	Member.remove({_id: memberID}, function(err, deleteRes) {
		printError(err);
		printResult(deleteRes);
		res.json("ok");
	});

});

router.post('/addOrganization', ensureAuthenticated, function(req, res) {
	var organizationName = req.body.name;
	var role = req.body.role;
	var departmentName = req.body.department;
	var comment = req.body.comment || "no comment";
	var newOrganization = {
		name: organizationName,
		role: role,
		review: "no review",
		rating: "no rating",
		comment: comment
	}
	User.update({_id: req.user.id}, {$push: {
		organizations: newOrganization
	}}, function(err, updateRes) {
		printError(err);
		printResult(updateRes);
	});
	var newMember = new Member({
			profileId: req.user.id,
			exists: "true",
			rating: "0",
			review: "self-added",
			profilephoto: "default-photo.jpeg",
			role: role,
			club: organizationName,
			departmentName: departmentName
		});
	Member.createMember(newMember, function(err, createRes) {
		printError(err);
		printResult(createRes);
		res.redirect('/users/profile/'+req.user.id);
	});

});

router.post('/getOrganizations/:userID', function(req, res) {
	var userID = req.params.userID;
	Member.getMembersByProfileID(userID, function(err, myMembers) {
		printError(err);
		if(myMembers!=null && myMembers.length>0) {
			res.json(myMembers);
		} else {
			res.json([]);
		}
	});

});

router.post('/editCommentOf/:memberID/:newComment', ensureAuthenticated, function(req, res) {
	var memberID = req.params.memberID;
	var newComment = req.params.newComment;
	console.log("memberID: "+memberID)
	var jsonData = {};
	jsonData.edited = "false";
	Member.update({_id: memberID}, {$set: {comment: newComment}} ,function(err, updateRes) {
		printError(err);
		printResult(updateRes);
		jsonData.edited = "false";
		if(updateRes.nModified!=0) {
			jsonData.edited = "true";
			jsonData.comment = newComment;
		}
		res.json(jsonData);

	});

});

module.exports = router;