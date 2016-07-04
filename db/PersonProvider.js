var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;


var Person = new Schema({
	official_id 				: String,
	full_name 					: String,
	first_name					: String,
	last_name					: String,
	maiden_name					: String,
	status 						: String,
	gender 						: String,
	department 					: String,
	position					: String,
	location 					: String,
	description 				: String,
	birthday					: Date,
	started_on 					: Date,
	email						: String,
	password					: String,
	is_admin					: Boolean,
	profile_picture 			: String,
	username 					: String,
	invited_on 					: Date,
	checking_stamps				: {
		messages 				: Date,
		notifications 			: Date
	},
	brands 						: [],
	tasks 						: [],
	slack_user 					: String,
	permissions 				: [],
	cyphered 					: { type : Boolean, default : false }
})


/*

	+ When user logs in the system should retrieve all the companies at login, and get the companies name's dynamically.

*/
/*

************************************************************************************************
	MEMBERS STATUS
************************************************************************************************

"inactive"		: The member did not fill the information required to create an account
"active" 		: The member is active
"invitation"	: The member requested an invitation but this one has not been sent
"waiting"		: An invitation was sent to the member

*/

mongoose.model('Person', Person);

var Person = mongoose.model('Person');

PersonProvider = function(){};

//METHODS GO HERE

PersonProvider.prototype.save = function(params, callback){
	
	this.findOne({ email : params.email }, function(err, person){

		if(person && params.status !== "invitation"){

			console.log("Already someone registered with the email " + params.email + " returning 412 status code");
			callback({ message : "Person with this email already exists" , status : 412}, null);
			
		} else {
		
			if(person && params.status === "invitation"){
				callback(null,person);
			} else {
	
				var person = new Person(params);
				
				person.save(function(err){
					if(err != null){
						console.log("Error found while trying to save a new person for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
						callback(err, null);		
					} else {
						callback(null, person);
					}
				})	

			}

		}

	})


}

PersonProvider.prototype.findById = function(id, callback){

	Person.findById(id, function(err, person){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, person);
		}
	})


}

PersonProvider.prototype.findOne = function(params, callback){

	Person.findOne(params, function(err, person){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, person);
		}
	})


}

PersonProvider.prototype.count = function(params, callback){

	console.log("COUNT PARAMETERS: " + (JSON.stringify(params, null, 4).magenta));

	Person.count(params, function(err, count){
		if(err!=null){
			callback(err,null);
		} else {
			callback(null,count);
		}
	})
}



PersonProvider.prototype.find = function(params, callback){

	Person.find(params, function(err, person){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, person);
		}
	})


}


exports.PersonProvider = PersonProvider;
