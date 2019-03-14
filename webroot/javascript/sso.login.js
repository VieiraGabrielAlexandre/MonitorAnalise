$(window).on("load",function(){$('img').animate({'opacity':1},500);});

// Pulling auth0 clientID and auth0 domain from Backend
$.getJSON('/api/public/authdata.htm').done(function(auth0data){

	// Getting get arguments from URL
	var getArgs = parseGet();

	// URL where User gets redirected after successful validation with Backend
	var loginUrl = getArgs['loginurl'] ? getArgs['loginurl'].replace(/\/\//g,'/') : '/welcome.htm';

	// URL where User gets redirected after successful login on hosted page
	var redirectUri = location.origin+'/index.htm?loginurl='+encodeURI(loginUrl)

	// Configuration-Options for paessler-authentication
	var config = {
		domain: auth0data.domain,
		clientID: auth0data.id,
		redirectUri: redirectUri,
		logoutUrl: location.origin+'/index.htm',
		allowSignUp:false,
		audience: 'https://'+auth0data.domain+'/api/v2/'
	}

	// Create instance of paessler-authentication class
	const AuthService = new AuthenticationService({ config: config })

	if(getArgs['logout']==1){
		// Manual logout was triggerd -> loggin out user
		AuthService.logout({returnTo: config.logoutUrl})
	}else{
		// If we are in a redirect and got access_token in url, then login
		if(getArgs['access_token']){

			// Alternative, but ugly because bearer in url remains
			// location.href=location.origin+'/'+loginUrl+'?bearer='+getArgs['access_token']

			validateSessionWithServer(getArgs['access_token'], function(err){
				// Backend does not know the user
				if(err){
					AuthService.login({ redirectUri: window.location.href, errorDescription: 'You are not authorized to access this PRTG instance.' })
					console.log(err)
				// Backend successfully validated the user, logged in -> redirect to welcome.htm or [loginurl]
				}else{
					location.href = location.origin+loginUrl;
				}
			})
		}else{
			var options = {}
			
			// Set email option if query parameter present and forward it to hosted login page (e.g. User clicks "verify button" in the email)
			if('email' in getArgs){
				options.email = getArgs['email']
			}
			
			if('error' in getArgs){
				options.error = getArgs['error']
			}
			
			if('error_description' in getArgs){
			    options.errorDescription = getArgs['error_description']
			}

			// If no accss_token present, redirect to hosted login page
			AuthService.login(options)
		}		
	}


	/**************************************************** Helper Functions ***************************************************/

	function parseGet(){
		var args={};
		var qs=location.search.substr(1).split('&')
		qs=qs.concat(location.hash.substr(1).split('&'))
		qs=qs.filter(String)
		$.each(qs,function(k,v){
			v=v.split('=');
			if(v.length==2) args[v[0]]=unescape(v[1]);
			else if(v.length>2) args[v.shift()]=unescape(v.join('='));
		});
		return args;
	}

    function validateSessionWithServer(access_token,callback){
		var args=(location.search[0]=='?'?location.search+'&':'?')+'bearer='+access_token;
		$.ajax({url: location.origin+'/api/public/testlogin.htm'+args}).then(function(response){
			var err = (response !== 'OK')?'Account known by Auth0, but not by PRTG':null;
			callback(err,access_token);
		});
	}
});