var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Notification = new Schema({
	created_on 					: Date,
	from						: {},
	to							: {},
	action 						: String
})

mongoose.model('Notification', Notification);

var Notification = mongoose.model('Notification');

NotificationProvider = function(){};

//METHODS GO HERE

NotificationProvider.prototype.save = function(params, callback){
	
	var notification = new Notification(params);
	
	notification.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new notification for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, notification);
		}
	})

}

NotificationProvider.prototype.findOne = function(params, callback){
	Notification.findOne(params, function (err, notification) {
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, notification);			
		}
	});
}

NotificationProvider.prototype.find = function(params, callback){

	var query = params.query;
	var page_number = params.page_number || 0;
	var limit = params.limit || 10;

	Notification.find(query).skip(page_number*limit).limit(limit).sort({created_on : -1}).exec(function(err, notifications){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, notifications);
		}
	})

}

exports.NotificationProvider = NotificationProvider;

