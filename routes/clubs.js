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
var Member = require('../models/member');
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

// Note: worst function I ever wrote in my life, I'm so disgusted!
function getDepartments(club, presidentRes, events, resuser, req, res) {
	var departments = [];
	var i = 0;
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
							var mymembers = [];
							if(departmentres.members!=null && departmentres.members.length>0) {
								departmentres.members.forEach(function(memberID) {
									Member.getMemberByID(memberID, function(err3, member) {
										j++;
										console.log(member)
										mymembers.push(member);
										if(j>=departmentres.members.length) {
											currentDepartment.members = mymembers;
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
						} else {
							var k = 0;
							var mysubDepartments = [];
							if(departmentres.subDepartments!=null && departmentres.subDepartments.length>0) {
								departmentres.subDepartments.forEach(function(subDepartment) {
									currentSubDepartment = subDepartment;
									var mymembers = [];
									if(subDepartment.head!=null && subDepartment.head!="") {
										Member.getMemberByID(subDepartment.head, function(err5, subHeadRes) {
											printError(err5);
											currentSubDepartment.head = subHeadRes || {};
											if(subDepartment.members!=null && subDepartment.members.length>0) {
												var c = 0;
												subDepartment.members.forEach(function(memberID) {
													Member.getMemberByID(memberID, function(err6, member) {
														c++;
														if(member!=null)
															mymembers.push(member);
														if(c>=subDepartment.members.length) {
															currentDepartment.members = mymembers;
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
														}
													})
												})
											} else {
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
											}
										});
									} else {
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
									}
									
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
				} else {
					i++;
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
	}
	else {
		res.render('viewprofile.html', {
						dude : resuser,
						club: club,
						events: events,
						departments: departments,
						president: presidentRes
					});
	}
}

function getDepartmentsEdit(club, presidentRes, events, req, res) {
	var departments = [];
	var i = 0;
	console.log(club.newDepartments.length)
	if(club.newDepartments!=null && club.newDepartments.length>0) {
		club.newDepartments.forEach(function(departmentid) {
			Department.getDepartmentById(departmentid, function(err2, departmentres) {
				printError(err2);
				printResult(departmentres)
				var currentDepartment = departmentres;
				var j = 0;
				if(departmentres.head!=null && departmentres.head!="") {
					Member.getMemberByID(departmentres.head, function(err4, headRes) {
						printError(err4)
						printResult(headRes);
						currentDepartment.head = headRes || {};
						if(departmentres.nestedType!="true") {
							currentDepartment.members = [];
							if(departmentres.members!=null && departmentres.members.length>0) {
								departmentres.members.forEach(function(memberID) {
									Member.getMemberByID(memberID, function(err3, member) {
										j++;
										printResult(member)
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
					getDepartments(club, departments, events, resuser, req, res);	
			});
		});
	} else {
		getDepartments(club, presidentRes, events, resuser, req, res);
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
					getDepartmentsEdit(club, departments, events, req, res);	
			});
		});
	} else {
		getDepartmentsEdit(club, presidentRes, events, req, res);
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
				role: department.name + " member",
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
				role: departmentName+" Head",
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
				role: department.name + " - " + subdepartmentName + " member",
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
				});
			})
		})	
	})
	
	


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
			$pull: {
			  "newDepartments": {$in: [depID.toString()]}}
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
	console.log(clubID)
	Club.getClubById(clubID, function(err, clubRes) {
		printError(err);
		Member.find({clubID: clubID}, function(err, membersRes) {
			console.log(membersRes)
			res.render('clubViews/viewAllMembers.html', {members: membersRes, club: clubRes});
		});
		// getPresidentOfClub(club, members, req, res);
		// getMembersOfDepartments(club, members, req, res);
	});
});

module.exports = router;