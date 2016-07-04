var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Company = new Schema({
	name					: String,
	page_name 				: String,
	logo 					: String,
	created_on	 			: Date,
	brands 					: [],
	departments 			: []
})


mongoose.model('Company', Company);

var Company = mongoose.model('Company');

CompanyProvider = function(){};

//METHODS GO HERE

CompanyProvider.prototype.save = function(params, callback){
	
	var company = new Company(params);
	
	company.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new company for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, company);
		}
	})

}

CompanyProvider.prototype.findOne = function(params, callback){
	
	Company.findOne(params, function (err, company) {
	
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, company);			
		}

	});

}

CompanyProvider.prototype.find = function(params, callback){

	var query = params.query;
	var page_number = params.page_number || 0;
	var limit = params.limit || 10;


	Company.find(query).skip(page_number*limit).limit(limit).sort({created_on : -1}).exec(function(err, companies){
		
		if(err != null){
			callback(err, null);
		} else {
			callback(null, companies);
		}

	})


}


CompanyProvider.prototype.findById = function(id, callback){

	
	Company.findById(id, function(err, company){
		
		if(err != null){
			callback(err, null);
		} else {
			callback(null, company);
		}

	})


}


exports.CompanyProvider = CompanyProvider;
