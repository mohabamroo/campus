$('#searchBtn').click(function() {
	var searchTerm = $('#searchInput').val();
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
		if(data==null || data.length==0) {
			$('#searchMsg').show();
			return;
		} else {
			data.forEach(function(student, index) {
				html += '<tr><td  style=\"width: 10%;\">'+(index+1)+'</td>'
					+ '<td style=\"width: 20%;\"><a href="/users/viewprofile/'+student.user._id+'">'+student.user.username+'</a></td>'
					+ '<td  style=\"width: 30%;\">';
					student.user.tags.forEach(function(tag, index) {
						html += tag;
						if(index<student.user.tags.length-1)
							html += ' - ';
					});
					html += '</td>'
						+ '<th style="width: 20%;">'+student.member.club+'</th>'
						+ '<th style="width: 20%;">'+student.member.rating+'</th>';
			});
		}
		$('#searchMsg').hide();
		$('#studentsBody').append(html);
	});
}
