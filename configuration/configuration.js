	module.exports = {
	environments : [{
		name			: "development",
		facebook : {
			app_id 			: 1691706474387259,
			secret 			: "e11e1a9998e4a98c2f89a0e0a93130ee",
			scope 			: 'email,user_about_me,user_birthday,user_location,publish_stream,ads_management,manage_pages',
			redirect_url 	: '/auth/facebook'			
		},
		db 		: {
			username 	: "bwn_control_usr",
			password 	: "bwn_control",
			server 		: "ds035702.mongolab.com:35702",
			db_name 	: "bwn_control"
		}
	},{
		name 			: "production",
		facebook : {
			app_id 			: 1691706474387259,
			secret 			: "e11e1a9998e4a98c2f89a0e0a93130ee",
			scope			: 'email,user_about_me,user_birthday,user_location,publish_stream,ads_management,manage_pages',
			redirect_url 	: '/auth/facebook'			
		},
		db 		: {
			username 	: "bwn_control_usr",
			password 	: "bwn_control",
			server 		: "ds035702.mongolab.com:35702",
			db_name 	: "bwn_control"
		}
	}]
	,
	crypto_key 	: "gay-ready"
}