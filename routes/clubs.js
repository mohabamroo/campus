var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var path = require("path");
var flash = require('connect-flash');
var clubUploadsPath = path.resolve(__dirname, "club_uploads");
var Club = require('../models/club');
var User = require('../models/user');
var Event = require('../models/event');
var multer  = require('multer');
var storagetype = "logo";
var clubStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/club_uploads');
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
    if(str==null || str=="")
    	str = filename;
    console.log(str);
    if(storagetype==="logo") {
	    Club.update({userid: req.user.id}, {$set: {logo: newfilename}}, function(err, res) {
	    	if(err) {
	    		console.log("Error:\n" + err);
	    		throw err;
	    	} else {
	    		console.log(JSON.stringify(res));
	    	}
	    });	
    }
    
  }
});
var clubUpload = multer({ storage : clubStorage}).single('userPhoto');

function ensureAuthenticated(req, res, next){	
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/signin');
	}
}

router.get('/', function(req, res) {
	Club.find(function(err, clubs) {
		if(err) {
			console.log(err);
			throw err;
		} else {
			res.render('clubViews/allClubs.html', {clubs: clubs});
		}
	});
});

router.get('/editStructre/:id',  function(req, res) {
	if(req.isAuthenticated() && req.user.id == req.params.id) {
		Club.getClubByUserId(req.user.id, function(err, club) {
			presidentRes = club.president;
			departmentsRes = club.departments;
			res.render('clubViews/editClubStructre.html', {
				clubRes: club
			});
		});
	} else {
		req.flash('error_msg', 'You are not logged in');
		console.log(req.error_msg);
		res.redirect('/users/signin');
	}

});

router.post('/addpresident', function(req, res) {
	var presidentName = req.body.presidentName;
	var presidentID = req.body.presidentID;
	var newpresident = {name: presidentName, id: presidentID, profileId: "none", exists: "false"};
	console.log('ss');
	Club.getClubByUserId(req.user.id, function(err, club) {
		console.log(club);
		console.log(req.user.id);
		Club.update({userid:req.user.id}, {$set:{president: newpresident}}, function(err, res) {
				if(err)
					console.log(err);
			});
	});
	res.redirect('/users/editStructre/'+req.user.id)

});

router.post('/addMember/:departmentName', function(req, res) {
	console.log('query: '+req.params.departmentName);
	var departmentName = req.params.departmentName;
	var memberName = req.body.memberName;
	var memberID = req.body.memberID;
	var newMember = {name: memberName, id: memberID, profileId: "none", exists: "false"};
	console.log(req.user.id);
	Club.findOne(
		{"departments.name": departmentName}, 
		{_id: 0, departments: {$elemMatch: {name: departmentName}}}, function(err, res) {
			console.log("res: "+res.departments[0].id);
			var findStr = 'departments.id';
		    var updateStr = 'departments.'+res.departments[0].id+'.members';
		    console.log(findStr);
		   	Club.update({'departments._id': res.departments[0].id}, {$push: {
		   		'departments.$.members': newMember
		   	}}, function(err, res) {
		   		console.log("update res: "+JSON.stringify(res));
		   	});
		});
	res.redirect('/clubs/editStructre/'+req.user.id);
	
});

router.post('/addDepartment', ensureAuthenticated, function(req, res, next) {
	var departmentName = req.body.departmentName;
	var headID = req.body.headID;
	var departmentHead = req.body.departmentHead;
	var newDepartment = {name: departmentName, 
		head: {	name: departmentHead,
				id: headID,
				profileId: "none",
				exists: "false"
			},
			members: []};
	Club.getClubByUserId(req.user.id, function(err, club) {
		console.log(club);
		console.log(req.user.id);
		if(club.president==null) {
			console.log("Null president: "+club.president);

			req.flash('error_msg','You have to add president first!');
			next();
			return;
		}
		var oldDepartments = club.departments;
		oldDepartments.push(newDepartment);
		Club.update({userid:req.user.id}, {$push:{departments: newDepartment}}, function(err, res) {
				if(err)
					console.log(err);
			});
	});
	res.redirect('/clubs/editStructre/'+req.user.id);

});


router.post('/updateLogo', ensureAuthenticated, function(req, res) {
	storagetype = "logo";
    clubUpload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/clubs/editStructre/'+req.user.id);
    });

});

router.post('/deleteDepartment/:depID', ensureAuthenticated, function(req, res) {
	var depID = req.params.depID;
	console.log(depID);
	Club.update({'departments._id': depID},
		{$pull: {
		   		'departments': {_id: depID}
		   	}}, function(err, pullRes) {
		   		if(err) {
			  		console.log("Error:\n" + err);
			  		throw err;
			  	} else {
			  		console.log("Deleted Department!\n" + JSON.stringify(pullRes));
			  		req.flash('success_msg', 'Deleted Department successfully!');
			  		console.log("Success:" + req.success_msg);
			  	}
		   	});
    res.redirect('/clubs/editStructre/'+req.user.id);

});

// links members with their profiles
// needs to be debugged!!
router.post('/updateMembers', ensureAuthenticated, function(req, res) {
	Club.getClubByUserId(req.user.id, function(err, club) {
		var oldPresident = club.president;
		User.getUserByGucId(oldPresident.id, function(err, presidentRes) {
			console.log("presidentRes: " + presidentRes);
			if(presidentRes!=null) {
				var newPresident = {
					name: presidentRes.name,
					id: oldPresident.id,
					exists: "true",
					profileId: presidentRes.id
				}
				Club.update({userid:req.user.id}, {$set:{president: newPresident}}, function(err, clubres) {
					console.log("clubres :" + res);
					if(err)
						console.log(err);
				});
				var newOrganization = {
					name: club.name,
					rating: "0",
					review: "",
					role: "president"
				}
				User.update({id: presidentRes.id}, {$push: {organization: newOrganization}});
			}
		});

		club.departments.forEach(function(department) {
			department.members.forEach(function(member) {
				User.getUserByGucId(member.id, function(err, user) {
					console.log("member: " + user);
					if(user!=null) {
						var newMember = {
							name: user.name,
							id: member.id,
							exists: "true",
							profileId: user.id
						}
						Club.update({'departments._id': department.id},
							{$pull: {
							   		'departments.$.members': {id: member.id}
							   	},
							$push: {
								'departments.$.members': newMember
							}}, function(err, pullRes) {
							   		if(err) {
								  		console.log("Error:\n" + err);
								  		throw err;
								  	} else {

								  	}
						});
						
						var newOrganization = {
							name: club.name,
							rating: "0",
							review: "",
							role: "president"
						}

						User.update({id: user.id}, {$push: {organization: newOrganization}});
					}
				});
			});
		});
	});
	res.render('clubViews/editClubStructre.html');
	
});

router.get('/addEvent', ensureAuthenticated, function(req, res) {
	res.render('clubViews/addEvent.html');
});

router.post('/addEvent', ensureAuthenticated, function(req, res) {
	var name = req.body.name;
	var fromDate = req.body.fromDate;
	var fromTime = req.body.fromTime;
	var toDate = req.body.toDate;
	var toTime = req.body.toTime;
	var description = req.body.description;
	var location = req.body.location;
	var type = req.body.type || "public";
	var newEvent = new Event({
		name: name,
		fromDate: fromDate,
		fromTime: fromTime,
		toDate: toDate,
		toTime: toTime,
		location: location,
		description: description,
		type: type,
		logo: "event-default.jpg"
	});
	Event.createEvent(newEvent, function(err, eventres) {
		if(err) {
			console.log(err);
			throw err;
		} else {
			console.log(res);
			Club.update({userid: req.user.id}, {$push: {events: eventres._id}});
		}
	});
	res.redirect('/users/profile/'+req.user.id);
});

router.post('/addscreenshot', ensureAuthenticated, function(req,res) {
	storagetype = "screenshot";
    clubUpload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/users/profile/'+req.user.id);
    });

});

router.post('/search', function(req, res) {
	// res.send(req.body.searchusername);
	User.getUserbyUsername(req.body.searchusername, function(err, user) {
		if(err)
			console.log('err: '+err);
		else {
			console.log(req.url);
			//req.url = req.headers.host;
			console.log(req.url);
			res.render('searchresults.html', {
				'usersearchedfor': user
			});
		}
			

	});

});


router.post('/updateSummary', ensureAuthenticated, function(req, res) {
	console.log(req.body.userDesc);
	User.update({_id:req.user.id}, {$set:{summary:req.body.userDesc}}, function(err, res) {
		if(err)
			console.log(err);
	});
	res.redirect('/users/profile/'+req.user.id);

});

router.post('/updateProfilePhoto', function(req, res) {
	storagetype = "profilephoto";
	upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/users/profile/'+req.user.id);
    });

});

module.exports = router;