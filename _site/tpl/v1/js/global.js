var global = {
	pageX: 0, pageY: 0, 'pending_ajax_requests': {}, 'previous_ajax_request': {}, 'dragging' : {}, 'dropzones' : {}
};

$('html').addClass('js');

jQuery.fn.outerHTML = function(s) {
	return s
		? this.before(s).remove()
		: jQuery("<p>").append(this.eq(0).clone()).html();
};

// Regex Index Of
String.prototype.regexIndexOf = function(regex, startpos) {
	var indexOf = this.substring(startpos || 0).search(regex);
	return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// For cron jobs
(new Image()).src = 'cron/?' + (new Date).getTime();

global.init = function () {
	// Checkboxes
	$('input[type="checkbox"].checkbox-include-default').each(function() {
		var _default = $(this).outerHTML().replace('type="checkbox"','type="hidden"').replace('type=\'hidden\'','type="hidden"').replace('type=checkbox','type=hidden');
		_default = $(_default);
		_default.attr('value','');

		$(this).before(_default);
	});

	// Default texts
	$('.dtext').each(global.default_texts);
	
	// Dropdowns
	$('.select').each(global.prep_dropdowns);

	$(document).mousedown(global.clear_dropdowns);
	
	$('a[rel=user_dropdown]').click(global.show_user_dropdown);

	$('a#facebook-login').live('click', global.facebook_login);

	$(document).ajaxSend(function(e, xhr, options) {
		var token = $("meta[name='csrf-token']").attr("content");
		xhr.setRequestHeader("X-CSRF-Token", token);
	});

	// Meridian switcher
	$('.ampm').click(global.switch_meridian);

	// Add more buttons
	$('.add-more').live('click', global.toggle_adjacent_content);
	
	// Checkboxes
	$('a[data-dropdown]').live('click', global.dropdown_show);
	$('ul[data-dropdown] li a').live('click', global.dropdown_item_click);
	$('.checkbox').click(global.toggle_checkbox);
	$('#website-settings .checkbox_settings, #website-settings .checkbox_page').click(global.toggle_checkbox_settings);

}

global.toggle_adjacent_content = function() {
	$(this).next().toggle();
}

global.disable_window_scroll = function() {
	$('body').bind('mousewheel', function() {
		event.preventDefault();
	})
}

global.enable_window_scroll = function() {
	$('body').unbind('mousewheel');
}

global.facebook_login = function() {
	FB.getLoginStatus(function(response) {
		if (typeof response !== "undefined" && hasOwnProperty.call(response, 'status') && response.status === 'connected') {
			FB.api('/me', function(me) {
				if(!(hasOwnProperty.call(me, 'error'))) {
					window.location = "login_intro?access_token=" + response.authResponse.accessToken;
				} else {
					location.reload(true);
				}
			});
		} else {
			global._facebook_login();
		}
	});

	return false;
}

global._facebook_login = function() {
	FB.login(function(response) {
		if (response.authResponse) {
			window.location = "login_intro?access_token=" + response.authResponse.accessToken;
		}
	}, { scope: global.facebook_login_scope });
}

global.show_user_dropdown = function () {
	$('#user_dropdown').removeClass('hidden');
	$('#header ul a.menu').addClass('list');
	return false;
}

global.prep_dropdowns = function () {
	$(this).click(global.show_dropdown);
}

global.show_dropdown = function () {
	var rel = $(this).attr('rel').split('_');
	var input = $('input[name=' + rel[0] + ']');
	var dropdown = $('#' + rel[1]);
	var position = $(this).position();
	
	dropdown.removeClass('hidden');
	dropdown.css('width', $(this).outerWidth() + 'px');
	dropdown.css('top', (position.top + $(this).height() + 5) + 'px');
	dropdown.css('left', (position.left + 5) + 'px');
	
	var links = $('a', dropdown);
	for (i = 0; i < links.length; i++) {
		var a = $(links[i]);
		a.attr('data-rel', rel[0] + '_' + rel[1]);
		a.click(global.dropdown_select);
	}
	
	return false;
}

global.dropdown_select = function () {
	var rel = $(this).attr('data-rel').split('_');
	var input = $('#' + rel[0]);
	var dropdown = $('#' + rel[1]);
	var a = $('a[rel=' + $(this).attr('data-rel') + '] strong');
	
	input.val($(this).attr('rel'));
	a.html($(this).html());
	
	dropdown.addClass('hidden');
	
	return false;
}

global.clear_dropdowns = function (e) {
	global.pageX = e.pageX;
	global.pageY = e.pageY;
	
	$('.dropdown, #user_dropdown').each(function () {
		
		if (!$(this).hasClass('hidden')) {
			var offset = $(this).offset();
			if (global.pageX < offset.left || global.pageX > offset.left + $(this).outerWidth() || global.pageY < offset.top || global.pageY > offset.top + $(this).outerHeight()) {
				$(this).addClass('hidden');
				$('#header ul a.menu').removeClass('list');
			}
		}
	});
}

/* New dropdowns */
global.dropdown_show = function() {
	var dropdown = $('ul[data-dropdown="'+$(this).attr('data-dropdown')+'"]');
	var position = $(this).position();

	dropdown.removeClass('hidden');
	dropdown.css('width', $(this).outerWidth() + 'px');
	dropdown.css('top', (position.top + $(this).height() + 5) + 'px');
	dropdown.css('left', (position.left + 5) + 'px');

	return false;
}

global.dropdown_item_click = function() {
	var dropdown = $('ul[data-dropdown="'+$(this).parents('ul:first').attr('data-dropdown')+'"]');
	var position = $(this).position();
	var input = $('input[data-dropdown="'+$(this).parents('ul:first').attr('data-dropdown')+'"]');
	var a = $('a[data-dropdown="'+$(this).parents('ul:first').attr('data-dropdown')+'"]');
	
	dropdown.removeClass('hidden');
	dropdown.css('width', $(this).outerWidth() + 'px');
	dropdown.css('top', (position.top + $(this).height() + 5) + 'px');
	dropdown.css('left', (position.left + 5) + 'px');

	$(input).val($(this).attr('data-value'));
	$(input).trigger('change');
	a.html($(this).html());

	dropdown.addClass('hidden');

	return false;
}

global.default_texts = function () {
	if (!$(this).val().length) {
		$(this).val($(this).attr('title'));
		$(this).focus(global.handle_focus);
		$(this).blur(global.handle_blur);
	}
}

global.handle_focus = function () {
	if ($(this).val() == $(this).attr('title')) {
		$(this).val('');
	}
}

global.handle_blur = function () {
	if ($(this).val() == '') {
		$(this).val($(this).attr('title'));
	}
}
	
global.switch_meridian = function () {
	var input = $('#' + $(this).attr('rel'));
	var value = input.val() == 'PM' ? 'AM' : 'PM';
	
	input.val(value);
	$(this).html(value);
	
	return false;
}

global.supports_local_storage = function() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

global.cache_exists = function(key, uid) {
	if(!global.supports_local_storage())
		return false;

	if(typeof uid !== "undefined")
		key = key + "--" + uid;

	if(localStorage[key])
		return true;

	return false;
}

global.cache_load = function(key, uid) {
	if(typeof uid !== "undefined")
		key = key + "--" + uid;

	if(localStorage[key])
		return localStorage.getItem(key);

	return false;
}

global.cache_save = function(key, value, uid) {
	if(!global.supports_local_storage())
		return false;
	
	if(typeof uid !== "undefined")
		key = key + "--" + uid;

	try {
		localStorage.setItem(key, value); 
		return true;
	} catch (e) {
		if (e == QUOTA_EXCEEDED_ERR) {
			return false;
		}
	}
}

global.cache_remove = function(key, uid) {
	if(!global.supports_local_storage())
		return false;

	if(typeof uid !== "undefined")
		key = key + "--" + uid;

	try {
		localStorage.removeItem(key);
		return true;
	} catch(e) {
		return false;
	}

}

global.toggle_checkbox = function () {
	$(this).toggleClass('checked');

	$('input[name=' + $(this).attr('rel') + ']').val($(this).hasClass('checked') ? '1' : '0');
	
	return false;
}

global.toggle_checkbox_settings = function () {

	$(this).toggleClass('checked');

	if($(this).hasClass('checkbox_page')){
		$('input[name=' + $(this).attr('rel') + ']').val($(this).hasClass('checked') ? '0' : '1');
	}else{
		$('input[name=' + $(this).attr('rel') + ']').val($(this).hasClass('checked') ? '1' : '0');
	}
	return false;
}

$(document).ready(global.init);