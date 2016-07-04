var package = require('../package.json');

var Schema = mongoose.Schema , ObjectId = Schema.ObjectId;

var Message = new Schema({
	to						: {},
	from 					: {},
	created_on	 			: Date,
	content					: String
})


mongoose.model('Message', Message);

var Message = mongoose.model('Message');

MessageProvider = function(){};

//METHODS GO HERE

MessageProvider.prototype.save = function(params, callback){
	
	var message = new Message(params);
	
	message.save(function(err){
		if(err != null){
			console.log("Error found while trying to save a new message for app name " + package.name + " | error: " + err.toString() + " | Data: " + JSON.stringify(params));
			callback(err, null);		
		} else {
			callback(null, message);
		}
	})

}

MessageProvider.prototype.findOne = function(params, callback){
	
	Message.findOne(params, function (err, message) {
	
		if(err != null){
			callback(err, null);	
		} else {
			callback(null, message);			
		}

	});

}

MessageProvider.prototype.find = function(params, callback){

	var query = params.query;
	var page_number = params.page_number || 0;
	var limit = params.limit || 10;


	Message.find(query).skip(page_number*limit).limit(limit).sort({created_on : -1}).exec(function(err, messages){
		
		if(err != null){
			callback(err, null);
		} else {
			callback(null, messages);
		}

	})


}

MessageProvider.prototype.getConversations = function(params, callback){

	var self = this;

	Message.find(params).sort({created_on : -1}).exec(function(err, messages){

		if(err != null){

			callback(err, null);

		} else {

			var conversations = [];

			_.each(messages, function(message){
				
				if(
					_.find(conversations,function(conversation){

						return (conversation.conversation_id.indexOf(message.from._id + '_' + message.to._id) > -1);
						
					}) == null
				){
					message.conversation_id = message.from._id + '_' + message.to._id + '_' + message.to._id + '_' + message.from._id;
					conversations.push(message);
				}
				
			})


			callback(null, conversations);

		}
	
	});

}

exports.MessageProvider = MessageProvider;
