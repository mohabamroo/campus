var redirectSignIn = function() {
	window.location.href = '/users/signin'; 
}

var redirectToLink = function(link) {
	console.log(link);
	window.open(link,'_blank');
}

var updatehidden = function() {
	$('#hiddentxt').val(document.getElementById('faketxt').innerText)
	console.log($('#hiddentxt').val());
	// document.getElementById('hiddentxt').innerText = document.getElementById('faketxt').innerText;
}

$('#deleteTags').click(function(event) {
    event.preventDefault();
    console.log('ahoo');
    $.post('/users/deleteTags', function(data) {
    	if(data=="success") {
    		$('#tags').slideUp();
    	}
    });
});

$(document).ready(function() {
   $('#toIN').css('width', $('#fromIN').css('width')); 
});

var url = $(location).attr('href').split('/');
var userID = url[url.length-1];
$.post('/users/getOrganizations/'+userID, function(myMembers) {
	var html = "";
	myMembers.forEach(function(memberObj, index) {
	    html += '<tr id=\"'+memberObj._id+'\"><td>#'+index+'</td>'
		    + '<td>'+memberObj.club
		    + '<br><span style="font-size: 10px;">From: '
		    + memberObj.from +'</span>'
		    + '<br><span style="font-size: 10px;">To: '
		    + memberObj.to +'</span>'+'</td>'
		    + '<td>'+memberObj.departmentName+'</td>'
		    + '<td>'+memberObj.role+'</td>'
		    + '<td>'+memberObj.rating+'</td>'
		    + '<td class=\"reviewClass\" style=\"text-overflow: ellipsis; max-width: 100px;white-space: nowrap;overflow: hidden;\" onclick=\"viewReview(\''+memberObj.name+'\', \''+memberObj.review+'\')\">'+memberObj.review+'</td>';
		var comment = memberObj.comment || "no comment";
		html += '<td class=\"commentClass\" style=\"text-overflow: ellipsis; max-width: 100px;white-space: nowrap;overflow: hidden;\" onclick=\"editComment(\''+memberObj.club+'\', \''+memberObj._id+'\', \''+comment+'\')\">'+comment+'</td>';
		    
		    html +='<td><button class=\"btn btn-success deleteDepartmentClass\" style=\"margin: 10px;\">Delete</button></td></tr>';
		});
	$('#organizationsBody').append(html);
	appendDeleteAction();
});

var appendDeleteAction = function() {
	$('.deleteDepartmentClass').click(function() {
		var row = $(this).parent().parent();
		var memberID = $(this).parent().parent().attr('id');
		$.post('/users/deleteOrganization/'+memberID, function(data) {
			console.log(data)
			if(data=="ok") {
				console.log(row.attr('id'))
				row.hide('slow', function(){ row.remove(); });

			}
		});
	});
}

var viewReview = function(name, review) {
	var html = '<div id=\"reviewDiv\" style=\"position: fixed; align-self: center; margin-top: 50px; margin-left: 30%; width: 500px; height: 300px;\">'
		+	'<h3 style=\"color: white;\">Review of '+name+'</h3><hr>'
		+	'<p style=\"width: 100%; height: 80%; color: white;\">'+review+'</p>'
		+	'<div style=\"float: right;\">'
		+	'</div></div>';
	$('#topDiv').html(html);
	$('#backgroundDiv').show();
    $('#topDiv').show();
}

var editComment = function(organizationName, id, comment) {
	var html = '<div id=\"reviewDiv\" style=\"position: fixed; align-self: center; margin-top: 50px; margin-left: 30%; width: 500px; height: 300px;\">'
		+	'<h3 style=\"color: white;\">Comment about '+organizationName+'</h3><hr>'
		+	'<textarea id=\"newComment\" style=\"width: 100%; height: 80%; color: black;\" placeholder=\"'+comment+'\"></textarea>'
		+	'<div style=\"float: right;\">'
		+	'<button class=\"btn cancelBtn\" style=\"margin-right: 10px;\">Cancel</button>'
		+	'<button class=\"btn btn-success\" onclick=\"editCommentOf(\''+id+'\')\">Update</button>'
		+	'</div></div>';
	$('#topDiv').html(html);
	$('#backgroundDiv').show();
    $('#topDiv').show();
}

var editCommentOf = function(id) {
	var newComment = $('#newComment').val();
	console.log(newComment)
	$.post('/users/editCommentOf/'+id+'/'+newComment, function(data) {
		if(data.edited=="true") {
			$('#'+id).find('.commentClass').text(newComment);
			$('#backgroundDiv').hide();
    		$('#topDiv').hide();
		} else {
			alert("not updated!")
		}
	});
}

$('.img-edit').click(function() {
	$('#fileUpload').click();
	})

$(document).mouseup(function (e) {
    var container = $("#reviewDiv");
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
