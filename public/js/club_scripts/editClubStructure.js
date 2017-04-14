var h2s = document.getElementsByClassName('clickableh2');

Array.prototype.forEach.call(h2s, function(el) {
	el.onclick=function() {
		window.location = "/users/viewprofile/"+el.id;
	}
});

$("label").click(function() {
	$(this).parent().find("input").nextAll().css({"color": "#ddd"});
	$(this).css({"color": "#FFD700"});
	$(this).nextAll().css({"color": "#FFD700"});

	//.rating > input:checked ~ label, /* show gold star when clicked */

	var myelement = $(this).prev();

	console.log($(this).prev().val());
	var rating = myelement.val();
	var memberID = myelement.parent().parent().parent().find("h4").attr('id');
	var departmentName = myelement.parent().parent().parent().parent().attr('name');
	var departmentID = myelement.parent().parent().parent().parent().attr('id');
	var objID = myelement.parent().parent().parent().find("h4").attr('objid');
	var nestedType = myelement.parent().parent().parent().attr("nested");
	var newUrl;
	if(nestedType=="nested") {
		var subDepID = myelement.parent().parent().parent().parent().attr("id");
		newUrl = "/clubs/rateMember/"+departmentID+"/"+subDepID+"/"+memberID+"/"+objID+"/"+rating;
	} else {
		newUrl = "/clubs/rateMember/"+departmentID+"/"+memberID+"/"+objID+"/"+rating;
	}
	window.location = newUrl;

});

$("fieldset").each(function(i) {
	var rating = $(this).parent().attr('rating');
	console.log(rating);
	if(!rating)
		rating="0";
	var inputElement = $(this).find("[value="+rating+"]");
	$(this).find("input").nextAll().css({"color": "#ddd"});
	inputElement.css({"color": "#FFD700"});
		inputElement.nextAll().css({"color": "#FFD700"});
	console.log($(this).find("[value="+rating+"]").val());
});

$(".checkbox").click(function() {
	if($(this).attr('checkboxVal')=="false") {
		$(this).attr('checkboxVal', 'true');
		$(this).parent().find('.checkboxVal').val('true');
		$(this).parent().find('.checkboxVal').attr('value', 'true');
	} else {
		$(this).attr('checkboxVal', 'false');
		$(this).parent().find('.checkboxVal').val('false');
		$(this).parent().find('.checkboxVal').attr('value', 'false');
	}
});

$(".checkboxNested").click(function() {
	if($(this).attr('checkboxVal')=="false") {
		$(this).attr('checkboxVal', 'true');
		$(this).parent().find('.checkboxVal').val('true');
		$(this).parent().find('.checkboxVal').attr('value', 'true');
	} else {
		$(this).attr('checkboxVal', 'false');
		$(this).parent().find('.checkboxVal').val('false');
		$(this).parent().find('.checkboxVal').attr('value', 'false');
	}
});

$('#logoEdit').click(function() {
	$('#fileUpload').click();
});

$('#presEdit').click(function() {
	$('#presFile').click();
});

$('.headChange').click(function() {
	$('#depFile').click();
});

$('.subChange').click(function() {
	var file = $(this).parent().parent().find('#subDepFile');
	file.click();
});

$(document).ready(function() {
	$('.showAddSub').click(function() {
		$(this).next().slideDown();
		$(this).fadeOut();
	});
});