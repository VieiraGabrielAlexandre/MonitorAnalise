/* _Prtg.Api.js */
(function($, window, document, undefined) {
	var privatePrefix = "_";
	var api = <#include file="javascript\_Prtg.Api.json">;

	function createArgList(req, opt) {
		var result = Array.isArray(req) ? req.slice(0) : [];

    Array.isArray(opt) && opt.forEach(function(value) {
      var values = value.split('=');
      result.push(privatePrefix + values[0]);
    });

    result.push('_ajaxOptions');

    return result.join(',');
	}

	function createDataObjString(reqArgs, optArgs) {
		var result = '';

    Array.isArray(reqArgs) && reqArgs.forEach(function(value) {
      if(result !== '') result += ',';
      result += '"' +  value + '": ' + value;
    });

    Array.isArray(optArgs) && optArgs.forEach(function(value) {
      var values = value.split('=');
      var defaultvalue =  privatePrefix + values[0] + (values.length > 1 ? ' || ' + values[1] : '');
      if(result !== '') result += ',';
      result += '"' + values[0] + '": ' + defaultvalue;
    });
		return '{' + result + '}';
	}

	function createDefaultCall(callObj) {
		return new Function(createArgList(callObj.required, callObj.optional), 'return _Prtg.api.send("' + callObj.url + '", ' + createDataObjString(callObj.required, callObj.optional) + ', _ajaxOptions);');
	}

	function callsFactory() {
		var calls = {};

		Object.keys(api).forEach(function(key) {
      var apicall = api[key];
      if(!!apicall.url) calls[key] = createDefaultCall(api[key]);
    });

    return calls;
	}

  _Prtg = !!_Prtg ? _Prtg : {};
	_Prtg.api = callsFactory();
	_Prtg.api.send = function apiCall(url, data, options) {
		var ajax = $.extend(true, {
				url: url,
				data: data,
				method: 'POST',
        beforeSend: function(jqXHR){
          jqXHR.ignoreManager = true;
        }
			},
			options || {});
		return $.ajax(ajax);
	};

})(jQuery, window, document);

