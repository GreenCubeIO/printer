var package 				= require('../package.json');
var colors 					= require('colors');
var fs 						= require('fs')
GLOBAL.Q 					= require('q');
GLOBAL.moment 				= require('moment');
GLOBAL._ 					= require('underscore');

var Manager = function(){}

Manager.init = function(){

	var self = this;
	self.setEnviromnent()

}

Manager.setEnviromnent = function(){

	if(process.env.ENVIRONMENT){
		this.is_development 		= true;
	} else {
		this.is_development 		= false;		
	}

	console.log(("Running in development: " + this.is_development).yellow);
}

Manager.init();

module.exports = Manager;

