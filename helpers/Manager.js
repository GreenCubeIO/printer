var crypto					= require('crypto');
var package 				= require('../package.json');
var cron					= require('cron');
var async 					= require('async');
var colors 					= require('colors');
var nodemailer 				= require("nodemailer");
var Configuration 			= require('../configuration/configuration.js');
var fs 						= require('fs')
GLOBAL.Q 					= require('q');
GLOBAL.moment 				= require('moment');
GLOBAL._ 					= require('underscore');
var mongoose 				= require('mongoose');

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

