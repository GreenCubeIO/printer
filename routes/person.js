var async 			= require('async');
var _ 				= require('underscore');
/*
 * GET users listing.
 */

exports.logout = function(req, res){

	req.session.destroy();

	res.redirect('/');
	

};


exports.login = function(req, res, next){
	
	var credentials = req.body;

	credentials = {
		username : credentials.username,
		password : credentials.password
	}

	PersonProvider.findOne(credentials, function(err, person){

		if(err != null){
			res.status(404).json({ message : JSON.stringify(err) });
		} else {
			if(person){

				person = person.toObject();

				delete person.password;

				req.session.user = person;

				res.json(person);

			} else {
				res.status(404).json({ message : "User not found" });
			}
		}

	})	

}

exports.list = function(req, res, next){

	PersonProvider.find({}, function(error, people){

		if (error) { return next(err); }

		res.json(people);

	})

}



exports.session = function(req, res){

	var userInSession = req.session.user;

	if(userInSession){

		res.json(userInSession);

	} else {

		res.json({message:"Session Expired"},401);

	}
}

exports.authenticate = function(req, res, next){

	var credentials = req.body;

	if(credentials.email == null || credentials.password == null){
		return next({status:412,stack:"Missing credentials"});
	}

	PersonProvider.findOne(credentials, function(err,person){
		
		if (err) { return next(err); }

		if(person === null){ return next({status:404,stack:"User not found"}) }

		person = person.toObject();

		async.forEach(person.companies, function(company_data, callback) {

			
			CompanyProvider.findById(company_data._id, function(err,company){

				if (err) { return next(err); }

				var company_person = _.find(person.companies, function(comp){
					return comp._id === company._id.toString();
				})

				person.companies = _.reject(person.companies, function(comp){
					return comp._id === company._id.toString();
				})

				company = company.toObject();

				company.type = company_person.type;

				person.companies.push(company);

				return callback(null)

			})


		}, function(error) {
			if (error) {   
				return next(err); 
			} else {
				
				req.session.user = person;

				res.json(person);



			}
		})			

		


	})

}


exports.update = function(req, res, next){

	var person_data = req.body;

	PersonProvider.findById(person_data._id, function(error, person){

		if(error){
			res.status(500).json({message : JSON.stringify(error)});
		} else {
			if(person){

				person.full_name = person_data.full_name;
				person.email = person_data.email;
				person.status = person.status === "invited"  ? "invited" : person_data.status;

				if(person_data.brands){
					person.brands = person_data.brands;
				}

				person.save(function(error){
					if(error){
						res.status(500).json({message : JSON.stringify(error)});
					} else {
						
						res.json(person);

					}
				})

			} else {
				res.status(404).json(person);
			}
		}

	})

}

exports.save = function(req, res, next){

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

}


exports.invite = function(req, res, next){

	var invitation = req.body;

	var token = {
		email 		: invitation.email,
		is_admin 	: invitation.is_admin
	}

	var ciphered_token = Manager.cipherText(JSON.stringify(token));

	res.json(ciphered_token);

}


exports.send_email_invitations = function(req, res, next){

	var invitations_data = req.body;

	var email_addresses = invitations_data.email_addresses;

	var token;

	async.forEach(email_addresses, function(invitation, callback) {

		token = {
			email 		: invitation.email,
			company 	: invitation.company_id
		}

		var ciphered_token = Manager.cipherText(JSON.stringify(token));

		PersonProvider.findOne({
			email : invitation.email
		}, function(err, person){

			if (err) { return next(err); }


			if(person){

				person.companies = _.reject(person.companies, function(company){
					return company._id === invitation.company_id;
				});

				person.companies.push({
					_id : invitation.company_id,
					type : invitation.type
				})

				person.markModified('companies');

				person.save(function(err){

					if (err) { return next(err); }

					Manager.sendInvitation({
						email : invitation.email,
						token : ciphered_token
					}, function(error){
						
						return callback(error)

					})

				})


			} else {

				PersonProvider.save({
					email  : invitation.email,
					companies : [{
						_id : invitation.company_id,
						type : invitation.type
					}],
					status 	: 'inactive'
				}, function(err, person){

					if (err) { return next(err); }

					Manager.sendInvitation({
						email : invitation.email,
						token : ciphered_token
					}, function(error){
						
						return callback(error)

					})					


				})

			}


		})


	}, function(error) {
		if ( error) {   
			res.json({message:JSON.stringify(error)},500);
		} else {
			console.log()
		}
	})	

	res.json(invitations_data);

}

exports.activate = function(req, res, next){

	var token = req.query.token;

	var decipheredToken = JSON.parse(Manager.decipherText(token));


	PersonProvider.findOne({email : decipheredToken.email}, function(err, person){

		if (err) { return next(err); }

		if(person === null){ return next({status:404,stack:"User not found"}) }

		if(person.status === "active"){

			res.redirect('/error');

		} else {

			req.session.user = person;

			res.redirect("/members/profile");

		}


	})



}







