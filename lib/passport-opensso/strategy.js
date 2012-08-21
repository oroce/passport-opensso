/*jshint expr:true */
var passport = require( "passport" ),
	https = require( "https" ),
	util = require( "util" );
	Cookie = require( "tough-cookie" ).Cookie;
function Strategy( options ){
	options || ( options = {} );
	if( !options.host ){
		throw new Error( "Host must be specified in options" );
	}

	passport.Strategy.call( this );
	this.name = "opensso";
	this.options = options;
}


util.inherits( Strategy, passport.Strategy );

Strategy.prototype.authenticate = function( req ){
	
	var cookie = req.headers.cookie.split( ";" ).map( Cookie.parse ).filter(function( cookie ){ return cookie.key === "iPlanetDirectoryPro"; })[0];
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
			});
	});
	httpsReq.end();
};

module.exports = Strategy;
