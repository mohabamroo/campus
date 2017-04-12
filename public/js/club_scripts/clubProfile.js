var redirectSignIn = function() {
	window.location.href = '/users/signin'; 
}

var redirectToLink = function(link) {
	console.log(link);
	window.open(link,'_blank');
}

var ensureAuthenticated = function() {
	var url = $(location).attr('href').split('/');
	var userID = url[url.length-1];
	console.log(userID);
	$.post('/clubs/ensureAuthenticatedClub/'+userID, function(data) {
		console.log(data)
		if(data.flag==="true") {
			$('#updateMembersForm').show();
		}
	});
}

$(document).ready(function(){
    ensureAuthenticated();
});

$('.viewBtn').click(function() {
	var departmentID = $(this).attr('id');
	$.get('/clubs/membersOfSingleDepartment/'+departmentID, function(data) {
		if(data.public==="false") {
			var html = 'Private Members!';
			$('#backgroundDiv').show();
			$('#topDiv').html(html);
			$('#topDiv').show();
		}
		var html = '<div id=\"membersTable\" class=\"container\" style=\"margin-left25%; float:left; margin-top:100px; border: solid white;\">'
				+ '<h2>Members of '+data.name+'</h2>'
			+ '<table class=\"table\">'
			+ '<thead><tr>'
    		+ '<th style=\"width: 10%;\"></th>'
			+ '<th style=\"width: 30%;\">Name</th>'
			+ '<th style=\"width: 20%;\">Role</th>'
			+ '<th style=\"width: 20%;\">Rating</th>'
			+ '<th style=\"width: 20%;\">Review</th>'
  			+ '</tr></thead>'
				+ '<tbody>';
		data.members.forEach(function(member, index) {
			if(member!=null) {
				
				html += '<tr><td>#'+index+'</td>';
				if(member.exists=="true") {
					html += '<td><a href=\"/users/viewprofile/'+member.profileId+'\">'+member.name+'</a></td>'
				} else {
					html += '<td>'+member.name+'</td>'
				}
				html += '<td>'+member.role+'</td>'
				+ '<td>'+member.rating+'</td>'
				+ '<td>'+member.review+'</td>'
				+ '</tr>';
			}
		});
		html += '</tbody></table></div>';
		$('#backgroundDiv').show();
		$('#tableTopDiv').html(html);
		$('#tableTopDiv').show();
		$('#topDiv').show();
	});
	getUserPermission(departmentID);
});

var getUserPermission = function(departmentID) {
	$.post('/clubs/getUserPermissionForDepartment/'+departmentID, function(data) {
		console.log(data)
		if(data=="true") {
			var editMembersBtn = '<a class="btn btn-success btn-lg" href=\"/clubs/editMembersOfDepartment/'+departmentID+'\" id=\"editMembersBtn\" style=\"margin-top:40vh; margin-left:50px; float: left; position: fixed;\">Edit Members</a>';
			$('#tableTopDiv').after(editMembersBtn);
		} else {
			$('#editMembersBtn').remove();
		}
	});
}

var getUserPermissionSub = function(departmentID, subDepartmentID) {
	console.log(subDepartmentID)
	$.post('/clubs/getUserPermissionForSubDepartment/'+subDepartmentID, function(data) {
		console.log(data)
		if(data=="true") {
			var editMembersBtn = '<a class="btn btn-success btn-lg" href=\"/clubs/editMembersOfSubDepartment/'+departmentID+'/'+subDepartmentID+'\" style=\"margin-top:40vh; margin-left:50px; float: left; position: fixed;\">Edit Members</a>';
			$('#tableTopDiv').after(editMembersBtn);
		}
	});
}

$('.viewBtnNest').click(function() {
	var departmentID = $(this).parent().parent().find('h4').attr('id');
	var subDepartmentID = $(this).attr('id');
	var url = '/clubs/membersOfNestedDepartment/'+departmentID+"/"+subDepartmentID;
	$.get(url, function(data) {
		if(data.public==="false") {
			var html = 'Private Members!';
			$('#backgroundDiv').show();
			$('#topDiv').html(html);
			$('#topDiv').show();
		}
		var html = '<div id=\"membersTable\" class=\"container\" style=\"width:70%; margin-top:100px; border: solid white;float:left;\">'
				+ '<h2>Members of '+data.name+'</h2>'
			+ '<table class=\"table\">'
			+ '<thead><tr>'
    		+ '<th style=\"width: 10%;\"></th>'
			+ '<th style=\"width: 30%;\">Name</th>'
			+ '<th style=\"width: 20%;\">Role</th>'
			+ '<th style=\"width: 20%;\">Rating</th>'
			+ '<th style=\"width: 20%;\">Review</th>'
  			+ '</tr></thead>'
				+ '<tbody>';
			if(data.members!=null)
			data.members.forEach(function(member, index) {
				if(member!=null)
					html += '<tr><td>#'+index+'</td>'
					+ '<td>'+member.name+'</td>'
					+ '<td>'+member.role+'</td>'
					+ '<td>'+member.rating+'</td>'
					+ '<td>'+member.review+'</td>'
					+ '</tr>';
			});
		html += '</tbody></table></div>';
		$('#backgroundDiv').show();
		$('#tableTopDiv').html(html);
		$('#tableTopDiv').show();
		$('#topDiv').show();
	});
	getUserPermissionSub(departmentID, subDepartmentID);
});

$('.viewBtnSub').click(function() {
	$(this).parent().find('.subDepartment').slideDown();
	$(this).hide();
	$(this).parent().find('.hideBtnSub').show();
});

$('.hideBtnSub').click(function() {
	$(this).parent().find('.subDepartment').slideUp();
	$(this).hide();
	$(this).parent().find('.viewBtnSub').show();
});

$(document).mouseup(function (e) {
    var container = $("#membersTable");
    if (!container.is(e.target) 
        && container.has(e.target).length === 0) {
        container.hide();
        $('#backgroundDiv').hide();
        $('#topDiv').hide();
    }
});

$(document).keyup(function(e) {
  if (e.keyCode === 27) {
		$('#backgroundDiv').hide();
		$('#topDiv').hide();
  }
});

$('#scrollRight').click(function() {
	$('#depsDiv').animate( { scrollLeft: '+=400' }, 300, 'easeOutQuad' );
});
$('#scrollLeft').click(function() {
	$('#depsDiv').animate( { scrollLeft: '-=400' }, 300, 'easeOutQuad' );
});
