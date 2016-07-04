var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Task = new Schema({
	person						: {},
	description 				: String,
	brand 						: {},
	starts 						: Date,
	ends 						: Date,
	history 					: [],
	created_on 					: Date,
	completed_on 				: Date,
	created_by 					: {},
	assigned_by 				: {},
	status          			: { type: String, default: "pending"},
	slacked 					: { type: Boolean, default: false }
})

mongoose.model('Task', Task);

var Task = mongoose.model('Task');

TaskProvider = function(){};

//METHODS GO HERE

TaskProvider.prototype.save = function(params, callback){
	
	var task = new Task(params);
	
	task.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new task for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, task);
		}
	})

}

TaskProvider.prototype.findOne = function(params, callback){
	Task.findOne(params, function (err, task) {
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, task);			
		}
	});
}

TaskProvider.prototype.findById = function(id, callback){
	Task.findById(id, function (err, task) {
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, task);			
		}
	});
}

TaskProvider.prototype.find = function(params, callback){

	var query = params.query;
	var page_number = params.page_number || 0;
	var limit = params.limit || 10;

	Task.find(query).skip(page_number*limit).limit(limit).sort({created_on : -1}).exec(function(err, tasks){
		if(err != null){
			callback(err, null);
		} else {
			callback(null, tasks);
		}
	})

}

exports.TaskProvider = TaskProvider;

