var showEventDetails = function(id) {
	$.get('/events/getEvent/'+id, function(event) {
		if(event!=null) {
			var html = '<div class=\"row row-eq-height container\" style=\"margin-top: 40px; margin-left: 10%; max-width: 70%; word-wrap: break-word;\">'
					+	'<div class=\"col-lg-1\"></div>'
				    +	'<div style=\"max-width: 100%; margin-left: 10%;\">'
					+	'<img class=\"col-lg-6 portfolio-item img-\" src=\"/club_uploads/events/'+event.photo+'\" alt=\"Generic placeholder image\" style=\"align-self: center; margin-top: 1%; max-height: 60vh;\">'
				 	+	'<div class=\"col-lg-6\" style=\"text-align: left;border: 2px white solid; font-weight: bolder;\">'
					+	'<h2 id=\"'+event.id+'\">'
					+	'<span class=\"eventTitle\">'+event.name+'</span>'
					+	'<hr><p style=\"font-size: 15px;font-weight: bolder;\">'
					+	'by:'+event.organizer
					+	'<br><br>location:'+event.location+'<br><br>'
					+	'from: '+event.fromDate+'<br>to: '+event.toDate+'<br><br>'
					+	'type: '+event.type
					+	'</p></h2><p style=\"overflow-wrap: break-word; font-size: 25px; max-width: 80%;\">Summary:'
					+	'<br>'+event.Summary
					+	'</p></div></div><div class=\"col-lg-1\"></div></div>';
			$('#topDiv').html(html);
		} else {
			$('#topDiv').html('<h1>No event found!</h1>');
		}
		$('#backgroundDiv').show();
	    $('#topDiv').show();
	});
}

$(document).keyup(function(e) {
	if (e.keyCode === 27) {
		$('#backgroundDiv').hide();
		$('#topDiv').hide();
	}
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

var updateSeeMore = function() {
	$('#seeMoreBtn').click(function() {
		$('#seeMoreDiv').remove();
		$('.row').slideDown();
	});
}

var updateEventsContainer = function(events) {
	var max;
	var html = "";
	if(events!=null && events.length>0) {
		events.forEach(function(event, index) {
			max = index;
			if(index<=2) {
				html += '<div class=\"row row-eq-height\" style=\"width: 100%;\">';
			} else {
				html += '<div class=\"row row-eq-height\" style=\"width: 100%; display: none;\">';
			}
		    html += '<div class=\"col-lg-2\"></div>'
				+	'<img class=\"img col-lg-3 portfolio-item\" src=\"/club_uploads/events/'+event.photo+'\" alt=\"Generic placeholder image\" width=\"200\" height=\"220\" style=\"align-self: center; margin-top: 1%;\">'
		 	   	+	'<div class=\"col-lg-3\" style=\"text-align: left;\">'
			 	+   '<h2 id=\"'+event._id+'\">'
				+	'<span class=\"eventTitle\" onclick=\"showEventDetails(\''+event._id+'\')\">'+event.name
				+	'</span><br><br>'
				+	'<p style=\"font-size: 10px;\">'
				+	'by: '+event.organizer
				+	'<br><br>'
				+	'location: '+event.location
				+	'<br><br>'
				+	'from: '+event.fromDate
				+	'<br><br>'
				+	'to: '+event.toDate+'</p>'
				+	'</h2></div>'
				+	'<div class=\"col-lg-2\"></div>'
			    +	'<hr style=\"width: 80%\"></div>';
		});
		if(max>2) {
			html += '<div id="seeMoreDiv" style="width: 100%; text-align: center; margin-left:auto; margin-right: auto;">'
			 	+	'<div  style="text-align: center;">'
				+ 	'<h4 id="seeMoreBtn" class="eventTitle">'
				+	'See More</h4></div>'
				+	'<hr style="width: 80%;"></div>';
		}
	} else {
		html += '<h3>no curent events!</h3>';
	}
	$('#eventsContainer').slideUp('fast', function() {
	   	$('#eventsContainer').html(html);
	   	updateSeeMore();
		$('#eventsContainer').slideDown();
	});	
}

$(document).ready(function() {
	$('#nowBtn').click();
})

$('#nowBtn').click(function() {
	$.get('/events/current/', function(events) {
		updateEventsContainer(events);			
	});
	$('#nowBtn').css('color', '#18BC9C');
	$('#oldBtn').css('color', 'black');
	$('#comingBtn').css('color', 'black');
});

$('#oldBtn').click(function() {
	$.get('/events/old/', function(events) {
		updateEventsContainer(events);			
	});
	$(this).css('color', '#18BC9C');
	$('#nowBtn').css('color', 'black');
	$('#comingBtn').css('color', 'black');
});

$('#comingBtn').click(function() {
	$.get('/events/coming/', function(events) {
		updateEventsContainer(events);			
	});
	$(this).css('color', '#18BC9C');
	$('#oldBtn').css('color', 'black');
	$('#nowBtn').css('color', 'black');
});