/*jshint expr:true */
var passport = require( "passport" ),
	https = require( "https" ),
	util = require( "util" );
	Cookie = require( "tough-cookie" ).Cookie;
function Strategy( options, verify ){
	options || ( options = {} );
	if( !options.host ){
		throw new Error( "Host must be specified in options" );
	}
	if( !verify ){
		throw new Error( "Verification must be set" );
	}
	passport.Strategy.call( this );
	this.name = "opensso";
	this.options = options;
	this.verify = verify;
}


util.inherits( Strategy, passport.Strategy );

Strategy.prototype.authenticate = function( req ){
	
	var cookie = req.headers.cookie.split( ";" ).map( Cookie.parse ).filter(function( cookie ){ return cookie.key === "iPlanetDirectoryPro"; })[0],
		self = this;
	console.log( "cookie", cookie );
	if( !cookie ){ //there's no cookie
		//call cb
	}
	var httpsReq = https.request({
		method: "POST",
		path: "/opensso/identity/attributes",
		host: this.options.host,
		headers: {
			"Content-Length": 0,
			Cookie: cookie.toString()
		}
	}, function( res ){
		//console.log( httpsReq.headers );
		var data = "";
		res
			.on( "data", function( buffer ){
				data += buffer;
			})
			.on( "error", function(){
				console.error( arguments );
			})
			.on( "end", function(){
				console.log( "working because of end cb", data );
				var a, user = {};
				data
					.split( "\n" )
					.forEach(function( l ){ 
						if(/^userdetails.attribute.name=/.test( l ) ){ 
							a = l.replace( /^userdetails.attribute.name=/, "" ).trim();
							user[ a ] = []; 
						} 
						else if( /^userdetails.attribute.value=/.test( l ) ){ 
							user[ a ].push( l.replace( /^userdetails.attribute.value=/, "" ).trim() ); 
						} 
					})
				self.verify( user, function( err, verifiedUser ){
					if( err ){
						return self.error( err );
					}
					if( !user ){
						return self.fail( "User is not verified" );
					}
					self.success( user );
				}); 
			});
	});
	httpsReq.end();
};

module.exports = Strategy;
