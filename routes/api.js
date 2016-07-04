var express = require('express');
var router 	= express.Router();
var request = require('request'); 
var app = require('../server');

router.get('/me', function(req, res, next) {

	var userInSession = req.session.user;

	if(userInSession){

		res.json(userInSession);

	} else {

		res.status(401).json({message:"Session Expired"});

	}
})

// router.get('/events/', Manager.checkSession, function(req, res) {

// 	//https://github.com/kljensen/node-sse-example/blob/master/app.js

// 	var user_id = req.session.user._id;
	
// 	req.socket.setTimeout(0x7FFFFFFF);
    
//     res.writeHead(200, {
//     	'Content-Type': 'text/event-stream',  // <- Important headers
//     	'Cache-Control': 'no-cache',
//     	'Connection': 'keep-alive'
//     });

//     res.write('\n');

//     Manager.clients[user_id] = res;

//     req.on("close", function(){
//     	// delete Manager.clients[user_id]
//     	delete Manager.clients[user_id];
//     });


// });


router.get('/tasks', function(req, res, next) {

	var query = { "status" : { "$ne" : "deleted" } };

	TaskProvider.find({ query : query , limit : Number.MAX_VALUE }, function(err, tasks){

		if(err){
			res.status(500).json({ message : JSON.stringify(err) });
		} else {
			res.json(tasks);
		}

	})


})

router.post('/task/:task_id', function(req, res, next) {

	var userInSession = req.session.user;

	var task_data = req.body;

	TaskProvider.findById(req.params.task_id, function(err, task){

		if(err){
			res.status(500).json({ message : JSON.stringify(err) });
		} else {

			//Check if dates changed...

			if( new Date(task.starts).getTime() !== new Date(task_data.starts).getTime() || new Date(task.ends).getTime() !== new Date(task_data.ends).getTime() ){

				var today = moment().format("MM/DD/YYYY");

				// if(
				// 	moment(new Date(task_data.starts)).format("MM/DD/YYYY") === today ||
				// 	moment(new Date(task_data.ends)).format("MM/DD/YYYY") === today
				// ){
				if(
					(moment(new Date(task_data.starts)).format("MM/DD/YYYY") !== today || moment(new Date(task_data.ends)).format("MM/DD/YYYY") !== today) 
						||
					Manager.allowSameDaySlacks === true
				){		

					var url = Manager.is_development === 'development' ? 'http://localhost:3000/' : 'http://bwn-control.herokuapp.com/';

					url += 'person/' + task.person._id.toString() + '/tasks'

					Manager.sendSlackNotification({
						message : userInSession.full_name.split(' ')[0] + ' just moved your task "' + task.description.substring(0, 20) + '... " please double check your tasks\' times [' + url + ']',
						to 		: task.person.slack_user.replace('@',''),
						from 	: 'Consciencia'
					})
				}
			
			}

			task.brand = task_data.brand;

			task.status = task_data.status;

			if(task.status === "completed"){
				task.completed_on = new Date();
			}

			

			task.starts = new Date(task_data.starts);
			task.ends 	= new Date(task_data.ends);

			task.save(function(err){

				if(err){
					res.status(500).json({ message : JSON.stringify(err) });
				} else {
					res.json(task);
				}

			})

		}
		

	})

})

router.get('/brands/stats', Manager.checkSession, function(req, res, next){

	var start = req.query.start || moment().format('MM/DD/YYYY');
	var end = req.query.end || moment().format('MM/DD/YYYY') ;

	Manager
		.checkBrandsQuote({ type : "promise", start : start, end : end })
		.then(function(quote){
			res.json(quote);
		})
		.catch(function(err){
			res.status(500).json(err);
		})

})

router.post('/login', function(req, res, next) {

	var credentials = req.body;

	credentials = {
		email : credentials.username,
		password : Manager.cipherText(credentials.password)
	}

	// var ciphered_key = Manager.cipherText(credentials.password);

	console.log("credentials: " + JSON.stringify(credentials, null, 4));

	// var decipher_text = Manager.decipherText(ciphered_key);

	// console.log("decipher_text: " + decipher_text);


	PersonProvider.findOne(credentials, function(err, person){

		if(err != null){
			res.status(404).json({ message : JSON.stringify(err) });
		} else {
			if(person){

				if(person.status === "inactive"){
					res.status(401).json({ message : "Your account is inactive" })
				} else {
					person = person.toObject();

					if(person.company == null){

						Manager.sendSlackNotification({
							message : person.full_name + " has no company",
							to 		: 'allan',
							from 	: 'Consciencia'
						})					

						res.json(person);

					} else {
		
						CompanyProvider.findById(person.company._id, function(err, company){

							if (err) { return next(err); }

							person.company = company;

							delete person.password;

							req.session.user = person;

							res.json(person);

						})

					}					
				}



			} else {
				res.status(404).json({ message : "User not found" });
			}
		}

	})	
})

// router.get('/sendEmail', function(req, res, next) {

// 	Manager.sendInvitation({
// 		full_name 	: "Allan Naranjo",
// 		email 		: "allan.naranjo@gmail.com",
// 		token 		: 'TOKEN_HERE'
// 	}, function(error, email){
// 		console.log("Sent!");
// 		if(error){
// 			next(error);
// 		} else {
// 			res.set('Content-Type', 'text/html');
// 			res.send(new Buffer(email));	
// 		}
		
// 	})

// })

router.get('/configuration', function(req, res, next) {

	res.json({})
})

router.get('/people/list', function(req, res, next) {


	PersonProvider.find({}, function(err, people){

		if (err) { return next(err); }

		var password_less_people = [];

		_.each(people, function(person){
			if(person.toObject){
				person = person.toObject();
			}
			delete person.password;
			password_less_people.push(person);
		})

		res.json(password_less_people);

	})
})

router.get('/person/:person_id/tasks', function(req, res, next) {

	var person_id = req.params.person_id;

	async.parallel({
	    person: function(callback){
			PersonProvider.findById(person_id, function(err, person){

				if (err) { return callback(err, null); }

				callback(null, person);

			})
	    },
	    tasks: function(callback){
			TaskProvider.find({ query : {"person._id" : person_id, "status" : { "$ne" : "deleted" } }, limit : Number.MAX_VALUE }, function(err, tasks){

				if (err) { return callback(err, null); }

				callback(null, tasks);

			})
	    }
	},
	function(err, results) {
	    
	    if (err) { return next(err); }

	    var person = results.person;

	    person.tasks = results.tasks;

	    res.json(person);


	});
	

})

router.get('/company/:company_id/departments',function(req, res, next){

	CompanyProvider.findById(req.params.company_id, function(err, company){

		if (err) { return next(err); }

		res.json(company.departments);


	})


})

router.get('/company/save',function(req, res, next){

	return res.status(404).json({message:"Not implemented"});

	var company_data = {
		name					: "BigWebNoise",
		page_name 				: "bigwebnoise",
		logo 					: "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xtf1/v/t1.0-1/p160x160/11258152_995419800469846_6270093906731755726_n.png?oh=318d5292363f7a29449112dca30dc65e&oe=562200A4&__gda__=1445309905_0f495f3750948a40d0f4d154721e4284",
		created_on	 			: new Date(),
		brands 					: []		
	}

	CompanyProvider.save(company_data, function(err, company){

		if (err) { return next(err); }

		res.json(company);

	})

})

router.post('/slack/me', function(req, res, next) {

	var userInSession = req.session.user;

	var user_data = req.body;

	PersonProvider.findById(userInSession._id.toString(), function(err, person){

		if (err) { return next(err); }

		person.slack_user = user_data.slack_user;

		person.save(function(err){

			if (err) { return next(err); }

			req.session.user = person;

			res.json(person);

			var url = Manager.is_development === 'development' ? 'http://localhost:3000/' : 'http://bwn-control.herokuapp.com';

			Manager.sendSlackNotification({
				message : person.slack_user + " welcome to BigWebNoise Control :)! [" + url + "]",
				to 		: person.slack_user.replace('@',''),
				from 	: 'Consciencia'
			})
	

			/*
			request.post({
				headers: {
					'content-type' : 'application/x-www-form-urlencoded'
				},
				url:     'https://bwn.slack.com/services/hooks/slackbot?token=u4zgrHubVOpi295YTEDqUwti&channel=%23bigwebnoise-control',
				body:    person.slack_user + " welcome to BigWebNoise Control :)!"
			}, function(error, response, body){
				if(error){
					console.log(err);
				} else {
					console.info("User slacked!");
				}
			});		
			*/	

		})


	})

})

router.get('/slack', function(req, res, next){

	var to = req.query.to;

	if(to == null){
		res.json({message:"to parameter is required as query string ?to=allan"})
	} else {
		slack_api.sendMessage('Soy tu consciencia!', to , 'Consciencia').on('data', function(response) {
			res.json({message:"Sent!"})
		});
	}

	// slack_api.sendMessage('Test', 'allan' , 'Consciencia').on('data', function(response) {
	// 	console.log(JSON.stringify(response));
	// 	console.info("User slacked!");
	// });	

})

router.post('/person/:person_id/task/add', Manager.checkSession, function(req, res, next) {

	var person_id = req.params.person_id;

	var userInSession = req.session.user;


	PersonProvider.findById(person_id, function(err, person){

		if (err) { return next(err); }

		var task_data = req.body;

		task_data.starts = new Date(task_data.starts);
		task_data.ends = new Date(task_data.ends);

		task_data.person = {
			_id : person._id.toString(),
			full_name : person.full_name,
			slack_user : person.slack_user
		}

		task_data.brand = {
			_id 	: task_data.brand._id,
			name 	: task_data.brand.name
		}

		task_data.created_by = {
			_id 	: userInSession._id.toString(),
			name 	: userInSession.full_name
		}

		task_data.assigned_by = {
			_id 	: userInSession._id.toString(),
			name 	: userInSession.full_name
		}


		TaskProvider.save(task_data, function(err, task){

			if (err) { return next(err); }

			res.status(201).json(task);

			Manager.checkBrandsQuote();

			var today = moment().format("MM/DD/YYYY");

			if(
				(moment(new Date(task.starts)).format("MM/DD/YYYY") !== today || moment(new Date(task.ends)).format("MM/DD/YYYY") !== today) 
					||
				Manager.allowSameDaySlacks === true
			){

				var slack_message = person.slack_user + ",  " + userInSession.full_name.split(" ")[0] +  " just assigned a task to you!";
			
				// slack_api.sendMessage(slack_message, person.slack_user.replace('@','') , 'Consciencia').on('data', function(response) {
				// 	console.info("User slacked!");
				// });	

				var url = Manager.is_development === 'development' ? 'http://localhost:3000/' : 'http://bwn-control.herokuapp.com/';

				url += 'person/' + person._id.toString() + '/tasks'

				Manager.sendSlackNotification({
					message : slack_message + ' [' + url + ']',
					to 		: person.slack_user.replace('@',''),
					from 	: 'Consciencia'
				})		

			}			


		})


	})





})

router.post('/person/:person_id/update', function(req, res, next) {

	var person_data = req.body;

	var userInSession = req.session.user;

	PersonProvider.findById(person_data._id, function(error, person){

		if(error){
			res.status(500).json({message : JSON.stringify(error)});
		} else {
			if(person){

				person.full_name = person_data.full_name;
				person.email = person_data.email;
				
				if(person_data.password){
					person.password = Manager.cipherText(person_data.password);
					console.log("Password ciphered!: " + person_data.password);
				}

				person.status = person.status === "invited"  ? "invited" : person_data.status;

				if(userInSession._id === person._id.toString()){
					//person.password = person_data.password;
					person.status = "active";
				}

				person.department = person_data.department;	

				if(person_data.brands){
					person.brands = person_data.brands;
				}

				if(person_data.permissions){
					person.permissions = person_data.permissions;
				}

				person.save(function(error){
					if(error){
						res.status(500).json({message : JSON.stringify(error)});
					} else {

						//console.log((person._id.toString() === "55a04c91c0de5b1100a251c0") + " -> " + (" is Richie? " + person._id.toString() + " === 55a04c91c0de5b1100a251c0"));


						//console.log("Looking for " + person.full_name + " tasks");

						TaskProvider.find({ query : { "person._id" : person._id.toString() }, limit : Number.MAX_VALUE }, function(err, tasks){

							if(err){
								console.log("Error while trying to find " + person.full_name + " tasks");
							} else {

								console.log("Found " + tasks.length + " tasks");

								async.forEach(tasks, function(task, callback) {

									task.person = {
										department 	: person.department,
										slack_user 	: person.slack_user,
										_id 		: person._id.toString(),
										full_name 	: person.full_name
									}

									task.markModified('person');

									task.save(function(err){

										if(err){
											callback(err, null);
										} else {
											callback(null, task);
										}

									})

								}, function(error) {
									if (error){   
										console.log("Error: " + JSON.stringify(error))
									} else {
										console.log("Tasks updated")
									}
								})								
							}




						})
						
	
						if(userInSession._id === person._id.toString()){
							req.session.user = person;
						}

						res.json(person);
					}
				})

			} else {
				res.status(404).json(person);
			}
		}

	})
})

router.get('/SSE', function(req, res){

	Manager.checkBrandsQuote();

	res.json({ message : "Done" });

})

router.post('/person/save', function(req, res, next) {

	var person_data = req.body;

	PersonProvider.save(person_data, function(error, person){

		if(error){
			res.status(500).json({message : JSON.stringify(error)});
		} else {
			if(person){

				person.status = "invited";
				person.invited_on = new Date();

				if(person_data.brands){
					person.brands = person_data.brands;
				}

				person.save(function(error){
					if(error){
						res.status(500).json({message : JSON.stringify(error)});
					} else {

						res.json(person);

						var token = {
							email 		: person.email
						}

						var ciphered_token = Manager.cipherText(JSON.stringify(token));		

						person.token = ciphered_token;

						Manager.sendInvitation(person, function(error){
							console.log("Invitation sent to " + person.email);
						})	

					}
				})

			} else {
				res.status(404).json(person);
			}
		}

	})
})

router.get('/brands/list', function(req, res, next) {
	
	BrandProvider.find({ query : { }, limit : Number.MAX_VALUE }, function(err, brands){

		if (err) { return next(err); }

		res.json(brands);

	})
})

router.post('/brand/:brand_id/update', function(req, res, next) {

	var brand_data = req.body;

	BrandProvider.findById(req.params.brand_id, function(err, brand){

		if (err) { return next(err); }

		brand.name = brand_data.name;
		brand.logo = brand_data.logo;

		brand.save(function(err){

			if (err) { return next(err); }

			res.json(brand);

		})


	})

})

router.post('/brand/save', function(req, res, next) {

	var brand_data = req.body;

	BrandProvider.findOne(brand_data, function(err,brand){
		
		if (err) { return next(err); }

		if(brand !== null){ return next({status:412,stack:"Brand with the same name already exists"}) }

		var page_name = "", attempts = 0;

		var keep_trying_for_a_page_name = function(internal_callback){

			switch(attempts){
				case 0:
					page_name = brand_data.name.toLowerCase().replace(/ /g, '');
				break;
				case 1:
					page_name = "bwn-" + brand_data.name.toLowerCase().replace(/ /g, '');
				break;
				case 2:
					page_name = "bwn-" + brand_data.name.toLowerCase().replace(/ /g, '') + "-" + Date.now().toString();
				break;
			}

			BrandProvider.findOne({ page_name : page_name }, function(err, brand_found){
				if(err){
					console.log("ERROR WHILE TRYING TO FIND PERSON PAGENAME");
					res.json({message : JSON.stringify(err)},500);
				} else {
					if(brand_found != null){
						//Petition exists with the same name, let's try another one...
						attempts += 1;
						keep_trying_for_a_page_name(internal_callback);
					} else {
						internal_callback();
					}
				}
			})

		}				

		keep_trying_for_a_page_name(function(){

			brand_data.page_name = page_name;

			brand_data.created_on = new Date();

			BrandProvider.save(brand_data, function(err, brand){
				
				if (err) { return next(err); }

				res.json(brand);


			})

		})


	})
})

module.exports = router;