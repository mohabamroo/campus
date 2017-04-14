var showEventDetails = function(offerID) {
	$.get('/offers/getOffer/'+offerID, function(offer) {
		var html = '<div class=\"row row-eq-height container\" style=\"margin-top: 40px; margin-left: auto; margin-right:auto; max-width: 800px; word-wrap: break-word;\">'
		    +	'<div style=\"max-width: 100%; margin-left: 10%;\">'
			+	'<img class=\"col-lg-6 portfolio-item\" src=\"/offers_uploads/'+offer.photo+'\" alt=\"Generic placeholder image\" style=\"align-self: center;\">'
		 	+	'<div class=\"col-lg-6\" style=\"text-align: left;border: 2px white solid; font-weight: bolder;\">'
			+	'<h2 id=\"'+event.id+'\">'
			+	'<span class=\"eventTitle\">'+offer.company+'</span>'
			+	'<hr><p style=\"font-size: 15px;font-weight: bolder;\">'
			+	'from: '+offer.from+'<br>to: '+offer.to+'<br><br>'
			+	'</p></h2><p style=\"overflow-wrap: break-word; font-size: 25px; max-width: 80%;\">Summary:'
			+	'<br>'+offer.description
			+	'</p></div></div></div>';
		$('#topDiv').html(html);
		$('#backgroundDiv').show();
	    $('#topDiv').show();
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
				+	'<img class=\"img col-lg-3 portfolio-item\" src=\"/offers_uploads/'+event.photo+'\" alt=\"Generic placeholder image\" width=\"200\" height=\"220\" style=\"align-self: center; margin-top: 1%;\">'
		 	   	+	'<div class=\"col-lg-3\" style=\"text-align: left;\">'
			 	+   '<h2 id=\"'+event._id+'\">'
				+	'<span class=\"eventTitle\" onclick=\"showEventDetails(\''+event._id+'\')\">'+event.company
				+	'</span><br><br>'
				+	'<p style=\"font-size: 20px;\">'
				+	''+event.summary+'</p>'
				+	'</h2></div>'
				+	'<div class=\"col-lg-2\"></div>'
			    +	'<hr style=\"width: 80%\"></div>';
		});
		if(max>2) {
			html += '<div class=\"row col-lg-12\" id=\"seeMoreDiv\" style=\"width: 100%\">'
				+	'<div class=\"col-lg-4\"></div>'
			 	+	'<div class=\"col-lg-4\" style=\"text-align: center;\">'
				+ 	'<h4 class=\"eventTitle\" id=\"seeMoreBtn\">'
				+	'See More</h4></div>'
				+	'<div class=\"col-lg-4\"></div>'
				+	'<hr style=\"width: 80%\"></div>';
		}
	} else {
		html += '<h1 style=\"text-align:center;\">no curent offers!</h1>';
	}
	$('#eventsContainer').slideUp('fast', function() {
	   	$('#eventsContainer').html(html);
	   	updateSeeMore();
		$('#eventsContainer').slideDown();
	});	
}

var updateSeeMore = function() {
	$('#seeMoreBtn').click(function() {
		$('#seeMoreDiv').remove();
		$('.row').slideDown();
	});
}

$('.typeBtn').click(function() {
	console.log($(this).attr('offersType'));
	$('.typeBtn').css('color', 'black');
	$(this).css('color', '#18BC9C');
	var type = $(this).attr('offersType');
	$.get('/offers/viewOffers/'+type, function(offers) {
		console.log(offers)
		updateEventsContainer(offers);
	});
});

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

$('#seeMoreBtn').click(function() {
	$('#seeMoreDiv').remove();
	$('.row').slideDown();
});

$(document).ready(function() {
	$('.typeBtn[offersType="entertainment"]').click();
});