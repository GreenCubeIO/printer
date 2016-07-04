var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Brand = new Schema({
	name					: String,
	page_name 				: String,
	logo 					: String,
	created_on	 			: Date,
	company_id				: String
})


mongoose.model('Brand', Brand);

var Brand = mongoose.model('Brand');

BrandProvider = function(){};

//METHODS GO HERE

BrandProvider.prototype.save = function(params, callback){
	
	var brand = new Brand(params);
	
	brand.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new brand for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, brand);
		}
	})

}

BrandProvider.prototype.findOne = function(params, callback){
	
	Brand.findOne(params, function (err, brand) {
	
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, brand);			
		}

	});

}

BrandProvider.prototype.find = function(params, callback){

	var query = params.query;
	var page_number = params.page_number || 0;
	var limit = params.limit || 10;


	Brand.find(query).skip(page_number*limit).limit(limit).sort({created_on : -1}).exec(function(err, brands){
		
		if(err != null){
			callback(err, null);
		} else {
			callback(null, brands);
		}

	})


}

BrandProvider.prototype.findById = function(id, callback){

	Brand.findById(id , function(err, brand){
		
		if(err != null){
			callback(err, null);
		} else {
			callback(null, brand);
		}

	})


}


exports.BrandProvider = BrandProvider;
