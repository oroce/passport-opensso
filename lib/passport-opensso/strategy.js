/*jshint expr:true */
var passport = require( "passport" ),
	https = require( "https" ),
	util = require( "util" );
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
	console.log( "req", req );
//	return;
	var httpsReq = https.request({
		method: "POST",
		path: "/opensso/identity/attributes",
		host: this.options.host,
		headers: {
			"Content-Length": 0,
			Cookie: "iPlanetDirectoryPro="+req.headers.cookies[ "iplanetdirectorypro" ]
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
