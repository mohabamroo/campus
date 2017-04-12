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
