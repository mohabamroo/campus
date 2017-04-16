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
		    // + '<td>'+memberObj.departmentName+'</td>'
		    + '<td>'+memberObj.role+'</td>'
		    + '<td><div rating=\"'+memberObj.rating+'\">'
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
		    + '<td class=\"reviewClass\" style=\"text-overflow: ellipsis; max-width: 100px;white-space: nowrap;overflow: hidden;\" onclick=\"viewReview(\''+memberObj.name+'\', \''+memberObj.review+'\')\">'+memberObj.review+'</td>';
		    if(memberObj.comment!=null)
		    	html+= '<td>'+memberObj.comment +'</td></tr>';
		    else
		       	html+= '<td>no comment</td></tr>';
		});
	$('#organizationsBody').append(html);
	updateRatings();
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
function updateRatings() {
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
}
$(document).keyup(function(e) {
  if (e.keyCode === 27) {
		$('#backgroundDiv').hide();
		$('#topDiv').hide();
  }
});
