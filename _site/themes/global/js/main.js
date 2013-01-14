// Images loaded function
(function(c,n){var k="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(l){function m(){var b=c(h),a=c(g);d&&(g.length?d.reject(e,b,a):d.resolve(e));c.isFunction(l)&&l.call(f,e,b,a)}function i(b,a){b.src===k||-1!==c.inArray(b,j)||(j.push(b),a?g.push(b):h.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(h),c(g)]),e.length===j.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var f=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=f.find("img").add(f.filter("img")),j=[],h=[],g=[];e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){i(b.target,"error"===b.type)}).each(function(b,a){var e=a.src,d=c.data(a,"imagesLoaded");if(d&&d.src===e)i(a,d.isBroken);else if(a.complete&&a.naturalWidth!==n)i(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=k,a.src=e}):m();return d?d.promise(f):f}})(jQuery);

$("html").addClass('js');



function init () {
	
	var spl = window.location.pathname.split('/'),
	parent = spl[spl.length-1];
	pathname = window.location.pathname;
	$(document).ajaxSend(function(e, xhr, options) {
		var token = $("meta[name='csrf-token']").attr("content");
		xhr.setRequestHeader("X-CSRF-Token", token);
	});

	// Carousel
	var carousel_visible = $("#carousel").attr('data-visible');
	if(typeof carousel_visible === "undefined" || carousel_visible === false ) {
		carousel_visible = 4;
	} else {
		carousel_visible = parseInt(carousel_visible);
	}

	$("#carousel").attr('data-total', $("#carousel li a img").length);

	if($("#carousel li a img").length > carousel_visible) {
		$("#carousel").parents(".carousel_wrap:first").find(".prev").removeClass('hidden');
		$("#carousel").parents(".carousel_wrap:first").find(".next").removeClass('hidden');
		$("#carousel").parent().find('.carousel_wrap').removeClass('hidden');
		var mouse = true;
	}else{
		var mouse = false;
	}

	var total = $("#carousel").attr('data-total');
	var index = 1;
	var text = index + " of " + total;
	$("#carousel").parent().find('.count').html(text);

    $("#carousel").jCarouselLite({
		btnNext: ".next",
		btnPrev: ".prev",
		mouseWheel: mouse,
		speed: 500,
		visible: carousel_visible,
		afterEnd: function(e) {
			var total = $("#carousel").attr('data-total');

			if(total !== undefined) {
				var index = $(e).index();
				if(index > total)
					index = 1;

				var text = index + " of " + total;

				$(e).parents('.carousel_wrap:first').find('.count').html(text);
			}
		}
    });
	$('#carousel li a').eq(4).addClass('active');
	$('a[data-popup-id]').bind('click', function() {
		show_popup($(this).attr('data-popup-id'));
		return false;
	});

	$('.popup#popup-rsvp form').bind('submit', function() {
		$.post(pathname + '/add_wedding_rsvp', $('.popup#popup-rsvp form').serialize(), function(data) {
			if(data) {
				$('.popup#popup-rsvp form').hide();
				$('.popup#popup-rsvp').append('<div class="message js">' + data + '</div>');
				setTimeout(function() {
					hide_popups(); $('.popup#popup-rsvp form').show(); $('.popup#popup-rsvp .message.js').hide();
				}, 5000);
			}
		});

		return false;
	});

	$("form.add-event-rsvp .rsvp-edit, form.add-event-rsvp .rsvp-submit").bind('click', function() {
		var form = $(this).parents('form:first');

		if($(form).find('.edit-rsvp').is(':hidden')) {
			$(form).find('.edit-rsvp').show();
			$(form).find('.show-rsvp').hide();
		} else {
			$.post('add_event_rsvp', $(form).serialize(), function(data) {
				if(data) {					
					$(form).find('.show-rsvp span').html(data.label);
					$(form).find('.edit-rsvp').hide();
					$(form).find('.show-rsvp').show();
				}
			}, "json");
		}

		return false;
	});

	$('.popup-background').live('click', hide_popups);

	$(document).mousedown(top.close_color_picker);
	$(document).mousedown(clear_site_dropdowns);

	$('#login-bar .fb-login').live('click', facebook_login);
	$('#login-bar .close-login-bar').live('click', hide_login_bar);
	
	if($("#carousel").length > 0){
		$('html').keydown(function(press) {
				var keyCode = press.keyCode || press.which
				arrow ={left: 37, right: 39}
				
			switch (keyCode) {
				case arrow.left:
				$(".prev").trigger('click');
				break;
				case arrow.right:
				$(".next").trigger('click');
				break;
			}
		});
	};

	// Avatar menu
	$('a.avatar').live('click', function() {
		$(this).addClass('active');
	});

	// Removing stories
	$('a.remove-story').live('click', function() {
		var path = window.location.pathname.split("/guests")[0];

		if (confirm("Are you sure you want to delete this story?")) {
			$(this).parents($(this).data('parent') + ':first').remove();
			$.post(root + '/api/stories/remove/?id=' + $(this).data('id'));
		} 

		return false;
	});
	
}
facebook_login = function() {
	var redir = $(this).attr('data-redirect-uri');
	var is_custom_domain = $(this).attr('data-custom-domain');

	if(typeof is_custom_domain === "undefined" || is_custom_domain == undefined) {
		FB.getLoginStatus(function(response) {
			if (typeof response !== "undefined" && hasOwnProperty.call(response, 'status') && response.status === 'connected') {
				FB.api('/me', function(me) {
					if(!(hasOwnProperty.call(me, 'error'))) {
						window.location = redir + "?access_token=" + response.authResponse.accessToken;
					} else {
						location.reload(true);
					}
				});
			} else {
				FB.login(function(response) {
					if (response.authResponse) {
						window.location = redir + "?access_token=" + response.authResponse.accessToken;
					}
				}, { scope: facebook_login_scope });
			}
		});

		return false;
	}
}

function show_popup (id) {
	var el = $('.popup#popup-'+id);
	popup_width = $(el).width();
	popup_width = $(el).height();
	$('body').append('<div class="popup-background"></div>');
	$(el).addClass('active');
}

function hide_popups() {
	$('.popup.active').removeClass('active');
	$('body', top).find('.popup-background').remove();
}

function clear_site_dropdowns() {
	$('.dropdown, #user_dropdown', window.parent.document).each(function () {
		$(this).addClass('hidden');
	});
}

function hide_login_bar() {
	$("#login-bar").addClass('slide-up');
	var uri = $(this).attr('data-uri');
	$.post(uri);
	return false;
}
//more info

//guests
$('div.list .moreinfo').live('hover', function(){
	var div = $(this).parents('li:first').find('div.how');
	$(this).addClass('hover');
	$(div).addClass('hover');

	$(div).fadeIn("fast", function() {
		$(div).css('opacity', 1);
		$(div).css('display', 'block')	
	});

	$('.moreinfo').click(function(){
		return false;
	});
});

$('div.list .moreinfo, div.list div.how').live('mouseleave', function(e){
	var div = $(this).parents('li:first').find('div.how');
	var a = $(this).parents('li:first').find('.moreinfo');
	var div_offset = $(div).offset();

	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('hover');
		
		$('div.desc:not("div.how")').fadeOut("fast");
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('hover');
		});
		
		$('.moreinfo').click(function(){
			return false;
		});
	}
});

//friends
$('div.list a.friends:not(.loading)').live('hover', function(){
	var user = $(this).parents('li:first').attr('data-uid');
	var el = $(this);
	var div = $(el).parents('li:first').find('div.friend');
	var inner = $(el).parents('li:first').find('div.friend div.scroll');
	var mutual_friends_listed = parseInt($(this).text().replace(' ',''));
	var name = $(this).siblings('a.name').html().split(/\b/)[0];
	
	if(!mutual_friends_listed)
		return false;
	
	$(this).addClass('hover');
	$(div).addClass('hover');
	
	if($(div).find('ul').length) {
		$(div).fadeIn("fast");
	} else {
		$(el).addClass('loading');
		$.get(wedding_root + '/get_mutual_friends/js/?&mutual_friends_listed=' + mutual_friends_listed + '&name=' + name + '&user2=' + user, function(data) {
			$(el).removeClass('loading');
			$(inner).prepend($(data));

			$(div).fadeIn("fast", function(){
				$(div).css('opacity', 1);
				var height = ($(inner).find('ul').height());
				$(div).children('div.viewport').css('height', height);
				$(div).tinyscrollbar();
			});
		});
	}

	$('.friends').click(function(){
		return false;
	});
});

$('div.list a.friends, div.list div.friend').live('mouseleave', function(e){
	var div = $(this).parents('li:first').find('div.friend');
	var a = $(this).parents('li:first').find('a.friends');
	var div_offset = $(div).offset();

	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('hover');
		
		$('div.desc:not("div.friend")').fadeOut("fast");
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('hover');
		});
		
		$('.moreinfo').click(function(){
			return false;
		});
	}
});


//interests
$('div.list a.int:not(.loading)').live('hover', function(){
	var user = $(this).parents('li:first').attr('data-uid');
	var el = $(this);
	var div = $(el).parents('li:first').find('div.int');
	var inner = $(el).parents('li:first').find('div.int div.scroll');
	var mutual_interests_listed = parseInt($(this).text().replace(' ',''));
	
	if(!mutual_interests_listed)
		return false;

	$(this).addClass('hover');
	$(div).addClass('hover');
	
	if($(div).find('ul').length) {
		$(div).fadeIn("fast");
	} else {
		$(el).addClass('loading');
		$.get(wedding_root + '/get_mutual_likes/js/?&user2=' + user, function(data) {
			$(el).removeClass('loading');
			$(inner).prepend($(data));
			$(div).fadeIn("fast", function(){
				$(div).css('opacity', 1);
				var height = ($(inner).find('ul').height());
				$(div).children('div.viewport').css('height', height);
				$(div).tinyscrollbar();
			});
		});
	}

	$('a.int').click(function(){
		return false;
	});
}); 

$('div.list a.int, div.list div.int').live('mouseleave', function(e){
	var div = $(this).parents('li:first').find('div.int');
	var a = $(this).parents('li:first').find('a.int');
	var div_offset = $(div).offset();

	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('hover');
		
		$('div.desc:not("div.int")').fadeOut("fast");
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('hover');
		});
		
		$('.moreinfo').click(function(){
			return false;
		});
	}
});

//registry
$('div.regs .moreinfo').live('hover', function(){
	var div = $(this).parents('div.regs:first').find('div.desc');
	$(this).addClass('hover');
	$(div).addClass('hover');

	$(div).fadeIn("fast").addClass("active");
	
	$('div.regs .moreinfo').click(function(){
		return false;
	});

});

$('div.regs .moreinfo').live('mouseleave', function(e){
	var div = $(this).parents('div.regs:first').find('div.desc');
	var a = $(this).parents('div.regs:first').find('.moreinfo');
	var div_offset = $(div).offset();

	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('hover');
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('hover');
		});
		
		$('.moreinfo').click(function(){
			return false;
		});
	}
});

//roles
$('div.list a.role').live('hover', function(){
	var div = $(this).parents('li.guests:first').find('div.role');
	$(this).addClass('active');
	$(div).addClass('active');
		
	$(div).fadeIn("fast", function(){
		$(div).css('opacity', 1);
	});
	
	$('div.list a.role').click(function(){
		return false;
	});

});
$('div.list a.role, div.role').live('mouseleave', function(e){
	var div = $(this).parents('li.guests:first').find('div.role');
	var a = $(this).parents('li.guests:first').find('.role');
	var div_offset = $(div).offset();
	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('active');
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('active');
		});
		
		$('.role').click(function(){
			return false;
		});
	}
});
//profile interests
$('div.profile_int a.interest').live('hover', function(){
	var div = $(this).siblings('div.int_name');
	$(this).addClass('active');
	$(div).addClass('active');
		
	$(div).fadeIn("fast", function(){
		$(div).css('opacity', 1);
	});
	
	$('div.list a.role').click(function(){
		return false;
	});

});
$('div.profile_int a.interest, div.profile_int div.int_name').live('mouseleave', function(e){
	var div = $(this).parents('div.profile_int').find('div.int_name');
	var a = $(this).parents('div.profile_int').find('a.interest');
	var div_offset = $(div).offset();
	if((e.pageX < div_offset['left'] || e.pageX > (div_offset['left'] + $(div).outerWidth())) || (e.pageY < div_offset['top'] || e.pageY > (div_offset['top'] + $(div).outerHeight()))) {
		$(a).removeClass('active');
		
		$(div).fadeOut("fast", function() {
			$(div).removeClass('active');
		});
		
		$('.role').click(function(){
			return false;
		});
	}
});$(document).bind('ready', init);