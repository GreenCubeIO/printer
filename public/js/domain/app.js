var app = {
	bracelets 	: [],
	init 								: function(){

		var self = this;
		self.startSocket();
		self.displayCharge();
		self.setAdmin();

	},
	setAdmin : function(){

		if(Boolean(app.getQueryStringParam("admin")) === true ){

			app.setSlider();

		}

	},

	setSlider : function(){

		$('<div id="slider-tooltip"></div>').appendTo('body');

		var tooltipSlider = $('#slider-tooltip')[0];

		noUiSlider.create(tooltipSlider, {
			start: 0,
			animate : false,
			range: {
				min: 0,
				max: 100
			}
		});

		tooltipSlider.noUiSlider.on('update', function( values, handle ){
			
			app.server.emit('energy', { energy : values[0] })

		});



	},

	addToolTips : function(){

		var tipHandles = tooltipSlider.getElementsByClassName('noUi-handle'),
			tooltips = [];

		// Add divs to the slider handles.
		for ( var i = 0; i < tipHandles.length; i++ ){
			tooltips[i] = document.createElement('div');
			tipHandles[i].appendChild(tooltips[i]);
		}

		// Add a class for styling
		tooltips[1].className += 'tooltip';
		// Add additional markup
		tooltips[1].innerHTML = '<strong>Value: </strong><span></span>';
		// Replace the tooltip reference with the span we just added
		tooltips[1] = tooltips[1].getElementsByTagName('span')[0];

		// When the slider changes, write the value to the tooltips.
		tooltipSlider.noUiSlider.on('update', function( values, handle ){
			tooltips[handle].innerHTML = values[handle];
		});

	},

	process_message : _.debounce(function(message){
		var energy = (message.energy > 100 ? 100 : message.energy) * 67 / 100;
		
		//67% is 100% width
		$('.charge').animate({width:energy + '%'}, 150);

		$('#percentage').css({ 'line-height' : $('.charge').height() + 'px'}).html(parseInt(message.energy) + '%');

	}, 500),
	getQueryStringParam : function(param){

		var assoc  = {};
		var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
		var location_url = location.href;
		var queryString = location_url.substring((location_url.indexOf("?") + 1), location_url.length);

		var keyValues = queryString.split('&');

		for(var i = 0; i < keyValues.length; i++) {
			var key = keyValues[i].split('=');
			if (key.length > 1) {
				assoc[decode(key[0])] = decode(key[1]);
			}
		}

		return assoc[param];
	},	
	displayCharge : function(){

		var width = $(window).width();
		var height = $(window).height();
		var charge_height = $('.charge').height();
		var calculated_width = (width - (width * .35));

		$('.charge').css({
			width 		: calculated_width + 'px',
			position 	: 'fixed',
			top 		:  ((height/2) - (charge_height /2)) + 'px',
			left 		: (width/2 - (calculated_width / 2))+ 'px'
		});
		$('.charge').css({ width : '0px'}).fadeIn(300);

	},

	startSocket : function(){
		
		app.server = io(location.origin.replace(/^http/, 'ws'));

		app.server.on('message',app.process_message);		


	}		
	



}

app.init();