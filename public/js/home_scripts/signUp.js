var redirectSignIn = function() {
	window.location.href = '/users/signin'; 
}
var firstChange = true;
$('#userType').on('change', function() {
  var type = this.value;
  if(type==="club") {
    $('#majorDiv').next().hide();
    $('#yearDiv').slideUp();
    $('#yearDiv').next().hide();
    $('#majorDiv').slideUp();
    $('#idDiv').slideUp();
    $('#birthdateDiv').next().hide();
    $('#birthdateDiv').slideUp();
    $('#inputGUCID').next().remove();
    $('#inputGUCID').remove();
    $('#major').remove();
    $('#birthdateInput').remove();
    firstChange = false;
  }
  if(type==="student" && !firstChange) {
    firstChange = false;
    $('#majorDiv').next().show();
    $('#majorDiv').slideDown();
    $('#yearDiv').next().show();
    $('#yearDiv').slideDown();
    var idHTML = '<input type="text" id=\"inputGUCID\" class=\"form-control\" placeholder=\"ex: 34-5862\" name=\"gucid\" required autofocus data-validation-required-message=\"Please enter your GUC-ID.\"><p class=\"help-block text-danger\"></p>';
    var birthdateHTML = '<input type=\"date\" id=\"birthdateInput\" name=\"birthdate\" class=\"form-control\" required data-validation-required-message=\"Please enter your birthdate.\">';
    var majorHTML = '<select class="form-control" id="major" name="major" required>'
            + '<option value="" disabled selected style="display:none;">choose</option>'
            + '<option value="met">MET</option>'
            + '<option value="iet">IET</option>'
            + '<option value="mecha">Mechatronics</option>'
            + '<option value="production">Production</option>'
          + '</select>';
    $('#majorDivChild').append(majorHTML);
    $('#idDivChild').append(idHTML);
    $('#birthdateDivChlid').append(birthdateHTML);
    $('#birthdateDiv').next().show();
    $('#idDiv').slideDown();
    $('#birthdateDiv').slideDown();    
  }
});
