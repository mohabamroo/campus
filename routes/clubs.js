var express = require('express');
var router = express.Router();
var request = require('request');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');
var path = require("path");
var flash = require('connect-flash');
var clubUploadsPath = path.resolve(__dirname, "club_uploads");
var Club = require('../models/club');
var User = require('../models/user');
var Event = require('../models/event');
var Department = require('../models/department');
var Member = require('../models/member');
var Permission = require('../models/permission');
var Rating = require('../models/rating');
var multer  = require('multer');

var logoStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/club_uploads');
  },
  filename: function (req, file, callback) {
  	console.log(file.originalname);
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
    callback(null, newfilename);
    var title = req.body.photoName || newfilename;
	Club.update({userid: req.user.id}, {$set: {logo: newfilename}}, function(err, res) {
    	printError(err);
    	printResult(res);
	    User.update({_id: req.user.id}, {$set: {profilephoto: newfilename}}, function(err1, res1) {
	    	printError(err1);
	    	printResult(res1);
	    });	   
  	});
  }
});
var logoUpload = multer({storage: logoStorage}).single('userPhoto');

var galleryStorage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/club_uploads');
  },
  filename: function (req, file, callback) {
  	console.log(file.originalname);
  	var filename = file.originalname;
  	var arr = filename.split(".");
  	var filetype = arr[arr.length-1];
  	var newfilename = req.user.username + '-' + Date.now()+'.'+filetype;
    callback(null, newfilename);
    var title = req.body.photoName || newfilename;
    Club.update({userid: req.user.id}, {$push: {photos: {name: title, src: newfilename}}}, function(err, res) {
    	printError(err);
    	printResult(res);
	});
  }
});
var galleryUpload = multer({storage: galleryStorage}).single('userPhoto');

function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/signin');
	}
}

function ensureHeadOfMember(memberID, req, res, next) {
	console.log('ensureHead')
	if(req.isAuthenticated())
		Member.getMemberByID(memberID, function(err, member) {
			printError(err);
			if(member!=null)
				Permission.findOne({profileId: req.user.id, departmentID: member.departmentID},
					function(err1, permissionRes) {
						printError(err1);
						if(permissionRes!=null) {
							printResult(permissionRes);
							return;
						} else {
							res.end('Not authorized!');
						}
				});
		});
	else {
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

function printError(err) {
	if(err) {
		console.log(JSON.stringify(err));
		throw err;
	}
}

function printResult(result) {
	console.log("Result: " + JSON.stringify(result));
}

router.post('/ensureAuthenticatedClub/:userID', ensureAuthenticated, function(req, res) {
	var userID = req.params.userID;
	Club.getClubByUserId(userID, function(err, club) {
		printError(err);
		var jsonData = {};
		jsonData.flag = "false";
		if(club.userid==req.user.id) {
			jsonData.flag="true";
		}
		res.json(jsonData);
	});
});

function getDepartmentsEdit(club, presidentRes, events, req, res) {
	var departments = [];
	var i = 0;
	console.log(club.newDepartments.length)
	if(club.newDepartments!=null && club.newDepartments.length>0) {
		club.newDepartments.forEach(function(departmentid) {
			Department.getDepartmentById(departmentid, function(err2, departmentres) {
				printError(err2);
				var currentDepartment = departmentres;
				var j = 0;
				if(departmentres.head!=null && departmentres.head!="") {
					Member.getMemberByID(departmentres.head, function(err4, headRes) {
						printError(err4)
						currentDepartment.head = headRes || {};
						if(departmentres.nestedType!="true") {
							currentDepartment.members = [];
							if(departmentres.members!=null && departmentres.members.length>0) {
								departmentres.members.forEach(function(memberID) {
									Member.getMemberByID(memberID, function(err3, member) {
										j++;
										// printResult(member)
										currentDepartment.members.push(member);
										if(j>=departmentres.members.length) {
											i++;
											departments.push(currentDepartment);
											if(i>=club.newDepartments.length) {
												res.render('clubViews/editClubStructre.html', {
													club: club,
													events: events,
													departments: departments,
													president: presidentRes
												});
											}
										}
									});
								});
							} else {
								i++;
								departments.push(currentDepartment);
								if(i>=club.newDepartments.length) {
									res.render('clubViews/editClubStructre.html', {
										club: club,
										events: events,
										departments: departments,
										president: presidentRes
									});
								}
							}
						} else {
							var k = 0;
							currentDepartment.subDepartments = [];
							if(departmentres.subDepartments!=null && departmentres.subDepartments.length>0) {
								departmentres.subDepartments.forEach(function(subDepartment) {
									currentSubDepartment = subDepartment;
									currentSubDepartment.members = [];
									if(subDepartment.head!=null && subDepartment.head!="") {
										Member.getMemberByID(subDepartment.head, function(err5, subHeadRes) {
											printError(err5);
											printResult(subHeadRes);
											currentSubDepartment.head = subHeadRes || {};
											if(subDepartment.members!=null && subDepartment.members.length>0) {
												var c = 0;
												subDepartment.members.forEach(function(memberID) {
													Member.getMemberByID(memberID, function(err6, member) {
														c++;
														if(member!=null)
															currentSubDepartment.members.push(member);
														if(c>=subDepartment.members.length) {
															currentDepartment.subDepartments.push(currentSubDepartment);
															k++;
															if(k>=departmentres.subDepartments.length) {
																i++;
																departments.push(currentDepartment);
																if(i>=club.newDepartments.length) {
																	res.render('clubViews/editClubStructre.html', {
																		club: club,
																		events: events,
																		departments: departments,
																		president: presidentRes
																	});
																}
															}
														}
													})
												})
											}
										});
									}
									
								});
							} else {
								i++;
								departments.push(currentDepartment);
								if(i>=club.newDepartments.length) {
									res.render('clubViews/editClubStructre.html', {
										club: club,
										events: events,
										departments: departments,
										president: presidentRes
									});
								}
							}
						}
					});
				} else {
					i++;
					if(i>=club.newDepartments.length) {
						res.render('clubViews/editClubStructre.html', {
							club: club,
							events: events,
							departments: departments,
							president: presidentRes
						});
					}
				}

			});
		});
	}
	else {
		res.render('clubViews/editClubStructre.html', {
						club: club,
						events: events,
						departments: departments,
						president: presidentRes
					});
	}
}

function getEventsAndDepartmentsEdit(club, presidentRes, req, res) {
	var events = [];
	var i = 0 ;
	if(club.events!=null && club.events.length>0) {
		club.events.forEach(function(event) {
			Event.getEventById(event.toString(), function(err, eventRes) {
				i++;
				if(eventRes!=null)
					events.push(eventRes);
				if(i>=club.events.length)
					getDepartmentsEdit(club, presidentRes, events, req, res);	
			});
		});
	} else {
		getDepartmentsEdit(club, presidentRes, events, req, res);
	}
}

function getDepartments(club, presidentRes, events, resuser, req, res) {
	var departments = [];
	var i = 0;
	if(club.newDepartments!=null && club.newDepartments.length>0) {
		club.newDepartments.forEach(function(departmentid) {
			Department.getDepartmentById(departmentid, function(err2, departmentres) {
				printError(err2);
				var currentDepartment = departmentres;
				var j = 0;
				if(departmentres!=null) {
					Member.getMemberByID(departmentres.head, function(err4, headRes) {
						printError(err4);
						currentDepartment.head = headRes || {};
						if(departmentres.nestedType!="true") {
							i++;
							departments.push(currentDepartment);
							if(i>=club.newDepartments.length) {
								res.render('viewprofile.html', {
									dude : resuser,
									club: club,
									events: events,
									departments: departments,
									president: presidentRes
								});
							}	
						} else {
							var k = 0;
							var mysubDepartments = [];
							if(departmentres.subDepartments!=null && departmentres.subDepartments.length>0) {
								departmentres.subDepartments.forEach(function(subDepartment) {
									var currentSubDepartment = subDepartment;
									Member.getMemberByID(subDepartment.head, function(err5, subHeadRes) {
										printError(err5);
										currentSubDepartment.head = subHeadRes;
										// console.log(currentSubDepartment)
										// JSON.parse(currentSubDepartment)
										mysubDepartments.push(currentSubDepartment);
										k++;
										if(k>=departmentres.subDepartments.length) {
											currentDepartment.subDepartments = mysubDepartments;
											i++;
											departments.push(currentDepartment);
											if(i>=club.newDepartments.length) {
												res.render('viewprofile.html', {
													dude : resuser,
													club: club,
													events: events,
													departments: departments,
													president: presidentRes
												});
											}
										}
									});
								});
							} else {
								i++;
								departments.push(currentDepartment);
								if(i>=club.newDepartments.length) {
									res.render('viewprofile.html', {
										dude : resuser,
										club: club,
										events: events,
										departments: departments,
										president: presidentRes
									});
								}
							}
						}
					});
				}
					
			});
		});
	} else {
		res.render('viewprofile.html', {
						dude : resuser,
						club: club,
						events: events,
						departments: departments,
						president: presidentRes
					});
	}
}

function getEventsAndDepartments(club, presidentRes, resuser, req, res) {
	var events = [];
	var i = 0 ;
	if(club.events!=null && club.events.length>0) {
		club.events.forEach(function(event) {
			Event.getEventById(event.toString(), function(err, eventRes) {
				i++;
				if(eventRes!=null)
					events.push(eventRes);
				if(i>=club.events.length)
					getDepartments(club, presidentRes, events, resuser, req, res);	
			});
		});
	} else {
		getDepartments(club, presidentRes, events, resuser, req, res);
	}
}

router.get('/viewClub/:id', function(req, res) {
	User.getUserById(req.params.id, function(err, resuser) {
		printError(err);
		Club.getClubByUserId(req.params.id, function(err2, resclub) {
			printError(err2);
			if(resclub==null) {
				req.flash('error_msg', 'No such club!');
				res.redirect('/clubs/');
			} else {
				var president;
				if(resclub.president== null || resclub.president==="") {
					getEventsAndDepartments(resclub, {}, resuser, req, res);
				} else {
					Member.getMemberByID(resclub.president, function(err3, presidentRes) {
						printError(err3);
						getEventsAndDepartments(resclub, presidentRes, resuser, req, res);
					});
				}				
			}
		});				
	});
});

router.get('/editStructre/:id', ensureAuthenticated, function(req, res) {
	if(req.isAuthenticated() && req.user.id == req.params.id) {
		Club.getClubByUserId(req.params.id, function(err2, resclub) {
			printError(err2);
			if(resclub==null) {
				req.flash('error_msg', 'No such club!');
				res.redirect('/clubs/');
			} else {
				var president;
				if(resclub.president== null || resclub.president==="") {
					getEventsAndDepartmentsEdit(resclub, {}, req, res);
				} else {
					Member.getMemberByID(resclub.president, function(err3, presidentRes) {
						printError(err3);
						getEventsAndDepartmentsEdit(resclub, presidentRes, req, res);
					});
				}				
			}
		});
		
	} else {
		req.flash('error_msg', 'You are not authorized!');
		res.redirect('/clubs');
	}

});

router.post('/search', function(req, res) {
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

router.post('/addpresident', ensureAuthenticated, function(req, res) {
	var presidentName = req.body.presidentName;
	var presidentID = req.body.presidentID;
	Club.getClubByUserId(req.user.id, function(err, club) {
		printError(err);
		var newMember = new Member({
			name: presidentName,
			gucid: presidentID,
			profileId: "none",
			exists: "false",
			rating: "0",
			review: "no review",
			profilephoto: "default-photo.jpeg",
			role: "President",
			club: club.name,
			clubID: club._id
		});
		Member.createMember(newMember, function(err2, newPresident) {
			printError(err2);
			printResult(newPresident);
			if(newPresident!=null) {
				Club.update({userid:req.user.id},
					{$set: {president: newPresident._id}},
						function(err3, updateRes) {
							printError(err3);
							printResult(updateRes);
				});	
			}
		});

	});
	res.redirect('/clubs/editStructre/'+req.user.id)

});

router.post('/addMember/:departmentID', ensureAuthenticated, function(req, res) {
	console.log('query: '+req.params.departmentID);
	var departmentID = req.params.departmentID;
	var memberName = req.body.memberName;
	var memberID = req.body.memberID;
	
	Club.getClubByUserId(req.user.id, function(err, club) {
		printError(err);
		Department.getDepartmentById(departmentID, function(err2, department) {
			printError(err2);
			var newMember = new Member({
				name: memberName,
				gucid: memberID,
				profileId: "none",
				exists: "false",
				rating: "0",
				review: "no review",
				profilephoto: "default-photo.jpeg",
				role: " member",
				departmentName: department.name,
				club: club.name,
				clubID: club._id,
				departmentID: department._id
			});
			console.log(newMember)
			Member.createMember(newMember, function(err3, newMemberRes) {
				Department.update({_id: departmentID}, {$push: {members: newMemberRes._id}}, function(err4, pushRes) {
					printError(err4);
					printResult(pushRes);
					res.redirect('/clubs/editStructre/'+req.user.id);
				});
			});
		});
	});
});

// Note: not updated
router.post('/addMember/:departmentID/:subDepartmentID', ensureAuthenticated, function(req, res) {
	var departmentID = req.params.departmentID;
	var subdepartmentID = req.params.subDepartmentID;
	var memberName = req.body.memberName;
	var memberID = req.body.memberID;
	var newMember = {name: memberName, gucid: memberID, profileId: "none", exists: "false", rating:"0"};

	Department.update({'subDepartments._id': subdepartmentID},
		{$push: {
	 		'subDepartments.$.members': newMember
		},
	}, function(err, pushRes) {
		printError(err);
		printResult(pushRes);
	});
	res.redirect('/clubs/editStructre/'+req.user.id);
	
});

router.post('/getUserPermissionForDepartment/:departmentID', ensureAuthenticated, function(req, res) {
	var departmentID = req.params.departmentID;
	var profileID = req.user.id;
	Permission.findOne({departmentID: departmentID, profileId: profileID}, function(err, permission) {
		printError(err);
		if(permission!=null && permission.permission==="true")
			res.json("true");
		else
			res.json("false")
	})
});

router.post('/getUserPermissionForSubDepartment/:subDepartmentID', ensureAuthenticated, function(req, res) {
	var subDepartmentID = req.params.subDepartmentID;
	var profileID = req.user.id;
	Permission.findOne({departmentID: subDepartmentID, profileId: profileID}, function(err, permission) {
		printError(err);
		console.log("per: "+permission);
		if(permission!=null && permission.permission==="true")
			res.json("true");
		else
			res.json("false")
	})
});

router.get('/editMembersOfDepartment/:departmentID', ensureAuthenticated, function(req, res) {
	var host = req.headers.host;
	var departmentID = req.params.departmentID;
	var url = "http://"+host+"/clubs/membersOfSingleDepartment/"+departmentID;
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			console.log(jsonObj)
			res.render('clubViews/editMembers.html', {members: jsonObj.members, name: jsonObj.name}); // Print the body of response.
	  	}
	});
});

router.get('/editMembersOfSubDepartment/:departmentID/:subDepartmentID', ensureAuthenticated, function(req, res) {
	var host = req.headers.host;
	var departmentID = req.params.departmentID;
	var subDepartmentID = req.params.subDepartmentID;
	var url = "http://"+host+"/clubs/membersOfNestedDepartment/"+departmentID+'/'+subDepartmentID;
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			console.log(jsonObj)
			res.render('clubViews/editMembers.html', {members: jsonObj.members, name: jsonObj.name}); // Print the body of response.
	  	}
	});
});

router.post('/addDepartmentNew', ensureAuthenticated, function(req, res, next) {
	var departmentName = req.body.departmentName;
	var headID = req.body.headID;
	var departmentHead = req.body.departmentHead;
	var departmentPublic = req.body.departmentPublic;
	var departmentNested = req.body.departmentNested;

	Club.getClubByUserId(req.user.id, function(err, clubRes) {
		printError(err);
		if(clubRes.president == null || clubRes.president==="") {
			req.flash('error_msg','You have to add a president first!');
			res.redirect('/clubs/editStructre/' + req.user.id);
		} else {
			var newMember = new Member({
				name: departmentHead,
				gucid: headID,
				profileId: "none",
				exists: "false", 
				rating: "0",
				review: "no review",
				club: clubRes.name,
				role: "Head",
				departmentName: departmentName,
				profilephoto: "default-photo.jpeg",
				clubID: clubRes._id,
				departmentID: ""
			});
			Member.createMember(newMember, function(err2, newHead) {
				printError(err2);
				printResult(newHead);
				var newDepartment = new Department({
					nestedType: departmentNested,
					public: departmentPublic,
					name: departmentName, 
					head: newHead._id,
					members: [],
					subDepartments: []
				});
				Department.createDepartment(newDepartment, function(err1, createRes) {
					printError(err1);
					Club.update({userid:req.user.id}, {$push:{newDepartments: createRes._id}}, function(err2, pushRes) {
						printError(err2);
						printResult(pushRes);
						Member.update({_id: newHead._id}, {$set: {departmentID: createRes._id}}, function(err3, setRes) {
							printError(err3);
							printResult(setRes);
							res.redirect('/clubs/editStructre/' + req.user.id);
						});
					});
				});
			});
		}	
	});
});

router.post('/addSubDepartment/:depID', ensureAuthenticated, function(req, res) {
	var departmentID = req.params.depID;
	var subdepartmentName = req.body.subdepartmentName;
	var subheadID = req.body.subheadID;
	var subdepartmentHead = req.body.subdepartmentHead;
	var subdepartmentPublic = req.body.subdepartmentPublic;
	Club.getClubByUserId(req.user.id, function(err, clubRes) {
		printError(err);
		Department.getDepartmentById(departmentID, function(err2, department) {
			printError(err2);
			var newMember = new Member({
				name: subdepartmentHead,
				gucid: subheadID,
				profileId: "none",
				exists: "false",
				rating: "0",
				review: "no review",
				profilephoto: "default-photo.jpeg",
				role: "Head",
				departmentName: department.name + " - " + subdepartmentName,
				club: clubRes.name,
				clubID: clubRes._id,
				departmentID: department._id,
				subDepartmentID: ""
			});
			Member.createMember(newMember, function(err3, newSubHead) {
				printError(err3);
				var newSubDepartment = {
					public: subdepartmentPublic,
					name: subdepartmentName, 
					head: newSubHead._id,
					members: []
				};
				Department.update({_id: departmentID},
					{$push: {
						subDepartments: newSubDepartment
					}}, function(err4, pushRes) {
						printError(err4);
						printResult(pushRes);
						console.log("ahooo: "+department.subDepartments[department.subDepartments.length-1]._id);
						Member.update({_id: newSubHead._id}, {$set: {departmentID: department.subDepartments[department.subDepartments.length-1]._id}}, function(err5, updateRes) {
							printError(err5);
							printResult("pushed sub ID: "+JSON.stringify(updateRes));
							res.redirect('/clubs/editStructre/'+req.user.id);
						});
				});
			});
		});	
	});
});

router.post('/updateLogo', ensureAuthenticated, function(req, res) {
    logoUpload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/clubs/editStructre/'+req.user.id);
    });
});

router.post('/deleteDepartment/:depID', ensureAuthenticated, function(req, res) {
	var depID = req.params.depID;
	console.log(depID);
	Club.update({userid: req.user.id},
		{
			$pull: {
			  "newDepartments": {$in: [depID.toString()]}}
			},
		function(err, pullRes) {
		   	printError(err);
		   	printResult(pullRes);
			req.flash('success_msg', 'Deleted Department successfully!');
			console.log("Success:" + req.success_msg); 	
	});
	// Note: remove it from the database?
	Department.remove({_id: depID}, function(err, removeRes) {
		printError(err);
		printResult(removeRes);
	});
    res.redirect('/clubs/editStructre/'+req.user.id);
});

function updateMembersHelper(counterObject, limit, req, res) {
	counterObject.i++;
	if(counterObject.i>=limit)
		res.redirect('/clubs/editStructre/'+req.user.id);
}

function pushOrganization(member, profileId, counterObject, limit, req, res) {
	var newOrganization = {
		role: member.role,
		departmentName: member.departmentName,
		rating: member.rating,
		review: member.review,
		name: member.club,
		comment: "no comment"
	}
	User.update({_id: profileId}, {$push: {
		organizations: newOrganization
	}}, function(err4, pushRes) {
		printError(err4);
		updateMembersHelper(counterObject, limit, req, res);
	});
}

function updateSingleMember(member, userRes, counterObject, limit, req, res) {
	Member.update({_id: member._id}, {$set: {
		exists: "true",
		profileId: userRes._id,
		profilephoto: userRes.profilephoto,
		name: userRes.name
	}}, function(err2, setRes) {
			printError(err2);
			if(member.role==="Head") {
				console.log("head")
				console.log(member.departmentName)
				console.log(member.departmentID)
				Permission.find({profileId: userRes._id, departmentID: member.departmentID}, function(err3, permissionRes) {
					if(permissionRes!=null&&permissionRes.length>0) {
						pushOrganization(member, userRes._id, counterObject, limit, req, res);
					} else {
						var newPermission = new Permission({
							departmentID: member.departmentID,
							profileId: userRes._id,
							permission: "true"
						});
						Permission.createPermission(newPermission, function(err3, createRes) {
							printError(err3);
							pushOrganization(member, userRes._id, counterObject, limit, req, res);
						});
					}
				});
		} else {
			pushOrganization(member, userRes._id, counterObject, limit, req, res);
		}
	});
}

router.post('/updateMembers/:clubID', ensureAuthenticated, function(req, res) {
	var clubID = req.params.clubID;
	Member.getMembersByClubID(clubID, function(err, members) {
		printError(err);
		if(members!=null && members.length>0) {
			var counterObject = {i: 0};
			members.forEach(function(member) {
				User.getUserByGucId(member.gucid, function(err1, userRes) {
					printError(err1);
					if(userRes!=null) {
						updateSingleMember(member, userRes, counterObject, members.length, req, res);
					} else {
						updateMembersHelper(counterObject, members.length, req, res);
					}
				});
			});
		} else {
			res.redirect('/clubs/editStructre/'+req.user.id)
		}
	});
});

function updateMemberRating(memberID, req, res) {
	var rating = 0;
	Rating.getRatingsByMemberId(memberID, function(err, ratings) {
		printError(err);
		if(ratings!=null && ratings.length>0) {
			ratings.forEach(function(ratingObj) {
				rating+=parseInt(ratingObj.rating);
			});
			rating = Math.round(rating/ratings.length);
		}
		Member.update({_id: memberID}, {$set: {
			rating: rating
		}}, function(err1, updateRes) {
			printError(err1);
			printResult(updateRes);
			res.json(rating);
		});
	});
}

router.post("/rateMember/:memberID/:rating", function(req, res) {
	var memberID = req.params.memberID;
	ensureHeadOfMember(memberID, req, res);
	var rating = req.params.rating;
	Rating.find({raterID: req.user.id, memberID: memberID}, function(err, ratingRes) {
		printError(err);
		if(ratingRes!=null && ratingRes.length>0) {
			Rating.update({raterID: req.user.id, memberID: memberID}, {$set: {
				rating: rating
			}}, function(err1, updateRes) {
				printError(err1);
				printResult(updateRes);
				updateMemberRating(memberID, req, res);
			});
		} else {
			var newRating = new Rating({
				memberID: memberID,
				raterID: req.user.id,
				rating: rating
			});
			Rating.createRating(newRating, function(err1, createRes) {
				printError(err1);
				printResult(createRes);
				updateMemberRating(memberID, req, res);
			});
		}
	});
});

router.post("/editReview/:memberID/:review", ensureAuthenticated, function(req, res) {
	var memberID = req.params.memberID;
	var review = req.params.review;
	Member.update({_id: memberID}, {$set: {review:review}}, function(err, updateRes) {
		printError(err);
		printResult(updateRes);
		var jsonData = {};
		jsonData.edited = "false";
		if(updateRes.nModified!=0) {
			jsonData.edited = "true";
			jsonData.review = review;
		}
		res.json(jsonData);
	});
});

router.post('/addPhoto', ensureAuthenticated, function(req,res) {
    galleryUpload(req, res, function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/clubs/viewClub/'+req.user.id);
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

// NOTE: authentication needed?
router.get('/viewAllMembers/:clubID', function(req, res) {
	var members = [];
	var clubID = req.params.clubID;
	console.log(clubID)
	Club.getClubById(clubID, function(err, clubRes) {
		printError(err);
		Member.find({clubID: clubID}, function(err, membersRes) {
			console.log(membersRes)
			res.render('clubViews/viewAllMembers.html', {members: membersRes, club: clubRes});
		});
	});
});

router.get('/membersOfSingleDepartment/:departmentID', function(req, res) {
	var departmentID = req.params.departmentID;
	var jsonData = {};
	var membersArr = [];
	Department.getDepartmentById(departmentID, function(err, department) {
		printError(err);
		if(department!=null) {
			jsonData.name = department.name;
			if(department.public==="true") {
				jsonData.public = "true";
				Member.getMemberByID(department.head, function(err1, head) {
					membersArr.push(head);
					if(department.members==null||department.members.length==0) {
						jsonData.members = membersArr;
						res.json(jsonData);
					} else {
						var i = 0;
						department.members.forEach(function(memberID) {
							Member.getMemberByID(memberID, function(err2, member) {
								i++;
								if(member!=null && member.length>0)
									membersArr.push(member);
								if(i>=department.members.length) {
									jsonData.members = membersArr;
									res.json(jsonData);
								}
							});
						});
					}
				});	
			} else {
				jsonData.public = "false";
				res.json(jsonData);
			}
		}
	});
});

router.get('/membersOfNestedDepartment/:departmentID/:subDepartmentID', function(req, res) {
	var departmentID = req.params.departmentID;
	var subDepartmentID = req.params.subDepartmentID;
	var jsonData = {};
	var membersArr = [];
	var flag = "false";
	Department.getDepartmentById({_id: departmentID}, function(err, department) {
		printError(err);
		department.subDepartments.forEach(function(subDepartment) {
			if(subDepartment._id.toString()==subDepartmentID) {
				flag = "true";
				jsonData.name = department.name+"/"+subDepartment.name;
				if(department.public==="true") {
					jsonData.public = "true";
					Member.getMemberByID(subDepartment.head, function(err1, head) {
						printError(err1);
						membersArr.push(head);
						var i = 0;
						if(subDepartment.members==null||subDepartment.members.length==0) {
							jsonData.members = membersArr;
							res.json(jsonData);
						} else {
							subDepartment.members.forEach(function(memberID) {
								Member.getMemberByID(memberID, function(err2, member) {
									i++;
									if(member!=null && member.length>0)
										membersArr.push(member);
									if(i>=subDepartment.members.length) {
										jsonData.members = membersArr;
										res.json(jsonData);
									}
								});
							});
						}	
					});	
				} else {
					jsonData.public = "false";
					res.json(jsonData);
				}				
			}
		});
		if(flag=="false"){
			res.json(jsonData);
		}
		
	});
});

module.exports = router;