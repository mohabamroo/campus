var redirectSignIn = function() {
	window.location.href = '/users/signin'; 
}

var redirectToLink = function(link) {
	console.log(link);
	window.open(link,'_blank');
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

var url = $(location).attr('href').split('/');
var userID = url[url.length-1];
$.post('/users/getOrganizations/'+userID, function(myMembers) {
	var html = "";
	if(myMembers==null||myMembers.length<1) {
		$('#organizationTable').html("<h2>No organizations!</h2>");
		return;
	}
	myMembers.forEach(function(memberObj, index) {
	    html += '<tr><td>#'+index+'</td>'
		    + '<td>'+memberObj.club
		    + '<br><span style="font-size: 10px;">From: '
		    + memberObj.from +'</span>'
		    + '<br><span style="font-size: 10px;">To: '
		    + memberObj.to +'</span>'
		    + '</td>'
		    + '<td>'+memberObj.departmentName+'</td>'
		    + '<td>'+memberObj.role+'</td>'
		    + '<td>'+memberObj.rating+'</td>'
		    + '<td class=\"reviewClass\" style=\"text-overflow: ellipsis; max-width: 100px;white-space: nowrap;overflow: hidden;\" onclick=\"viewReview(\''+memberObj.name+'\', \''+memberObj.review+'\')\">'+memberObj.review+'</td>';
		    if(memberObj.comment!=null)
		    	html+= '<td>'+memberObj.comment +'</td></tr>';
		    else
		       	html+= '<td>no comment</td></tr>';
		});
	$('#organizationsBody').append(html);
});

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
