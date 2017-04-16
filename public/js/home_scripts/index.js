$('#searchBtn').click(function() {
	var searchTerm = $('#searchInput').val();
	$('#searchMsg').hide();
	getSearchResult(searchTerm);

});

$.fn.enterKey = function(fnc) {
    return this.each(function () {
        $(this).keypress(function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                fnc.call(this, ev);
            }
        })
    })
}

$("#searchInput").enterKey(function() {
	$('#wholeTable').slideDown();
	$('#searchMsg').hide();
    var searchTerm = $('#searchInput').val();
	getSearchResult(searchTerm);
});

var getSearchResult = function(searchTerm) {
	if(searchTerm==""){
		$('#searchMsg').show();
		return;
	}
	$.get('/search/students/'+searchTerm, function(data) {
		// console.log(JSON.stringify(data));
		$('#studentsBody').html("");
		var html = "";
		if(data==null || data=="null" || data.length==0) {
			$('#searchMsg').show();
			return;
		} else {
			data.forEach(function(student, index) {
				html += '<tr><td  style=\"max-width: 5%;\">'+(index+1)+'</td>'
					+ '<td style=\"max-width: 20%;\"><a href="/users/viewprofile/'+student.user._id+'">'+student.user.username+'</a></td>'
					+ '<td style="max-width: 10%;word-break:break-all;">'+student.user.gucid+'</td>'
					+ '<td  style=\"max-width: 30%;word-break:break-all;\">';
					student.user.tags.forEach(function(tag, index) {
						html += tag;
						if(index<student.user.tags.length-1 && index<3)
							html += ' - ';
					});
					html += '</td>'
						+ '<td style="max-width: 20%;">'+student.member.club+'</td>'
						+ '<td style="max-width: 20%;">'+student.member.rating+'</td>';
			});
		}
		$('#searchMsg').hide();
		$('#studentsBody').append(html);
	});
}
