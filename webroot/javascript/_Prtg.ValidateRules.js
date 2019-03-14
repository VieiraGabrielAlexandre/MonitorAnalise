$.validator.addMethod("dateDE", function(value, element) { return this.optional(element) || /^\d\d?\.\d\d?\.\d\d\d?\d?$/.test(value) }, '<#langjs key="js.validate.date" default="Please enter a valid date.">');
$.validator.addMethod("numberDE", function(value, element) { return this.optional(element) || /^-?\d*\,?\d*$/.test(value) }, '<#langjs key="js.validate.number" default="Please enter a valid number.">');
$.validator.addMethod("number", function(value, element) { return this.optional(element) || /^-?\d*\.?\d*$/.test(value) }, '<#langjs key="js.validate.number" default="Please enter a valid number.">');
$.validator.addMethod("selectrequired", function(value, element) { return this.optional(element) || (value = '' || !/^(\|+)$/.test(value)) }, '<#langjs key="js.validate.select" default="Please select a value.">');
$.validator.addMethod("ipcbase", function(value, element) { return this.optional(element) || /^\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b$/.test(value) }, '<#langjs key="js.validate.ipcbase" default="Please enter a valid class C network IP base (e.g. 192.168.0 ).">');
$.validator.addMethod("iplist", function(value, element) { return this.optional(element) || true }, '<#langjs key="js.validate.iplist" default="Please enter a list of valid IP addresses.">');
$.validator.addMethod("ipsubnet", function(value, element) { return this.optional(element) || /^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b\/\b((3[0-1]|[12][0-9]|[1-9])|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\b$/.test(value) }, '<#langjs key="js.validate.ipsubnet" default="Please enter a valid IP subnet (e.g. 192.168.0.0/255.255.255.0 or 192.168.0.0/24).">');
$.validator.addMethod("ipoctetrange", function(value, element) { return this.optional(element) || /^(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\.(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\.(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b))$/.test(value) }, '<#langjs key="js.validate.ipoctetrange" default="Please enter a valid network IP octet range (e.g. 192.168.0-10.1-255 ).">');
$.validator.addMethod("ipsingle", function(value, element) { return this.optional(element) || true }, '<#langjs key="js.validate.ipsingle" default="Please enter a single valid IP address (e.g. 192.168.0.1 ).">');
$.validator.addMethod("hexcolor", function(value, element) { return this.optional(element) || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) }, '<#langjs key="js.validate.hexcolor" default="Please enter a valid hex color with prefixed #">');
$.validator.addMethod("oid", function(value, element) { return this.optional(element) || /^[.]?1\.[0-3](\.(([0-9]+)|("[A-Za-z0-9]+")|('[A-Za-z0-9]+')))+$/.test(value) || /^norfccheck:.*/i.test(value) }, '<#langjs key="js.validate.oid" default="Please enter a valid OID value (e.g. 1.3.6.1.2.1.1.3.0 or 1.3.6.1.4.&quot;apcupsd&quot;.2)">');
$.validator.addMethod("mapsecretkey", function(value, element) { var check = true; if (value.indexOf(",") !== -1) check = false; if (value.indexOf(":") !== -1) check = false; return this.optional(element) || check }, '<#langjs key="js.validate.mapsecretkey" default="The characters , and : are not allowed">');
$.validator.addMethod("passwordcapital", function(value, element) { var check = false; if ($("#login_").length > 0 && $("#login_").val() === "prtgadmin" && value === "prtgadmin") check = true;
    else check = /[A-Z]/.test(value); return this.optional(element) || check }, '<#langjs key="js.validate.passwordcapital" default="Minimum 1 capital letter (A-Z)!">');
$.validator.addMethod("passwordnumber", function(value, element) { var check = false; if ($("#login_").length > 0 && $("#login_").val() === "prtgadmin" && value === "prtgadmin") check = true;
    else check = /[0-9]/.test(value); return this.optional(element) || check }, '<#langjs key="js.validate.passwordnumber" default="Minimum 1 number!">');
$.validator.addMethod("passwordchartimes", function(value, element) { return true; var passwordchartimescheck = false; if ($("#login_").length > 0 && $("#login_").val() === "prtgadmin" && value === "prtgadmin") passwordchartimescheck = true;
    else passwordchartimescheck = !/(.)(.*\1){3,}/.test(value); return this.optional(element) || passwordchartimescheck }, '<#langjs key="js.validate.passwordchartimes" default="Not more than 3 identical characters!">');
$.validator.addMethod("pwminlength", function(value, element, param) { var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element); return this.optional(element) || length >= param }, $.validator.format('<#langjs key="js.validate.minlength" default="Please enter at least {0} characters.">'));
$.validator.addMethod("asciionly", function(value, element) { return this.optional(element) || /^[\x00-\x7F]*$/.test(value) }, '<#langjs key="js.validate.asciionly" default="Please enter ASCII characters only!">');
$.validator.addMethod("purgedate", function(value, element) { var selected = $(element).data("plugin_prtgDatetimepicker").getCurrentSelectedDate(); var arr = _Prtg.Options.lastpurgedate.split("-"); var lastpurge = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]); var result = false; if (selected.getTime() > lastpurge.getTime()) result = true; if ($(element).hasClass("orginal_input")) result = true; return this.optional(element) || result }, function() {
    var helpText = '<#langjs key="js.validate.purgedate" default="Warning: You cannot generate the historic data report because data is only available as of the last data purge on PURGEDATE. Please adjust the start date accordingly.">';
    helpText = helpText.replace("PURGEDATE", _Prtg.Options.lastpurgedate);
    return helpText
});
$.validator.addMethod("requiredtablecheckbox",function(value, element) {
	var d = $(element).closest('table.dataTable')
	if(d.length == 0) return true;
	d = d.DataTable();
	return $('input.checkbox', d.rows().nodes()).toArray().some(function(e) {return e.checked;})
}, '<#langjs key="js.validate.select" default="Please select a value.">');
    
$.validator.addMethod("ticketnumber", function(value, element) { var number = value.substr(3); return this.optional(element) || number > 1E5 && /^(pae|PAE)[0-9]{6}[0-9]?$/.test(value) }, '<#langjs key="js.validate.ticketnumber" default="Please enter your ticket number in the form PAE plus seven digits">');

// This rule alwaysshow an "please select a value" error. Used on objectlookup for example.
$.validator.addMethod("showrequired",function(value, element) {
    return false
}, '<#langjs key="js.validate.select" default="Please select a value.">');

jQuery.extend(jQuery.validator.messages, {
    required: '<#langjs key="js.validate.required" default="This field is required.">',
    remote: '<#langjs key="js.validate.remote" default="Please fix this field.">',
    email: '<#langjs key="js.validate.email" default="Please enter a valid email address.">',
    url: '<#langjs key="js.validate.url" default="Please enter a valid URL.">',
    date: '<#langjs key="js.validate.date" default="Please enter a valid date.">',
    dateISO: '<#langjs key="js.validate.dateISO" default="Please enter a valid date (ISO).">',
    number: '<#langjs key="js.validate.number" default="Please enter a valid number.">',
    digits: '<#langjs key="js.validate.digits" default="Please enter only digits.">',
    creditcard: '<#langjs key="js.validate.creditcard" default="Please enter a valid credit card number.">',
    equalTo: '<#langjs key="js.validate.equalTo" default="Please enter the same value again.">',
    accept: '<#langjs key="js.validate.accept" default="Please enter a value with a valid extension.">',
    maxlength: $.validator.format('<#langjs key="js.validate.maxlength" default="Please enter no more than {0} characters.">'),
    minlength: $.validator.format('<#langjs key="js.validate.minlength" default="Please enter at least {0} characters.">'),
    rangelength: $.validator.format('<#langjs key="js.validate.rangelength" default="Please enter a value between {0} and {1} characters long.">'),
    range: $.validator.format('<#langjs key="js.validate.range" default="Please enter a value between {0} and {1}.">'),
    max: $.validator.format('<#langjs key="js.validate.max" default="Please enter a value less than or equal to {0}.">'),
    min: $.validator.format('<#langjs key="js.validate.min" default="Please enter a value greater than or equal to {0}.">')
});

$.validator.addMethod("oneof", function(value, element) { var selected = $(element).data("plugin_prtgDatetimepicker").getCurrentSelectedDate(); var arr = _Prtg.Options.lastpurgedate.split("-"); var lastpurge = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]); var result = false; if (selected.getTime() > lastpurge.getTime()) result = true; if ($(element).hasClass("orginal_input")) result = true; return this.optional(element) || result }, function() {
    var helpText = '<#langjs key="js.validate.purgedate" default="Warning: You cannot generate the historic data report because data is only available as of the last data purge on PURGEDATE. Please adjust the start date accordingly.">';
    helpText = helpText.replace("PURGEDATE", _Prtg.Options.lastpurgedate);
    return helpText
});

/*
 * Lets you say "at least X inputs that match selector Y must be filled."
 *
 * The end result is that neither of these inputs:
 *
 *	<input class="productinfo" name="partnumber">
 *	<input class="productinfo" name="description">
 *
 *	...will validate unless at least one of them is filled.
 *
 * partnumber:	{require_from_group: [1,".productinfo"]},
 * description: {require_from_group: [1,".productinfo"]}
 *
 * options[0]: number of fields that must be filled in the group
 * options[1]: CSS selector that defines the group of conditionally required fields
 */
$.validator.addMethod("validgroup", function( value, element, options ) {

	var $fields = $("[data-rule-validgroup='"+options+"']:visible", element.form ),
		$fieldsFirst = $fields.eq( 0 ),
		validator = $fieldsFirst.data( "valid_req_grp" ) ? $fieldsFirst.data( "valid_req_grp" ) : $.extend( {}, this ),
		isValid = $fields.filter( function() {
			return validator.elementValue( this );
        } ).length >= 1;
    
	// Store the cloned validator for future validation
	$fieldsFirst.data( "valid_req_grp", validator );

	// If element isn't being validated, run each require_from_group field's validation rules
	if ( !$( element ).data( "being_validated" ) ) {
		$fields.data( "being_validated", true );
		$fields.each( function() {
			validator.element( this );
		} );
		$fields.data( "being_validated", false );
	}
	return isValid;
}, $.validator.format('<#langjs key="js.validate.pleaseenteralimit" default="Enter a value.">') );