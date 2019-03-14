var paeAuth = function(config,Auth0){

	if(typeof config !== 'object') return console.log('paeAuth: The config object is invalid.');

	var auth0,crypt,selfhost,selfurl,that=this;

	var _constructor = function(){

		auth0 = new Auth0.WebAuth({
	    	domain:       config.Domain, 
	    	clientID:     config.ClientId, 
	    	// // redirect: true,
	    	// // sso: true,
	    	// popup: true,
	    	// // responseType: 'token',
	    	// callbackOnLocationHash: true, //forces redirect and responseType: 'token'
	    	// callbackURL:  location.href
	  	});

	  	crypt=paeCrypt(config.ClientId);

	  	selfhost=location.protocol+'//'+location.host;
	  	selfurl=selfhost+location.pathname;
	  	if(config.pre) (config.pre = crypt(atob(config.pre)).split('$0m3$4l7')) && $(config.userinput).val(config.pre[0]);

	  	if($(config.userinput).val().length) $(config.userinput).prop('disabled', true)

	  	if(!config.afterLoginUrl) config.afterLoginUrl = selfhost;

	  	config.audience = '';//'https://'+config.Domain+'/api/v2/';

	  	config.silentCallback = selfhost+'/public/sso.silentCallback.v8.htm';
	}


///////////// Public Methods /////////////


	this.init = function(){
  		handleSession(null,sessionCallback);
	}

	this.logout=function(evt){
		localStorage.removeItem('paeHash');
		// window.open('https://'+config.Domain+'/v2/logout?returnTo='+selfhost+'&client_id='+config.ClientId, "Logout", "width=0,height=0");
		location.href='https://'+config.Domain+'/v2/logout?client_id='+config.ClientId+'&returnTo='+selfhost;
	}

	this.login=function(user,pw,callback){
		config.hideForm();
		
		/*auth0.client.login({
			realm: config.Database,
			email: user,
			username: user,
			password: pw,
			responseType: 'token',
			scope: "openid profile email address phone",
			redirectUri:  config.afterLoginUrl
			// data:JSON.stringify({
			// 	"email": user,
			// 	"user_metadata" : { redirect_url: location.href },
			// }),
			// popup: true,
			// callbackURL: config.afterLoginUrl
		}, callback || loginCallback);*/

		auth0.popup.loginWithCredentials({
			connection: config.Database,
			email: user,
			username: user,
			password: pw,
			responseType: 'token',
			scope: "openid profile email address phone",
			redirectUri:  config.afterLoginUrl
			// data:JSON.stringify({
			// 	"email": user,
			// 	"user_metadata" : { redirect_url: location.href },
			// }),
			// popup: true,
			// callbackURL: config.afterLoginUrl
		}, callback || loginCallback);

	}

	this.socialLogin=function(evt){
		var realAs = {
			'google': 	'google-oauth2',
			'facebook': 'facebook',
			'github' : 	'github'
		}[evt.target.id];

		if(!realAs) return;

		config.hideForm();

		var callback = config.pre ? accountLinkHandler : loginCallback;

		auth0.login({connection: realAs, popup: true}, callback);
	}

	this.register=function(user,pw){
		$.ajax({
			url:'https://'+config.Domain+'/dbconnections/signup',
			method: "POST",
			contentType: "application/json",
			crossDomain: true,
			processData: false,
			// data:JSON.stringify({
			// 	"client_id": config.ClientId,
			// 	"email": user,
			// 	"password": pw,
			// 	"connection":  config.Database,
			// 	"user_metadata" : { redirect_url: location.href },
			// 	"email_verified": true
			// })
		}).then(function(data){
			successOutput('',config.messages['register_successful_validation_required'].replace(/%email%/g,data.email));
  		}).fail(function(resp){
  			var data=$.parseJSON(resp.responseText);
  			errorOutput('',data.description || data.error);
  		});
	}

	this.resetPassword=function(email){
		auth0.changePassword({
			connection: config.Database,
			email: email
		}, function (err, resp) {
			if(err){
	  			var data=$.parseJSON(resp.responseText);
	  			errorOutput('',data.description || data.error);
			}else{
				successOutput('',config.messages['send_password_success'].replace(/%email%/g,email));
			}
		});
	}

	/*this.verifyMail=function(verifyLink,mail){

		console.log('verifyMail');

		var verifyCode = verifyLink.split('ticket=').pop().split('&').shift().split('#').shift();
		
		if(!verifyCode) return handleError(new Error('Mail verify code missing or invalid'));

		auth0.verifyEmailCode({
			email: mail,
			code: verifyCode
		},function (err, result){
			if (err){
		    	handleError(err);
		  	}else{
		  		console.log('result',result)
		  	}
		});
	}*/


///////////// Private Methods /////////////


var updateMetadata = function(result){

console.log('xxxxx',result);

	var auth0Manage = new Auth0.Management({
	  domain: config.Domain,
	  token: result.accessToken
	});

  auth0.client.userInfo(result.accessToken, function(err, user) {
	console.log('getUserinfo start --------------------------')
	for(var k in user) console.log(k,user[k]);
	console.log('--------------------------------------------')

	var instance = location.host.split('.').shift();
	
	if('user_metadata' in user && 'instances' in user.user_metadata){
		if(!~user.user_metadata.instances.indexOf(instance))
			user.user_metadata.instances.push(instance);
	}else{
		if('user_metadata' in user)
			user.user_metadata.instances=[instance];
		else
			user.user_metadata = {instances:[instance]};
	}
	
	auth0Manage.patchUserMetadata(user.userId, user.user_metadata, function(metadata_response){
				console.log('metadata_response',metadata_response);
	});
    
  });

	
}

	var _updateMetadata = function(result){

		console.log(result)

		getUserinfo(result,function(data){

			console.log('getUserinfo',data)

			var instance = location.host.split('.').shift();
			
			if('user_metadata' in data && 'instances' in data.user_metadata){
				if(!~data.user_metadata.instances.indexOf(instance))
					data.user_metadata.instances.push(instance);
			}else{
				if('user_metadata' in data)
					data.user_metadata.instances=[instance];
				else
					data.user_metadata = {instances:[instance]};
			}
			
			$.ajax({
				type: 'PATCH',
				url: 'https://' + config.Domain +'/api/v2/users/' + data.sub,
				data: { 'user_metadata': { 'instances': data.user_metadata.instances }},
				headers: {'Authorization': 'Bearer ' + result.idToken}
			}).then(function(metadata_response){
				console.log('metadata_response',metadata_response);
			});
		});
	}

	var getUserinfo = function(result,callback){
		console.log('Baerer',result.accessToken)
		$.ajax({url: 'https://' + config.Domain +'/userinfo',headers: {'Authorization': 'Bearer ' + result.accessToken}}).then(callback);
	}

	var linkAccounts = function(second_jwt,second_id){

		that.login(config.pre[0],config.pre[1],function(err,result){

			$.ajax({
				type: 'POST',
				url: 'https://' + config.Domain +'/api/v2/users/' + result.idTokenPayload.sub + '/identities',
				data: { link_with: second_jwt },
				headers: {'Authorization': 'Bearer ' + result.idToken}
			}).then(function(identities){
				loginCallback(err,result);
			}).fail(function(jqXHR){
				errorOutput(jqXHR.status,jqXHR.responseText);
			});

		});
	}

	/** Session Handling **/

	var handleSession = function(session,callback){


		console.log('handleSession',session)

		// if(session === null) session = handleSessionInUrl();
		if(session === null) session = getSessionFromStorage();
		if(session === null){
			getSSOData(callback);
		}else{
			console.log('setSessionToStorage')
			setSessionToStorage(session);
			console.log('validateSessionWithServer')
			validateSessionWithServer(session.accessToken,callback);
		}

		console.log('handleSession done')
	}

	var getSSOData = function(callback){


		auth0.renewAuth({
			audience: config.audience,
			scope: '',
			redirectUri: config.silentCallback,

			// this will use postMessage to comunicate between the silent callback
			// and the SPA. When false the SDK will attempt to parse the url hash
			// should ignore the url hash and no extra behaviour is needed.
			usePostMessage: true
		}, function (err,ssoData){

			console.log('renewAuth: err',err);
			console.log('renewAuth: ssoData',ssoData);

			loginCallback(err,ssoData);
			return;

			if (!err && ssoData && ssoData.sso && ssoData.lastUsedConnection && ssoData.lastUsedConnection.name){
				console.log('session from SSOData');
				auth0.login({popup: true,connection: ssoData.lastUsedConnection.name},loginCallback);
			}else{
				callback(false);
			}
		});

return;
		auth0.getSSOData(true, function(err, ssoData){
			if (!err && ssoData && ssoData.sso && ssoData.lastUsedConnection && ssoData.lastUsedConnection.name){
				console.log('session from SSOData');
				auth0.login({popup: true,connection: ssoData.lastUsedConnection.name},loginCallback);
			}else{
				callback(false);
			}
		});
	}

	var getSessionFromStorage = function(){
		var hash = localStorage.getItem('paeHash');
		if(hash === null) return null;
		hash = paeHash(hash);

		return (Date.now()-hash.upDate > 86400)?null:hash;
	}

	var setSessionToStorage = function(obj){
		obj.upDate=Date.now();
		localStorage.setItem('paeHash',paeHash(obj));
	}

	var handleSessionInUrl = function(){
		var result = auth0.parseHash(window.location.hash);
		if(result && 'error' in result) errorOutput(result.error,result.error_description);
		if(result && result.accessToken) return result;
		return null;
	}

	
	/** Callback Function **/

	var sessionCallback=function(ok){
		if(ok) location.href=config.afterLoginUrl;
		else config.showForm();
	}

	var loginCallback=function(err,result){
		if(err){
			handleError(err);
		}else{
			console.log('start updateMetadata')
			updateMetadata(result);
			console.log('end updateMetadata')
			handleSession(result,sessionCallback);
		}
	}

	var accountLinkHandler=function(err,result){
		if(err) handleError(err);
		else linkAccounts(result.idToken,result.idTokenPayload.sub);
	}

	var handleError=function(err){
		console.debug(err)
		console.dir(err)
		errorOutput('',err.message);
		config.showForm();
	}


	/** Core Communication **/

	var validateSessionWithServer = function(accessToken,callback){
		var args=(location.search[0]=='?'?location.search+'&':'?')+'bearer='+accessToken;
		
		$.ajax({url: selfhost+'/api/public/testlogin.htm'+args}).then(function(response){
			callback(response === 'OK');
		});
	}


	/** Helper/Display Functions **/

	var errorOutput = function(head,body){
		if(config.errorElement) $(config.errorElement).html(body).show();
	}

	var successOutput = function(head,body){
		if(config.resultElement) $(config.resultElement).html(body).show();
	}

	var paeHash = function(arg){
		if(typeof arg === 'object')	return crypt(JSON.stringify(arg));
		if(typeof arg === 'string') return $.parseJSON(crypt(arg));
		return null;
	}

	var paeCrypt = function(iKey){
		var str2bin=function(str){
	    	var strBin = '';
	    	for(var i=0; i<str.length; ++i){
	      		var bin=str.charCodeAt(i).toString(2);
	      		strBin+=new Array(9-bin.length).join('0')+bin;
	    	}
	    	return strBin;
	  	}
	  	var key = iKey,keyBin = str2bin(iKey), cryptBuffer = '';

	  	return function(text){
	    	var textBin = str2bin(text), textCrypted = '', tmpKeyBin=keyBin;
	    	while(textBin.length > tmpKeyBin.length) tmpKeyBin+=keyBin;
	    	for(var i=0; i<textBin.length; ++i){
	    		cryptBuffer+=textBin.charAt(i) ^ tmpKeyBin.charAt(i);
	       		if(!(cryptBuffer.length%8)){
	        		textCrypted+= String.fromCharCode(parseInt(cryptBuffer,2));
	        		cryptBuffer='';
	      		}	
	    	}
	    return textCrypted;
	  }
	}

	/*var popup = function(url, title, w, h) {
		var left = (screen.width/2)-(w/2);
		var top = (screen.height/2)-(h/2);
		return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
	}*/

	_constructor();
}

// $.ajax({url: 'https://paessler-development.eu.auth0.com/userinfo',headers: {"Authorization":  "Bearer OW3eKCY7NuARKI8D"}})
// .then(function(q,w,e){
// 	console.log("xx",q,w,e)
// });
















	// $.ajax('https://'+config.Domain+'/v2/logout?returnTo=http://localhost:8080&client_id='+config.ClientId);
	// auth0.logout({ returnTo: location, client_id: config.ClientId }, { version: 'v2' });




	// this._register=function(user,pw){
	// 	console.log('register',user,pw);

	// 	// TODO: vllt. hier mit api arbeiten, da kein result bei erfolgreicher registration (außer kein fehler halt)
	// 	// api: https://auth0.com/docs/api/authentication#!#post--dbconnections-signup

	// 	auth0.signup(
	// 		{
	// 			connection: config.Database,
	// 	      	email: user,
 //      			password: pw,
	// 			auto_login: false,
	// 			popup:true,
	// 		},
	// 		function(err, result) {
	// 			console.log(err, result)
	// 			if(err) return errorOutput('',err.message)

	// 		}
	// 	);
	// }


// this._login=function(user,pw){
	// 	$.ajax({
	// 		url:'https://'+config.Domain+'/oauth/ro',
	// 		method: "POST",
	// 		contentType: "application/json",
	// 		crossDomain: true,
	// 		processData: false,
	// 		data:JSON.stringify({
	// 			"client_id": config.ClientId,
	// 			"username": user,
	// 			"password": pw,
	// 			"connection":  config.Database,
	// 			"grant_type": "password",
	// 			"sso": "true",
	// 			"scope": 'openid email app_metadata identities'
	// 		})
	// 	}).then(function(data){
	// 		console.log('login worked',data)
	// 		validateSessionWithServer(data.access_token,function(ok){
	// 			if(ok) //_login(user,pw);
	// 			handleSession({accessToken:data.access_token},sessionCallback);
	// 		});
 //  		}).fail(function(resp){
 //  			var data=$.parseJSON(resp.responseText)
 //  			console.log('err',data)
 //  			errorOutput('',data.description || data.error_description || data.error);
 //  		});
	// }