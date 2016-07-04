var routes = function (params) {

	
	var app 			= params.app;
	var index 			= require('./index');
	var person 			= require('./person');
	var brand 			= require('./brand');
	var async 			= require('async');
	var fs 				= require('fs');
	var request 		= require('request');
	var path			= require('path');
	var express			= params.express;

	/************************************************
		BROWSER BASED - REDIRECTS
	************************************************/	

	//app.get('/', index.index);
	//app.get('/users', function(req, res){ res.redirect('/#/users') });
	//app.get('/brands', function(req, res){ res.redirect('/#/brands') });
	//app.get('/brands/:brand_name/content/upload', function(req, res){ res.redirect('/#/brands/' + req.params.brand_name + '/content/upload') });
	//app.get('/logout', person.logout);


	//app.get('/member/activate', person.activate);
	
	/************************************************
		API:
	************************************************/	

	//app.get('/api/me', person.session);
	//app.post('/api/login', person.login);
	//app.get('/api/configuration', index.configuration);
	//app.get('/api/people/list', person.list);
	//app.get('/api/brands/list', brand.list);
	//app.post('/api/brand/save', brand.save);
	//app.post('/api/person/:person_id/update', person.update);
	//app.post('/api/person/save', person.save);

	
	/************************************************
		DATA ENTRY:
	************************************************/	


	console.log((("Starting ".green) + ( package.name.yellow ) + (" version ").green +  (package.version)).bold);	

}


module.exports = routes;

console.log(("***************************************************************").green.bold);
console.log(("All routes registered").green.bold);	
console.log(("***************************************************************").green.bold);