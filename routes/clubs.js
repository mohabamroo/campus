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
var Department = require('../models/department');
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
    var title = req.body.photoName || newfilename;
    if(storagetype==="logo") {
	    Club.update({userid: req.user.id}, {$set: {logo: newfilename}}, function(err, res) {
	    	if(err) {
	    		console.log("Error:\n" + err);
	    		throw err;
	    	} else {
	    		console.log(JSON.stringify(res));
	    	}
	    });
	    User.update({_id: req.user.id}, {$set: {profilephoto: newfilename}}, function(err, res) {
	    	if(err) {
	    		console.log("Error:\n" + err);
	    		throw err;
	    	} else {
	    		console.log("user profile photo update: "+JSON.stringify(res));
	    	}
	    });	
    } else {
    	if(storagetype==="galleryPhoto") {
    		Club.update({userid: req.user.id}, {$push: {photos: {name: title, src: newfilename}}}, function(err, res) {
		    	if(err) {
		    		console.log("Error:\n" + err);
		    		throw err;
		    	} else {
		    		console.log(JSON.stringify(res));
		    	}
	    	});
    	}
    }
    
  }
});
var clubUpload = multer({ storage : clubStorage}).single('userPhoto');

function ensureVerification(req, res, next) {
	console.log("he")
	User.getUserById(req.user.id, function(err, resuser) {
		if(resuser.verificationCode==="XwPp9xazJ0ku5CZnlmgAx2Dld8SHkAe") {
			return next();
		} else {
			req.flash('error_msg','You are not verified!');
			res.redirect('/users/signin');
		}
	});
}

function ensureAuthenticated(req, res, next){	
	if(req.isAuthenticated()){
		ensureVerification(req, res, next);
	} else {
		req.flash('error_msg','You are not logged in!');
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

router.get('/getDepartments/:id', function(req, res) {
	var clubid = req.params.clubID;
	var departments = [];
	var i = 0;
	Club.getClubByUserId(req.params.id, function(err, resclub) {
		printError(err);
		console.log(resclub);
		if(resclub.newDepartments!=null && resclub.newDepartments.length>0) {
			resclub.newDepartments.forEach(function(departmentID) {
				Department.getDepartmentById(departmentID, function(err1, departmentsRes) {
					printError(err1);
					i++;
					if(departmentsRes!=null) {
						departments.push(departmentsRes);
					}
					if(i>=resclub.newDepartments.length) {
						res.json(departments);
					}
				});
			});
		} else {
			res.json(departments);
		}
	});
});

function getDepartments(club, departments, events, resuser, req, res) {
	var i = 0;
	club.newDepartments.forEach(function(departmentid) {
		Department.getDepartmentById(departmentid, function(err2, departmentres) {
			printError(err2);
			i++;
			if(departmentres!=null) {
				departments.push(departmentres);
			}
			if(i>=club.newDepartments.length) {
				res.render('viewprofile.html', {
					dude : resuser,
					club: club,
					events: events,
					departments: departments
				});
			}
		});
	});
}

function getDepartmentsEdit(club, departments, events, req, res) {
	var i = 0;
	club.newDepartments.forEach(function(departmentid) {
		Department.getDepartmentById(departmentid, function(err2, departmentres) {
			printError(err2);
			i++;
			if(departmentres!=null) {
				departments.push(departmentres);
			}
			if(i>=club.newDepartments.length) {
				res.render('clubViews/editClubStructre.html', {
					clubRes: club,
					events: events,
					departments: departments
				});
			}
		});
	});
}
router.get('/viewClub/:id', function(req, res) {
	console.log(req.params.id);
	User.getUserById(req.params.id, function(err, resuser) {
		if(err) {
			console.log(err);
			throw err;
		}
		else {
			Club.getClubByUserId(req.params.id, function(err2, resclub) {
				if(err2) {
					console.log(err2);
					throw err2;
				} else {
					if(resclub==null) {
						res.end('No such club!');
					} else {
						var events = [];
						var departments = [];
						var i = 0 ;
						if(resclub.events!=null && resclub.events.length>0) {
							resclub.events.forEach(function(event) {
								Event.getEventById(event.toString(), function(err, eventRes) {
									i++;
									console.log(i)
									if(eventRes!=null) {
										events.push(eventRes);
									}
									if(i>=resclub.events.length) {
										console.log("finshed!!!");
										i = 0;
										if(resclub.newDepartments!=null && resclub.newDepartments.length>0) {
											getDepartments(resclub, departments, events, resuser, req, res);
										} else {
											res.render('viewprofile.html', {
												dude : resuser,
												club: resclub,
												events: events,
												departments: []
										   	});
										}	
									}
								});
							});
						} else {
							console.log("null")
							i = 0;
							if(resclub.newDepartments!=null && resclub.newDepartments.length>0) {
								getDepartments(resclub, departments, [], resuser, req, res);
							} else {
							res.render('viewprofile.html', {
								dude : resuser,
								club: resclub,
								events: [],
								departments: []
							  	});
							}
						}
						
					}
				}
			});
		}			
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

router.get('/editStructre/:id', ensureAuthenticated, function(req, res) {
	if(req.isAuthenticated() && req.user.id == req.params.id) {
		Club.getClubByUserId(req.user.id, function(err, resclub) {
		printError(err);
		if(resclub==null) {
			res.end('No such club!');
		} else {
			var events = [];
			var departments = [];
			var i = 0 ;
			if(resclub.events!=null && resclub.events.length>0) {
				resclub.events.forEach(function(event) {
					Event.getEventById(event.toString(), function(err, eventRes) {
						i++;
						console.log(i)
						if(eventRes!=null) {
							events.push(eventRes);
						}
						if(i>=resclub.events.length) {
							console.log("finshed!!!");
							i = 0;
							if(resclub.newDepartments!=null && resclub.newDepartments.length>0) {
								getDepartmentsEdit(resclub, departments, events, req, res);
							} else {
								res.render('clubViews/editClubStructre.html', {
									dude : resuser,
									clubRes: resclub,
									events: events,
									departments: []
								});
							}	
						}
					});
				});
			} else {
				console.log("null")
				i = 0;
				if(resclub.newDepartments!=null && resclub.newDepartments.length>0) {
					getDepartmentsEdit(resclub, departments, [], req, res);
				} else {
					res.render('clubViews/editClubStructre.html', {
						dude : resuser,
						clubRes: resclub,
						events: [],
						departments: []
				 	});
				}
			}			
		}

		});
	} else {
		req.flash('error_msg', 'You are not logged in');
		console.log(req.error_msg);
		res.redirect('/users/signin');
	}

});

router.post('/addpresident', ensureAuthenticated, function(req, res) {
	var presidentName = req.body.presidentName;
	var presidentID = req.body.presidentID;
	var newpresident = {name: presidentName, gucid: presidentID, profileId: "none", exists: "false", rating: "0"};
	Club.getClubByUserId(req.user.id, function(err, club) {
		Club.update({userid:req.user.id}, {$set:{president: newpresident}}, function(err, res) {
				if(err)
					console.log(err);
			});
	});
	res.redirect('/clubs/editStructre/'+req.user.id)

});

router.post('/addMember/:departmentID', ensureAuthenticated, function(req, res) {
	console.log('query: '+req.params.departmentID);
	var departmentID = req.params.departmentID;
	var memberName = req.body.memberName;
	var memberID = req.body.memberID;
	var newMember = {name: memberName, gucid: memberID, profileId: "none", exists: "false", rating:"0"};
	console.log(req.user.id);
	Department.update({_id: departmentID}, {$push: {members: newMember}}, function(err, pushRes) {
		printError(err);
		printResult(pushRes);
	});
	// Club.findOne(
	// 	{"departments._id": departmentID}, 
	// 	{_id: 0, departments: {$elemMatch: {_id: departmentID}}}, function(err, res) {
	// 		console.log("res: "+res.departments[0].id);
	// 		var findStr = 'departments.id';
	// 	    var updateStr = 'departments.'+res.departments[0].id+'.members';
	// 	    console.log(findStr);
	// 	   	Club.update({'departments._id': res.departments[0].id}, {$push: {
	// 	   		'departments.$.members': newMember
	// 	   	}}, function(err, res) {
	// 	   		console.log("update res: "+JSON.stringify(res));
	// 	   	});
	// 	});
	res.redirect('/clubs/editStructre/'+req.user.id);
	
});

router.post('/addMember/:departmentID/:subDepartmentID', ensureAuthenticated, function(req, res) {
	var departmentID = req.params.departmentID;
	var subdepartmentID = req.params.subDepartmentID;
	var memberName = req.body.memberName;
	var memberID = req.body.memberID;
	var newMember = {name: memberName, gucid: memberID, profileId: "none", exists: "false", rating:"0"};
	// Club.findOne(
	// 	{"departments.subDepartments._id": subdepartmentID},
	// 	{_id: 0, departments: {$elemMatch: {_id: departmentID}}},
	// 	 function(err, findres) {

	// 		console.log("res: "+findres.departments[0].subDepartments[0].id);
			
	// 	    console.log(JSON.stringify(findres));

	// 	   	Club.update({'departments.subDepartments._id': findres.departments[0].subDepartments[0].id}, {$push: {
	// 	   		'departments.$.subDepartments[0].members': newMember
	// 	   	}}, function(err2, ress) {
	// 	   		if(err2) {
	// 	   			console.log(err2);
	// 	   		}
	// 	   		console.log("update res: "+JSON.stringify(ress));
	// 	   	});
	// });

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

router.post('/addDepartment', ensureAuthenticated, function(req, res, next) {
	var departmentName = req.body.departmentName;
	var headID = req.body.headID;
	var departmentHead = req.body.departmentHead;
	var departmentPublic = req.body.departmentPublic;
	var departmentNested = req.body.departmentNested;
	console.log("nestedType:" +departmentNested);
	var newDepartment = {
		nestedType: departmentNested,
		public: departmentPublic,
		name: departmentName, 
		head: {
				name: departmentHead,
				id: headID,
				profileId: "none",
				exists: "false"
			},
		members: []
		};
	Club.getClubByUserId(req.user.id, function(err, club) {
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

router.post('/addDepartmentNew', ensureAuthenticated, function(req, res, next) {
	var departmentName = req.body.departmentName;
	var headID = req.body.headID;
	var departmentHead = req.body.departmentHead;
	var departmentPublic = req.body.departmentPublic;
	var departmentNested = req.body.departmentNested;
	var newDepartment = new Department({
		nestedType: departmentNested,
		public: departmentPublic,
		name: departmentName, 
		head: {
				name: departmentHead,
				gucid: headID,
				profileId: "none",
				exists: "false", 
				rating: "0",
				review: "no review"
			},
		members: [],
		subDepartments: []
		});
	Club.getClubByUserId(req.user.id, function(err, club) {
		if(club.president==null) {
			console.log("Null president: "+club.president);
			req.flash('error_msg','You have to add president first!');
			next();
			return;
		}
		Department.createDepartment(newDepartment, function(err1, createRes) {
			printError(err1);
			Club.update({userid:req.user.id}, {$push:{newDepartments: createRes._id}}, function(err2, pushRes) {
				printError(err2);
				printResult(pushRes);
			});
		});
	});
	res.redirect('/clubs/editStructre/'+req.user.id);

});

router.post('/addSubDepartment/:depID', ensureAuthenticated, function(req, res) {
	var departmentID = req.params.depID;
	var subdepartmentName = req.body.subdepartmentName;
	var subheadID = req.body.subheadID;
	var subdepartmentHead = req.body.subdepartmentHead;
	var subdepartmentPublic = req.body.subdepartmentPublic;
	var newSubDepartment = {
		public: subdepartmentPublic,
		name: subdepartmentName, 
		head: {
				name: subdepartmentHead,
				id: subheadID,
				profileId: "none",
				exists: "false"
			},
		members: []
		};
	Department.update({_id: departmentID},
		{$push: {
			subDepartments: newSubDepartment
		}}, function(err, pushRes) {
			if(err) {
				console.log("Error:\n" + err);
				throw err;
			} else {
				console.log(JSON.stringify(pushRes));
			}
	});
	// Club.update({'departments._id': departmentID},
	// 	{$push: {
	// 		'departments.$.subDepartments': newSubDepartment
	// 	}}, function(err, pushRes) {
	// 		if(err) {
	// 			console.log("Error:\n" + err);
	// 			throw err;
	// 		} else {
	// 			console.log(JSON.stringify(pushRes));
	// 		}
	// });
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

// NOTE: I don't pull the id from the deps ids array!
router.post('/deleteDepartment/:depID', ensureAuthenticated, function(req, res) {
	var depID = req.params.depID;
	console.log(depID);
	Club.update({userid: req.user.id},
		{
		// $pull: {
		//   'departments': depID}
		},
		function(err, pullRes) {
		   	printError(err);
		   	printResult(pullRes);
			req.flash('success_msg', 'Deleted Department successfully!');
			console.log("Success:" + req.success_msg); 	
	});
	Department.remove({_id: depID}, function(err, removeRes) {
		printError(err);
		printResult(removeRes);
	});

    res.redirect('/clubs/editStructre/'+req.user.id);

});

function updatePresidentOfClub(club, req) {
	var oldPresident = club.president;
	User.getUserByGucId(oldPresident.gucid, function(err, presidentRes) {
			printError(err);
			// console.log("presidentRes: " + presidentRes);
			if(presidentRes!=null && oldPresident.exists==="false") {
				var newPresident = {
					name: presidentRes.name,
					gucid: oldPresident.gucid,
					exists: "true",
					profileId: presidentRes.id,
					rating: oldPresident.rating
				}
				Club.update({userid:req.user.id}, {$set:{president: newPresident}}, function(err, clubres) {
					printError(err);
					// console.log("clubres :" + clubres);
				});
				var newOrganization = {
					name: club.name,
					rating: oldPresident.rating || "0",
					review: oldPresident.review || "no review",
					role: "president"
				}
				User.update({id: presidentRes.id}, {$push: {organizations: newOrganization}}, 
					function(pusherr, organizationres) {
						printError(pusherr);
				});
			}
	});
}

function updateHeadOfDepartment(club, department, req) {
	User.getUserByGucId(department.head.gucid, function(err, userhead) {
		printError(err);
		// console.log("head: " + userhead);
		if(userhead!=null && department.head.exists==="false") {
			var newMember = {
				name: userhead.name,
				gucid: department.head.gucid,
				exists: "true",
				profileId: userhead.id,
				rating: department.head.rating
			}
			Department.update({_id: department._id},
				{$set: {
					head: newMember
				}}, function(err, setRes) {
					printError(err);
					// printResult(setRes);	
					var newOrganization = {
						name: club.name,
						rating: department.head.rating||"0",
						review: department.head.rating||"no review",
						role: department.name + " Head"
					}
					User.update({id: userhead.id}, {$push: {organizations: newOrganization}}, 
						function(pusherr, organizationres) {
							printError(pusherr);
							// printResult(organizationres);
					});
				});
		}
	});
}

function updateMembersOfDepartment(club, department, req) {
	department.members.forEach(function(member) {
		User.getUserByGucId(member.gucid, function(err, userRes) {
			printError(err);
			if(userRes!=null && member.exists==="false") {
				var update = {"$set": {}};
				update["$set"]["members.$.name"] = userRes.name;
				update["$set"]["members.$.gucid"] = member.gucid;
				update["$set"]["members.$.exists"] = "true";
				update["$set"]["members.$.profileId"] = userRes.id;
				update["$set"]["members.$.rating"] = member.rating ||"0";
				update["$set"]["members.$.review"] = member.rating ||"no review";

				// console.log("update str: " + JSON.stringify(update));
				Department.update({'members._id': member._id}, update,
					function(err, updateRes) {
						printError(err);
						printResult(updateRes);
				});					
				var newOrganization = {
					name: club.name,
					rating: member.rating || "0",
					review: member.rating || "no review",
					role: department.name + " member"
				}
				User.update({_id: userRes.id}, {$push: {organizations: newOrganization}}, 
					function(pusherr, organizationres) {
						printError(pusherr);
						// printResult(organizationres);
				});
			}
		});
	});
}

function updateMembersOfSubDepartment(club, subDepartment, req) {
	console.log("hesss")
	subDepartment.members.forEach(function(member) {
		User.getUserByGucId(member.gucid, function(err, userRes) {
			printError(err);
			if(userRes!=null && member.exists!="true") {		
				var index;
				subDepartment.members.some(function(obj, idx) {
				    if(obj._id == member._id) {
				        index = idx;
						return true;
					}
				});
				console.log('index is: ', index);
				var update = {"$set": {}};
				update["$set"]["subDepartments.0.members."+index+".name"] = userRes.name;
				update["$set"]["subDepartments.0.members."+index+".gucid"] = member.gucid;
				update["$set"]["subDepartments.0.members."+index+".exists"] = "true";
				update["$set"]["subDepartments.0.members."+index+".profileId"] = userRes.id;
				update["$set"]["subDepartments.0.members."+index+".rating"] = member.rating ||"0";
				update["$set"]["subDepartments.0.members."+index+".review"] = member.rating ||"no review";
				console.log("update str: " + JSON.stringify(update));
				Department.update({'subDepartments.members._id': member._id}, update,
					function(err, updateRes) {
						printError(err);
						printResult(updateRes);
				});
				var newOrganization = {
					name: club.name,
					rating: member.rating||"0",
					review: member.rating||"no review",
					role: subDepartment.name + " member"
				}
				User.update({_id: userRes.id}, {$push: {organizations: newOrganization}}, 
					function(pusherr, organizationres) {
						printError(pusherr);
						printResult(organizationres);
				});
			}
		});
	});
}

router.post('/updateMembers', ensureAuthenticated, function(req, res) {
	Club.getClubByUserId(req.user.id, function(err, club) {
		updatePresidentOfClub(club, req);
		club.newDepartments.forEach(function(departmentid) {
			Department.getDepartmentById(departmentid, function(errdep, department) {
				printError(errdep);
				if(department!=null) {
					updateHeadOfDepartment(club, department, req);

					updateMembersOfDepartment(club, department, req);

					if(department.subDepartments!=null && department.subDepartments.length>0) {
						department.subDepartments.forEach(function(subDepartment) {
								if(subDepartment.members!=null && subDepartment.members.length>0) {
									updateMembersOfSubDepartment(club, subDepartment, req);
								}
							});
					}
				}
			});
		});
	});
	res.redirect('/clubs/editStructre/'+req.user.id)
});

router.get("/rateMember/:depID/:memberID/:objID/:rating", ensureAuthenticated, function(req, res) {
	var departmentID = req.params.depID;
	var memberID = req.params.memberID;
	var memberobjID = req.params.objID;
	var rating = req.params.rating;
	console.log("obj id: "+memberobjID);
	console.log("user id: " + memberID)

	Department.update({'members._id': memberobjID},
		{$set: {
			'members.$.rating': rating},
		}, function(err, updateRes) {
			printError(err);
			printResult(updateRes);	   	
		});

	// User.getUserById(memberID, function(err, user) {
	// 				//console.log("member: " + user.id);
	// 				if(err)
	// 					throw err;
	// 				if(user!=null) {
						
						
	// 					// Club.update({'departments._id': departmentID},
	// 					// 	{$pull: {
	// 					// 	   		'departments.$.members': {_id: memberobjID}
	// 					// 	   	},
	// 					// 	}, function(err1, pullRes) {
	// 					// 	   		if(err1) {
	// 					// 		  		console.log("Error:\n" + err);
	// 					// 		  		throw err1;
	// 					// 		  	} else {
	// 					// 		  		console.log("pull res: "+JSON.stringify(pullRes));
	// 					// 				Club.update({'departments._id': departmentID},
	// 					// 					{$push: {
	// 					// 						'departments.$.members': newMember
	// 					// 					}}, function(err2, pushRes) {
	// 					// 					   		if(err2) {
	// 					// 						  		console.log("Error:\n" + err);
	// 					// 						  		throw err2;	
	// 					// 						  	} else {
	// 					// 						  		console.log("push res: "+JSON.stringify(pushRes));
	// 					// 						  	}
	// 					// 				});
	// 					// 		  	}
	// 					// });
	// 				}
	// });
	res.redirect('/clubs/editStructre/'+req.user.id)

});

router.get("/rateMember/:depID/:subDepID/:memberID/:objID/:rating", ensureAuthenticated, function(req, res) {
	var departmentID = req.params.depID;
	var subdepartmentID = req.params.subDepID;
	var memberID = req.params.memberID;
	var memberobjID = req.params.objID;
	var rating = req.params.rating;

	Department.find({subDepartments: {$elemMatch: {'members._id': memberobjID}}},
		function(err, depRes) {
		printError(err);
		if(depRes!=null) {
			//console.log(depRes[0].subDepartments[0].members[0].rating);	
			var index;
			depRes[0].subDepartments[0].members.some(function( obj, idx ) {
			    if( obj._id == memberobjID ) {
			        index = idx;
			        return true;
			    }
			});
			console.log('index is: ', index);
			var update = { "$set": { } };
			update["$set"]["subDepartments.0.members."+index+".rating"] = rating;
			console.log("update str: " + JSON.stringify(update));
			// Then update as normal
			Department.update({'subDepartments.members._id': memberobjID}, update,
				function(err, updateRes) {
					printError(err);
					printResult(updateRes);
			});
		}
	});
	res.redirect('/clubs/editStructre/'+req.user.id)
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
	var target = req.body.target || "general";
	console.log(fromTime);
	var newEvent = new Event({
		name: name,
		fromDate: fromDate,
		fromTime: fromTime,
		toDate: toDate,
		toTime: toTime,
		location: location,
		description: description,
		type: type,
		logo: "event-default.jpg",
		organizer: req.user.name
	});
	Event.createEvent(newEvent, function(err, eventres) {
		if(err) {
			console.log(err);
			throw err;
		} else {
			console.log(eventres);
			Club.update({userid: req.user.id}, {$push: {events: eventres._id}},
				function(err2, pushRes) {
					if(err2) {
						console.log(err2);
						throw err2;
					} else {
						console.log("push res: "+JSON.stringify(pushRes));
					}
			});
		}
	});
	res.redirect('/clubs/viewClub/'+req.user.id);

});

router.post('/addPhoto', ensureAuthenticated, function(req,res) {
	storagetype = "galleryPhoto";
    clubUpload(req, res, function(err) {
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

router.post('/updateProfilePhoto', ensureAuthenticated, function(req, res) {
	storagetype = "profilephoto";
	upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.\n"+err);
        }
        res.redirect('/users/profile/'+req.user.id);
    });

});

function getPresidentOfClub(club, members, req, res) {
	if(club!=null) {
		var president = club.president;
		president.role = "President";
		if(president!=null)
			members.push(president);
	}
}

function getMembersOfDepartments(club, members, req, res) {
	if(club!=null) {
		var departments = club.newDepartments;
		var i = 0;
		if(departments!=null)
			departments.forEach(function(departmentid) {
				Department.getDepartmentById(departmentid, function(err, department) {
					printError(err);
					i++;
					if(department!=null) {
						getMembersOfSingleDepartment(department, members, req, res);
					}
					if(i>=departments.length)
						res.render('clubViews/viewAllMembers.html', {members: members, club: club});
				});
			});
		else
			res.render('clubViews/viewAllMembers.html', {members: members, club: club});
	}
}

function getMembersOfSingleDepartment(department, members, req, res) {
	var head = department.head;
	if(head!=null) {
		head.role = department.name +" Head";
		members.push(head);
	}
	if(department.members!=null && department.members.length>0) {
		department.members.forEach(function(member) {
			if(member!=null) {
				member.role = department.name + " member";
				members.push(member);
			}	
		});
	}
	if(department.subDepartments!=null && department.subDepartments.length>0) {
		department.subDepartments.forEach(function(subDepartment) {
			if(subDepartment!=null) {
				var subHead = subDepartment.head;
				if(subHead!=null) {
					subHead.role = department.name +" - " + subDepartment.name +" Head";
					members.push(subDepartment.head);
				}
				if(subDepartment.members!=null && subDepartment.members.length>0) {
					subDepartment.members.forEach(function(member) {
						member.role = department.name +" - " +subDepartment.name;
						members.push(member);
					});
				}
			}
		});
	}
}

// NOTE: authentication needed?
router.get('/viewAllMembers/:clubID', function(req, res) {
	var members = [];
	var clubID = req.params.clubID;
	Club.getClubByUserId(clubID, function(err, club) {
		printError(err);
		getPresidentOfClub(club, members, req, res);
		getMembersOfDepartments(club, members, req, res);
	});
});

module.exports = router;