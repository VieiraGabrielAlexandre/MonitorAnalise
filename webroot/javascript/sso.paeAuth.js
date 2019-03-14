var paeAuth = function(config,Auth0,Auth0v7){

	if(typeof config !== 'object') return console.log('paeAuth: The config object is invalid.');

	var auth0,auth0v7=null,that=this,s=[36,48,109,51,36,52,108,55];

	var _constructor = function(){

		if(Auth0v7){
			auth0v7 = new Auth0v7({
		    	domain:       config.Domain, 
		    	clientID:     config.ClientId, 
		    	popup: true
		    	// ,callbackOnLocationHash: true,
		    	// callbackURL:  config.selfhost+'/?cb=1'
		    });
		}

		auth0 = new Auth0.WebAuth({
			domain:config.Domain,
			clientID:config.ClientId
		});
		if($(config.userinput).val().length) $(config.userinput).prop('disabled', true)
	  	if(config.pre)(config.pre=paeCh(config.ClientId)(atob(config.pre)).split(String.fromCharCode.apply(null,s))) && $(config.userinput).val(config.pre[0]).prop("disabled",true) && (!config.pre[1] || $(config.passinput).val(config.pre[1]).prop("disabled",true));
	  	loginCallback = auth0Commutator(loginCallback);
	}


///////////// Public Methods /////////////


	this.init = function(){

		try{

			if(config.pre) return handleError(new paeError('invite_found','Stopped due invite found',true));

			var get=parseGet();
			var alu=('alu' in get)?get['alu']:null;

			if(alu) config.afterLoginUrl=alu;
			// if(config.pre) config.afterLoginUrl=(config.afterLoginUrl.indexOf('?')?'&':'?')+'username='+config.afterLoginUrl;


			var session = null;
			if(session === null) session = getSessionFromUrl();
			// if(session === null) session = getSessionFromStorage(); // not used atm
			if(session) loginCallback(null,session);
			else if(alu === null) getSSOData();
			else handleError(new paeError('no_session','No seassion found',true));
		
		}catch(e){
			unhandledError(e);
		}
	}

	this.logout=function(federated,asURL){
		var logoutURL='https://'+config.Domain+'/v2/logout?'+(federated?'federated&':'')+'client_id='+config.ClientId+'&returnTo='+config.selfhost;
		if(asURL) return logoutURL;
		// localStorage.removeItem('paeHash');
		location.href=logoutURL;

		// window.open('https://'+config.Domain+'/v2/logout?returnTo='+config.selfhost+'&client_id='+config.ClientId, "Logout", "width=0,height=0");
	}

	this.login=function(user,pw,callback){
		config.hideForm();

		auth0.popup.loginWithCredentials({
			connection: config.Database,
			email: user,
			username: user,
			password: pw,
			responseType: 'token',
			scope: "openid",
			redirectUri:  config.afterLoginUrl
			// data:JSON.stringify({
			// 	"email": user,
			// 	"user_metadata" : { redirect_url: location.href },
			// }),
			// popup: true,
			// callbackURL: config.afterLoginUrl
		}, callback || loginCallback);
	}

	this.socialLogin=function(provider){
		var realProvider = {
			'windows':'windowslive',
			'google':'google-oauth2'
		}[provider];

		if(!realProvider) realProvider=provider;

		config.hideForm();

		// var callback = config.pre ? accountLinkHandler : loginCallback; // Account linking disabled for beta

		auth0.popup.authorize({
			connection: realProvider,
			responseType: 'token',
			redirectUri: config.afterLoginUrl,
			scope: 'openid'
		}, function socialLoginCallback(err,result){
			if(err) err=new paeError('social_popup_closed','The login-popup was closed before or without login.',true,this);
			loginCallback(err,result); 
		});
	}

	/*this.register=function(user,pw){
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
			errorOutput(config.messages['register_successful_validation_required'].replace(/%email%/g,data.email));
  		}).fail(function(resp){
  			var data=$.parseJSON(resp.responseText);
  			errorOutput(data.description || data.error);
  		});
	}*/

	this.resetPassword=function(email){
		auth0.changePassword({
			connection: config.Database,
			email: email
		}, function (err, resp) {
			if(err){
	  			var data=$.parseJSON(resp.responseText);
	  			errorOutput(config.messages['send_password_fail'].replace(/%email%/g,email));
			}else{
				errorOutput(config.messages['send_password_success'].replace(/%email%/g,email));
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

	var updateMetadata = function(result,cb){

		var auth0Manage = new Auth0.Management({
			domain: config.Domain,
			token: result.idToken,
			_sendTelemetry: false
		});

		auth0Manage.getUser(result.userId,auth0Commutator(function getUserCallback(err,user){

			if(err) return handleError(err.chainSilent());

			var instance=location.origin;
			var instances=[instance];

			if('instances' in user.metadata){
				
				$.each(user.metadata.instances,function(k,v){
					if(v!=instance) instances.push(v);
				});
			}

			user.metadata.instances=instances;

			auth0Manage.patchUserMetadata(user.userId, user.metadata, auth0ErrorCommutator(function patchUserMetadataCallback(err,res){
				if(err) return handleError(err.chainSilent());
				if(cb && typeof cb === 'function') cb();
			}));
		}));


	}

	/*var linkAccounts = function(second_jwt,second_id){

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
	}*/

	/** Session Handling **/

	// var getSession = function(callback){
	// 	var session = null;
	// 	//if(session === null) session = getSessionFromUrl(); //not used due popup
	// 	if(session === null) session = getSessionFromStorage();
	// 	if(session === null) getSSOData();
	// 	else callback(session)
	// }

	var getSSOData = function(){

		auth0.renewAuth({
			audience: config.Audience,
			scope: 'openid',
			nonce: generateNonce(40),//config.CertThumbprint,
			redirectUri: config.silentCallback,
			usePostMessage: true
		}, auth0ErrorCommutator(function renewCallback(err,ssoData){
			if(err){
				if(auth0v7){
					handleError(err.chainSilent())
					getSSODataV7();
				}else{
					handleError(err);
				}
			}else{
				 loginCallback(err,ssoData);
			}
		}));
	}

	var getSSODataV7 = function(){
		auth0v7.getSSOData(true, function getSSODataV7Callback(err, ssoData){
			if(!err && ssoData && ssoData.sso && ssoData.lastUsedConnection && ssoData.lastUsedConnection.name){
				auth0.authorize({
					connection: ssoData.lastUsedConnection.name,
					responseType: 'token',
					redirectUri: config.selfhost+'/index.htm?alu='+escape(config.afterLoginUrl),
					scope: 'openid'
				}, loginCallback);
			}else{
				loginCallback(new paeError('getSSOData','No valid SSO cookie found',true,'getSSODataV7Callback'));
			}
		});
	}

	var getSessionFromStorage = function(){
		var hash = localStorage.getItem('paeHash');
		if(hash === null) return null;
		hash = paeHash(hash);

		return (Date.now()-hash.upDate > 60*60*24*1000)?null:hash;
	}

	var setSessionToStorage = function(obj){
		obj.upDate=Date.now();
		localStorage.setItem('paeHash',paeHash(obj));
	}

	var getSessionFromUrl = function(){

		var args=parseHash();

	    var com=_auth0Commutator(null,args);
	    var err=com[0];
	    var result=com[1];
	    
		if(err) handleError(err);

		if(result.idToken) return result;
		return null;
	}

	
	/** Callback Function **/

	var validateCallback=function(err,session){
		if(err){
			handleError(err);
		}else{
			updateMetadata(session)
			location.href=config.afterLoginUrl;
		}
	}

	var loginCallback=function(err,session){
		if(err) handleError(err);
		else validateSessionWithServer(session,validateCallback);
	}

	/*var accountLinkHandler=function(err,result){
		if(err) handleError(err);
		else linkAccounts(result.idToken,result.idTokenPayload.sub);
	}*/

	var handleError=function(err,chainError){


		if(config.debug) console.log(err);
		localStorage.setItem('paeError',err);

		if(chainError) return;

		var msg = config.messages[err.name] || config.messages[err.message] || err.message || err.name;
		if(!msg) msg=config.messages['server_error'];
		if('vars' in err){
			for(var k in err.vars)
				msg=msg.replace(new RegExp('%'+k+'%', 'g'),err.vars[k]);
		}
		if(!err.silent || config.debug) config.outputFunction(err.levl,msg);

		config.showForm();
	}


	/** Core Communication **/

	var validateSessionWithServer = function(session,callback){

		if(!session.idToken || !session.userId) return callback(new paeError('session_corrupted','The found session is corrupted',true),session);

		var args=(location.search[0]=='?'?location.search+'&':'?')+'bearer='+session.idToken+','+session.userId;//+(config.pre?'&username='+config.pre[0]:'');
		// var args=(location.search[0]=='?'?location.search+'&':'?')+'bearer='+session.accessToken;

		// $.ajax({url: 'https://' + config.Domain +'/api/v2/users/'+session.idTokenPayload.sub,headers: {'Authorization': 'Bearer ' + session.idToken}}).then(function(err,res){
		// 	console.log('api/v2/users',err,res);
		// });
		
		$.ajax({url: config.selfhost+'/api/public/testlogin.htm'+args}).then(function(response){
			var err=null;
			if(response !== 'OK'){
				var provider = session.userId.split('|')[0].split('-')[0].replace('auth0','paessler');
				err = new paeError('logged_in_but_unknown','Account known by Auth0, but not by PRTG',false,'validateSessionWithServer','info',{provider:provider.toCapCase()});
			}
			callback(err,session);
		});
	}

	/** Helper/Global Functions **/

	String.prototype.toCapCase=function(){
    	return this.charAt(0).toUpperCase() + this.slice(1);
	}

	var errorOutput = function(msg,header){
		config.outputFunction('error',msg,header);
	}

	var successOutput = function(msg,header){
		config.outputFunction('success',msg,header);
	}

	var paeHash = function(arg){
		if(typeof arg === 'object')	return paeCh(config.ClientId)(JSON.stringify(arg));
		if(typeof arg === 'string') return $.parseJSON(paeCh(config.ClientId)(arg));
		return null;
	}

	var paeCh = function(iKey){
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

	var auth0Commutator=function(fn){
		return auth0ErrorCommutator(auth0ResultCommutator(fn));
	}

	var _auth0Commutator=function(auth0err,auth0res){
		return _auth0ErrorCommutator.apply(null,_auth0ResultCommutator(auth0err,auth0res));
	}


	var auth0ResultCommutator=function(fn){
		return function(auth0err,auth0res){_auth0ResultCommutator(auth0err,auth0res,fn)};
	}

	var _auth0ResultCommutator=function(auth0err,auth0res,fn){

		try{

			if(auth0res instanceof paeResult) return fn.call(null,auth0err,auth0res);

			var idToken=null,userId=null,metadata={};

			if(auth0res){
				if('idToken' in auth0res) idToken = auth0res.idToken;
				else if('id_token' in auth0res) idToken = auth0res.id_token;
				
				var _searchUserId=function(obj){
					if('userId' in obj) return obj.userId;
					else if('sub' in obj) return obj.sub;
					else if('user_id' in obj) return obj.user_id;
					else if('userID' in obj) return obj.userID;
					else return null;
				};

				if(!(userId=_searchUserId(auth0res)) && idToken)  userId = _searchUserId(userFromJWT(idToken));

				if('user_metadata' in auth0res) metadata = auth0res.user_metadata;
				else if('userMetadata' in auth0res) metadata = auth0res.userMetadata;
			}
			auth0res = new paeResult(idToken,userId,metadata);
			if(fn) fn.call(null,auth0err,auth0res);
			else return [auth0err,auth0res];
		
		}catch(e){
			return unhandledError(e);
		}
	}

	var auth0ErrorCommutator=function(fn){
		return function(auth0err,auth0res){_auth0ErrorCommutator(auth0err,auth0res,fn)};
	}


	var unhandledError=function(e){
		console.log('unhandledError',e);
		handleError(new paeError('unhandledError','Something went wrong, please try again!',true,unhandledError));
		config.showForm();
	}


	var _auth0ErrorCommutator=function(auth0err,auth0res,fn){

		try{

			if((!auth0err || typeof auth0err !== 'object') && (!auth0res || typeof auth0res !== 'object')) {
				// Fix for 2nd Call of auth0 SDK "renewAuth"- function from a browser extension
				auth0err=new paeError('extensionError','Error caused by browser extension!',false,fn)
			}else{

				if(auth0err instanceof paeError) return fn.call(null,auth0err,auth0res);

				if(!auth0err && auth0res && 'error' in auth0res) auth0err=auth0res;

				if(auth0err){

					var errNamesArr=['error','name','code'];
					var errMsgArr=['message','errorDescription','details'];

					var errName='',errMsg='';

					for(var k in errNamesArr){
						if(errNamesArr[k] in auth0err){
							errName=auth0err[errNamesArr[k]];
							break;
						}
					}

					for(var k in errMsgArr){
						if(errMsgArr[k] in auth0err){
							errMsg=auth0err[errMsgArr[k]];
							if(errMsgArr[k] == 'details') errMsg=errMsg.error_description;
							break;
						}
					}

					auth0err = new paeError(
						errName?unescape(errName.replace(/ /g,'_')):'',
						errMsg?unescape(errMsg):'',
						auth0err.silent?true:false,
						fn
					);
				}
			}

			if(fn) fn.call(null,auth0err,auth0res);
			else return [auth0err,auth0res];

		}catch(e){
			return unhandledError(e);
		}
	};


	var parseQs=function(qs){
		var args={};
    
	    $.each(qs,function(k,v){
	      v=v.split('=');
	      if(v.length==2) args[v[0]]=unescape(v[1]);
	      else if(v.length>2) args[v.shift()]=unescape(v.join('='));
	    });

	    return args;
	}

	parseHash=function(){
		return parseQs(window.location.hash.substr(1).split('&'));
	}

	parseGet=function(){
		return parseQs(window.location.search.substr(1).split('&'));
	}

	var userFromJWT=function(token){
		if(typeof token !== 'string' || !token.length) return {};
		token=token.split('.');
		if(token.length != 3) return {};
		token=token[1].replace('-', '+').replace('_', '/');
		if(typeof token !== 'string' || !token.length) return {};
		try{
			token=JSON.parse(window.atob(token));
		}catch(e){
			token={};
		}
		return token;
	}

	var generateNonce=function(len){
		var str='';
		while(len--) str+=String.fromCharCode(Math.floor(Math.random()*94+33));
		return str;
	}

	function paeResult(idToken,userId,metadata){
	  this.idToken = idToken || null;
	  this.userId = userId || null;
	  this.metadata = metadata || {};
	}

	function paeError(name,message,silent,callback,level,vars){
	  this.name = name || '';
	  this.message = message || '';
	  this.silent = silent || false;
	  var newError = new Error();
	  this.stack = 'stack' in newError?newError.stack.replace(/    at /g,'').split('\n').slice(1):null;
	  this.callback = typeof callback === 'string' ? callback : (callback && 'name' in callback ? callback.name : null);
	  this.level = level || 'error';
	  if(vars) this.vars = vars;
	  var that=this;
	  this.chainSilent=function(){
	  	that.silent=true;
		return that;
	  }
	}
	paeError.prototype = Object.create(Error.prototype);
	paeError.prototype.constructor = paeError;
	paeError.prototype.toString = function(){
		// return JSON.stringify({name:this.name,message:this.message,silent:this.silent});
		return JSON.stringify(this);
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
	// 			if(err) return errorOutput(err.message)

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
	// 			getSession({accessToken:data.access_token},validateCallback);
	// 		});
 //  		}).fail(function(resp){
 //  			var data=$.parseJSON(resp.responseText)
 //  			console.log('err',data)
 //  			errorOutput(data.description || data.error_description || data.error);
 //  		});
	// }