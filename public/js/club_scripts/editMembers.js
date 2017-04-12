var ratingClick = function() {
	$(".ratingLabel").click(function(){
		$(this).parent().find("input").nextAll().css({"color": "#ddd"});
	  	$(this).css({"color": "#FFD700"});
	  	$(this).nextAll().css({"color": "#FFD700"});
	  	//.rating > input:checked ~ label, /* show gold star when clicked */
	  	var myelement = $(this).prev();
	  	var rating = myelement.val();
	  	var fieldset = myelement.parent();
	  	var memberID = fieldset.parent().parent().parent().attr('id');
		$.post('/clubs/rateMember/'+memberID+'/'+rating, function(data) {
			console.log("new rating: "+data);
			if(data==="Not authorized!") {
				alert("You are not authorized");
				var alertError = '<div class=\"alert alert-danger\">You are note Authorized!</div>';
				$('#alertDiv').append(alertError)
			} else {
				myelement.val(data);
				fieldset.parent().attr('rating', data);
			}
		});
	});
}

$("fieldset").each(function(i) {
  	var rating = $(this).parent().attr('rating');
    console.log(rating);
    if(!rating)
    	rating="0";
    var inputElement = $(this).find("[value="+rating+"]");
    $(this).find("input").nextAll().css({"color": "#ddd"});
    inputElement.css({"color": "#FFD700"});
  	inputElement.nextAll().css({"color": "#FFD700"});
    // console.log($(this).find("[value="+rating+"]").val());
});

var editReview = function(name, id, review) {
	var html = '<div id="reviewDiv" style=\"position: fixed; align-self: center; margin-top: 50px; margin-left: 30%; width: 500px; height: 300px;\">'
		+	'<h3 style=\"color: white;\">Review of '+name+'</h3><hr>'
		+	'<textarea id=\"newReview\" style=\"width: 100%; height: 80%; color: black;\" placeholder=\"'+review+'\"></textarea>'
		+	'<div style=\"float: right;\">'
		+	'<button class=\"btn cancelBtn\" style=\"margin-right: 10px;\">Cancel</button>'
		+	'<button class=\"btn btn-success\" onclick=\"editReviewOf(\''+id+'\')\">Submit</button>'
		+	'</div></div>';
	$('#topDiv').html(html);
	$('#backgroundDiv').show();
    $('#topDiv').show();
    appendCancelEvent();
    appendHover();
}

var appendCancelEvent = function() {
	$('.cancelBtn').click(function() {
		$('#addMemberDiv').hide();
        $('#reviewDiv').hide();
		$('#topDiv').hide();
		$('#backgroundDiv').hide();	
	});
}

var editReviewOf = function(id) {
	var newReview = $('#newReview').val();
	console.log(newReview)
	$.post('/clubs/editReview/'+id+'/'+newReview, function(data) {
		if(data.edited=="true") {
			$('#'+id).find('.reviewClass').text(newReview);
			$('#backgroundDiv').hide();
    		$('#topDiv').hide();
		} else {
			alert("not updated!")
		}
	});
}

var getUserPermission = function(departmentID) {
	$.post('/clubs/getUserPermissionForDepartment/'+departmentID, function(data) {
		console.log(data)
		if(data=="true") {
			var html = '<div class=\"addmember\" style=\"position: fixed; align-self: center; margin-top: 100px; margin-left: 30%; width: 400px; height: 420px; border: 2px solid white;\" id=\"addMemberDiv\">'
								+ '<div style=\"max-width: 400px; padding:10px;\">'
								+ '<h2>Add Member</h2><hr>'
								+	'<input type=\"text\" name=\"memberID\" class=\"form-control\" placeholder=\"34-5862\"><br>'
								+	'<input type=\"text\" name=\"memberName\" class=\"form-control\" placeholder=\"mohab amr\"><br>'
								+	'<input type=\"text\" name=\"memberEmail\" class=\"form-control\" placeholder=\"member@gmail.com\"><br>'
								+	'<input type=\"text\" name=\"memberPhone\" class=\"form-control\" placeholder=\"01073988635\">'
								+	'<button " class=\"btn btn-success btn-lg\" onclick=\"addMember(\''+departmentID+'\')\" style=\"margin-top: 30px; color: white;\">Add Member</button>'
								+	'</div>'
								+	'</div>';
			$('#backgroundDiv').show();
			$('#topDiv').html(html);
			$('#topDiv').show();
			appendCancelEvent();
			appendHover();
		} else {
			$('#editMembersBtn').remove();
		}
	});
}

var addMember = function(departmentID) {
	var memberName = $('#addMemberDiv').find('input[name="memberName"]').val();
	var memberID = $('#addMemberDiv').find('input[name="memberID"]').val();
	var memberEmail = $('#addMemberDiv').find('input[name="memberEmail"]').val();
	var memberPhone = $('#addMemberDiv').find('input[name="memberPhone"]').val();
	$.post('/clubs/addMemberAjax/'+departmentID+'/'+memberID+'/'+memberName+'/'+memberEmail+'/'+memberPhone, function(data) {
		if(data!=null) {
			console.log(data);
			appendNewMember(data);
			$('#addMemberDiv').hide();
			$('#backgroundDiv').hide();
        	$('#topDiv').hide();
		}
	});
}

var addMemberSub = function(departmentID, subDepartmentID) {
	var memberName = $('#addMemberDiv').find('input[name="memberName"]').val();
	var memberID = $('#addMemberDiv').find('input[name="memberID"]').val();
	var memberEmail = $('#addMemberDiv').find('input[name="memberEmail"]').val();
	var memberPhone = $('#addMemberDiv').find('input[name="memberPhone"]').val();
	$.post('/clubs/addMemberAjax/'+departmentID+'/'+subDepartmentID+'/'+memberID+'/'+memberName+'/'+memberEmail+'/'+memberPhone, function(data) {
		if(data!=null) {
			console.log(data);
			appendNewMember(data);
			$('#addMemberDiv').hide();
			$('#backgroundDiv').hide();
        	$('#topDiv').hide();
		}
	});
}

var appendNewMember = function(member) {
	var length = $('#membersBody').children().length + 1;
	var html = '<tr id=\"'+member._id+'\">'
			+ '<td>#'+length+'</td>'
			+ '<td>'+member.name+'</td>'
			+ '<td>'+member.role+'</td>'
			+ '<td><div rating=\"'+member.rating+'\">'
			+ '<fieldset class=\"rating\">'
			+	'<input type=\"radio\" id=\"field2_star5\" name=\"rating2\" value=\"5\"/>'
			+	'<label class = \"full ratingLabel\" for=\"field2_star5\"></label>'
			+    '<input type=\"radio" id=\"field2_star4" name=\"rating2\" value=\"4\"/>'
			+    '<label class = \"full ratingLabel\" for=\"field2_star4\"></label>'
			+    '<input type="radio" id=\"field2_star3" name=\"rating2\" value=\"3\"/>'
			+    '<label class = \"full ratingLabel\" for=\"field2_star3\"></label>'
			+    '<input type=\"radio" id=\"field2_star2" name=\"rating2\" value=\"2\"/>'
			+    '<label class = \"full ratingLabel\" for=\"field2_star2\"></label>'   
			+    '<input type=\"radio" id=\"field2_star1" name=\"rating2\" value=\"1\"/>'
			+    '<label class = \"full ratingLabel\" for=\"field2_star1\"></label>'
			+ '</fieldset>'
			+ '</div></td>'
			+ '<td class=\"reviewElement\">'
			+ '<p class=\"reviewClass\" onclick=\"editReview(\''+member.name+'\', \''+member._id+'\', \''+member.review+'\')\" style=\"text-overflow: ellipsis; max-width: 100px;white-space: nowrap;overflow: hidden;\">'+member.review+'</p>'
			+ '</td>'
			+ '<td>'+(member.email || "no email")
			+	'<br><br>'
			+	(member.phone || "no phone") +'</td>'
			+ '<td><button class="btn btn-primary" style="margin-bottom: 5px; width: 100%;" onclick=\"dismissMember(\''+member._id+'\')\">Dismiss</button>'
			+	'<button class="btn btn-danger" style="width: 100%;" onclick="deleteMember(\''+member._id+'\')">Delete</button></td></tr>';
			console.log(html)
	$('#membersBody').append(html);
	ratingClick();
}

var getUserPermissionSub = function(departmentID, subDepartmentID) {
	$.post('/clubs/getUserPermissionForDepartment/'+subDepartmentID, function(data) {
		console.log(data)
		if(data=="true") {
			var html = '<div class=\"addmember\" style=\"position: fixed; align-self: center; margin-top: 100px; margin-left: 30%; width: 400px; height: 300px; border: 2px solid white;\" id=\"addMemberDiv\">'
				+ '<div style=\"max-width: 400px; padding:10px;\">'
				+ '<h2>Add Member</h2><hr>'
				+	'<input type=\"text\" name=\"memberID\" class=\"form-control\" placeholder=\"34-5862\"><br>'
				+	'<input type=\"text\" name=\"memberName\" class=\"form-control\" placeholder=\"mohab amr\"><br>'
				+	'<input type=\"text\" name=\"memberEmail\" class=\"form-control\" placeholder=\"member@gmail.com\"><br>'
				+	'<input type=\"text\" name=\"memberPhone\" class=\"form-control\" placeholder=\"01073988635\">'
				+'<button " class=\"btn btn-success btn-lg\" onclick=\"addMemberSub(\''+departmentID+'\',\''
				+subDepartmentID+'\')\" style=\"margin-top: 30px; color: white;\">Add Member</button>'
				+	'</div>'
				+	'</div>';
			$('#backgroundDiv').show();
			$('#topDiv').html(html);
			$('#topDiv').show();
			appendCancelEvent();
			appendHover();
		} else {
			$('#editMembersBtn').remove();
		}
	});
}

var viewAddForm = function(nestedType, departmentID, subDepartmentID) {
	if(nestedType==="false") {
		getUserPermission(departmentID);
	} else {
		getUserPermissionSub(departmentID, subDepartmentID);
	}
}

var deleteMember = function(nestedType, departmentID, subDepartmentID, memberID) {
	var url = '/clubs/deleteMember/'+departmentID+'/';
	if(nestedType==="false") {
		url += memberID;
	} else {
		url += subDepartmentID+'/'+memberID;
	}
	$.post(url, function(data) {
		if(data=="Deleted Member") {
			$('#'+memberID).slideUp();
		} else {
			alert("Member wasn't dismissed!");
		}
	});
}

var dismissMember = function(nestedType, departmentID, subDepartmentID, memberID) {
	var url = '/clubs/dismissMember/'+departmentID+'/';
	if(nestedType==="false") {
		url += memberID;
	} else {
		url += subDepartmentID+'/'+memberID;
	}
	$.post(url, function(data) {
		if(data=="Dismissed Member") {
			$('#'+memberID).slideUp();
		} else {
			alert("Member wasn't dismissed!");
		}
	});
}

var mouse_is_inside = false;
var appendHover = function() {
	$('#addMemberDiv, #reviewDiv').hover(function(){ 
    	console.log('hover on')
        mouse_is_inside=true; 
    }, function(){ 
        mouse_is_inside=false; 
    });
}

$(document).ready(function() {
    $("body").mouseup(function(){ 
        if(! mouse_is_inside) {
        	$('#addMemberDiv').hide();
        	$('#reviewDiv').hide();
			$('#backgroundDiv').hide();
        	$('#topDiv').hide();
        }
    });
    ratingClick();
});

$(document).keyup(function(e) {
  if (e.keyCode === 27) {
		$('#backgroundDiv').hide();
		$('#topDiv').hide();
  }
});
