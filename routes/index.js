var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

	res.render('index', { 
		is_development 	: Manager.is_development,
		app_name 		: package.name,
		version 		: package.version,
		analytics 		: ''
	});

});

/* REDIRECTS */

router.get('/users', function(req, res, next) {
	
	res.redirect('/#/users');
})


router.get('/person/:user_id/tasks', function(req, res, next) {
	
	res.redirect('/#/person/' + req.params.user_id + '/tasks');
})

router.get('/brands', function(req, res, next) {
	
	res.redirect('/#/brands') 
})

router.get('/brands/:brand_name/content/upload', function(req, res, next) {
	
	res.redirect('/#/brands/' + req.params.brand_name + '/content/upload');
})

/* MEMBER ACTIVATION INVITATION DOOR */

router.get('/member/activate', function(req, res, next) {

	var token = req.query.token;

	var decipheredToken = JSON.parse(Manager.decipherText(token));

	PersonProvider.findOne({email : decipheredToken.email}, function(err, person){

		if (err) { return next(err); }

		if(person === null){ return next({status:404,stack:"User not found"}) }

		if(person.status === "active"){

			res.redirect('/');

		} else {

			req.session.user = person;

			res.redirect("/");

		}


	})
})

/* LOG OUT */

router.get('/logout', function(req, res, next) {
	
	req.session.destroy();
	res.redirect('/');
})
	
module.exports = router;