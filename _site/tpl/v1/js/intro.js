var intro = {};

intro.friends = false;

intro.crop = {};
intro.crop.image_orig = false;
intro.crop.image = false;
intro.crop.field = false;
intro.crop.pic = [];
intro.crop.pic[1] = false;
intro.crop.pic[2] = false;
intro.crop.x = 0;
intro.crop.y = 0;
intro.crop.w = 150;
intro.crop.h = 150;
intro.crop_api = false;
intro.names_reordered = false;

intro.init = function () {
	// Load friends for the first time?
	try {
		if (load_friends) {
			$.ajax({
				type: 'POST',
				dataType: 'html',
				url: 'load_friends',
				success: intro.store_friends_handler
			});
		}
	} catch (e) {}
	
	// Spouse search
	if ($('#spouse').length) {
		intro.load_friends();
	}

	$('#spouse').live('keyup', intro.search_spouse);

	// Step 1 editing
	$('.page-step1 .reorder-names a').hover(function() { $(this).prev('p').show(); }, function() { $(this).prev('p').hide(); });
	$('.page-step1 .reorder-names a').live('click', intro.reorder_names);
	$('.selected_user a.edit, #selected_spouse a.edit').live('click', intro.edit_name);
	$('#step1 .selection .remove').live('click', intro.clear_spouse);
	$('#step1 .selection .change').live('click', intro.change_fiance_search);
	
	// Theme selection
	$('#step4 a.choose').click(intro.select_theme);
	
	// Custom domain
	$('#step3 .add').click(intro.show_domain);
	$('#step3 .add-domain .close').click(function() { intro.hide_domain(true); return false; });
	$('#step3 .add-domain .next').click(intro.show_domain2);
	$('#step3 .add-domain .remove').click(intro.remove_domain);
	$('#step3 #domain.removing-domain').live('change', intro.no_longer_removing_domain);
	$('#step3 .own-domain').click(intro.own_domain);
	$('#step3 .set-domain-dns .close').click(intro.hide_set_domain_dns);
	if($("body").hasClass("page-step3")) {
		intro.upload_default_photos();
	}

	$("#step1 .option").live('click', intro.step1_click_option);
	
	// Manage admins
	$('#manage-admins').click(intro.manage_admins);
	$('#admin').keyup(intro.search_admin);
}

intro.store_friends_handler = function (data) {
	json = jQuery.parseJSON(data);

	if (json.success) {
		global.cache_save('friends/all', data, global.uid);
		data = json;
		window.location = './';
	}
}

intro.handle_focus = function () {
	if ($(this).val() == $(this).attr('title')) {
		$(this).val('');
	}
}

intro.handle_blur = function () {
	if ($(this).val() == '') {
		$(this).val($(this).attr('title'));
	}
}

intro.load_friends = function () {
	if(global.cache_exists('friends/all' , global.uid)) {
		intro.load_friends_handler(global.cache_load('friends/all', global.uid), false, false, false);
		return;
	}

	$('#spouse_label').removeClass('hidden').show();
	$.ajax({
		type: 'POST',
		dataType: 'html',
		url: 'step1/js',
		data: {'action': 'load_friends'},
		success: intro.load_friends_handler
	});
}

intro.load_friends_handler = function (data, textStatus, jqXHR, save_to_cache) {
	if(typeof save_to_cache === "undefined" || save_to_cache) {
		global.cache_save('friends/all', data, global.uid);
	}

	$('#spouse_label').addClass('hidden').hide();

	data = jQuery.parseJSON(data);
	
	intro.friends = data.friends;
}

intro.reorder_names = function() {
	if(intro.names_reordered) {
		var label = $('.selection').eq(0).prev().clone().addClass('second');
		var clone = $('.selection').eq(0).clone();
		$('.selection').eq(0).prev().remove();
		$('.selection').eq(0).remove();
		$(clone).insertAfter('.selection:last')
		$(label).insertBefore('.selection:last');
		$('.selection').eq(0).prev().removeClass('second');
		intro.names_reordered = false;
		$("input[name='flip']").val('');
	} else {
		var label = $('.selection').eq(1).prev().clone().removeClass('second');
		var clone = $('.selection').eq(1).clone();
		$('.selection').eq(1).prev().remove();
		$('.selection').eq(1).remove();
		$(clone).insertBefore('#step1 label').first();
		$(label).insertBefore('.selection:first');
		$('.selection').eq(1).prev().addClass('second');
		intro.names_reordered = true;
		$("input[name='flip']").val('1');
	}

	// Reset values
	$('.dtext').val('');
	$('.dtext').each(global.default_texts);

	return false;
}

intro.search_spouse = function () {
	var friends = intro.friends;
	var matched_friends = [];

	if($("#spouse").hasClass('disabled'))
		return false;
	
	if ($(this).val().length >= 2) {
		for (i = 0; i < friends.length; i++) {
			try {
				if (friends[i]['name'].toLowerCase().match($(this).val().toLowerCase())) {
					matched_friends[matched_friends.length] = i;
				}
			} catch (e) {}
		}
	}
	
	if (matched_friends.length) {
		$('#results').removeClass('hidden');
	} else {
		$('#results').addClass('hidden');
		$("#footer").css('bottom',0);
	}
	$('#results').html('');
	

	var results_length = matched_friends.length;

	for (i in matched_friends) {
		var index = matched_friends[i];
		$('#results').append('<li><a href="#" onclick="intro.select_spouse(' + index + '); return false"><img src="https://graph.facebook.com/' + friends[index]['fb_id'] + '/picture?type=square&access_token=' + FB.accessToken + '" alt="" /> <span>' + friends[index]['name'].toLowerCase().replace($(this).val().toLowerCase(), '<strong>' + $(this).val() + '</strong>') + '</span></a>');
	
		// Push the footer down..
		if(i == results_length-1) {
			if(parseInt($("#results").height()) < 411) {
				$("#footer").css('bottom',0);
			} else {
				$("#footer").css('bottom',"-"+(parseInt($("#results").height())-371)+"px");
			}
		}
	}
}

intro.select_spouse = function (index) {
	var friends = intro.friends;

	// Set display name to first name by default
	var first_name = friends[index]['name'].match(/([^ ]*) /i)[0].replace(/(\s*$)/g, '');
	var gender = friends[index]['gender'];
	var role = false;
	var role_id = 0;
	$('.selection.second:first').find('.change').addClass('hidden');
	$('#spouse').addClass('hidden');
	$('#results').addClass('hidden');
	$("#footer").css('bottom',0);
	$('#spouse_name').removeClass('hidden');
	$('#spouse_name input').val($('#spouse_name input').attr('title'));
	$('#selected_spouse').removeClass('hidden');
	$('#selected_spouse').html('<a class="edit" href="#">Edit</a>' + first_name);
	$('input#name2').val(first_name);
	$('input#name2').attr('name', "wedding[spouse][name]");

	// Set role based on gender
	if(gender && gender != "") {
		if(gender == 'male') {
			role_id = 2;
			role = 'groom';
		} else if(gender == 'female') {
			role_id = 1;
			role = 'bride';
		}
	}

	$("#selected_spouse").parents(".selection:first").find(".options .option.active").removeClass('active');

	$('input[name="wedding[spouse][role]"]').val(role_id);

	$("#selected_spouse").parents(".selection:first").find(".remove").removeClass("hidden");

	if(role != false && role_id != '') 
		$("#selected_spouse").parents(".selection:first").find(".options .option."+role+"").addClass('active');

	$('input[name="wedding[spouse][id]"]').val(friends[index]['id']);
	
	$('input[name="_facebook"]').val('1');
}

intro.clear_spouse = function () {
	$('.selection.second:first').find('.remove').addClass('hidden');
	$('#spouse').removeClass("editing-name");
	$('#spouse').val($('#spouse').attr('title'));
	$('#spouse').removeClass('hidden');
	$('#selected_spouse').addClass('hidden');
	$('#spouse_name').addClass('hidden');
	$('input[name="wedding[spouse][id]"]').val('');
	$('input[name="wedding[spouse][role]"]').val('');
	$('#name2').addClass('hidden');
	$('#name2').val('');
	$("#selected_spouse").parents(".selection:first").find(".options .option.active").removeClass('active');
	$('.selection.second:first').find('.change').removeClass('hidden');

	if($("#spouse").hasClass('disabled')) {
		$('#name2').removeAttr('name');
		$('#spouse').attr('name', "wedding[spouse][name]");
	}
	
	return false;
}

intro.upload_default_photos = function() {
	$.post('step3/upload_default_photos');
}

intro.select_theme = function () {
	$('input[name=theme]').val($(this).attr('rel'));
	
	$('span.selected').each(function () {
		if (!$(this).hasClass('hidden')) {
			$(this).addClass('hidden');
		}
	});
	
	$('#theme-' + $(this).attr('rel') + ' span.selected').removeClass('hidden');
	
	return false;
}

intro.show_domain = function () {
	$('.add-domain').removeClass('hidden');
	$('.add-domain .step1').removeClass('hidden');
	$('.add-domain .error').addClass('hidden');
	$('.add-domain .step2').addClass('hidden');
	
	return false;
}

intro.hide_domain = function (clear_domain) {
	$('.add-domain').addClass('hidden');
	$('.add-domain .step2 .taken').addClass('hidden');
	$('.add-domain .step2 .available').addClass('hidden');
	$('.add-domain .step1 .taken').addClass('hidden');
	$('#step3 .step1').removeClass('taken');
	$('#step3 .step1 label[for="domain"]:not(.taken)').removeClass('hidden');

	if(typeof clear_domain !== "undefined" && clear_domain && $('.add-domain .remove').length == 0)
		$('#domain').val('yourdomain.com');
	
	return false;
}

intro.show_domain2 = function () {
	if($('#step3').find('input[name="removing_domain"]').val() === '1') {
		intro.hide_domain();
		return false;
	}

	var expression = new RegExp(/^(http(s)?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z]{2,4})+$/i);

	// Domain hasn't changed
	if($('#domain').val() == $('#domain').attr('title') && $(domain).attr('title') !== 'yourdomain.com') {
		intro.hide_domain(false);
		return false;
	}

	// See is valid syntax
	if ($('#domain').val() == $('#domain').attr('title') || !$('#domain').val().match(expression)) {
		$('.add-domain .error.error-invalid').removeClass('hidden');
		return false;
	}

	$('.add-domain .error.error-invalid').addClass('hidden');

	if(!$('#domain').val().match(/(\.(com|me|us))$/i)) {
		$('.add-domain .error.error-wrong-extension').removeClass('hidden');

		return false;
	}

	$('.add-domain .error').addClass('hidden');

	// See if domain is registered, then load next step
	$.post('is_domain_registered', { domain: $('#domain').val() }, function(data) {
		if(Boolean(data)) {
			$('#step3 .step1').addClass('taken');
			$('#step3 .step1').find('a.own-domain').attr('data-domain', $('#domain').val());
			$('#step3 .step1 label[for="domain"]:not(.taken)').addClass('hidden');
			$('#step3 .step1 .taken').removeClass('hidden');
		} else {
			$('#step3 .step2 .available').removeClass('hidden');

			if(!$('#domain').val().match(/(\.(com))$/i)) {
				$('.add-domain .error.error-wrong-extension-purchasing').removeClass('hidden');
			} else {
				$('#step3 .step2 .available .button').bind('click', function() {
					$('#step3').find('input[name="purchasing_domain"]').val('1');
					intro.hide_domain();
				})
		
				$('#step3 .step1').addClass('hidden');
				$('#step3 .step2').removeClass('hidden');
			}
		}
	});
	
	return false;
}

intro.no_longer_removing_domain = function() {
	$('#step3').find('input[name="removing_domain"]').val('0');
	$(this).removeClass('removing-domain');
}

intro.remove_domain = function() {
	if(confirm('Are you sure you want to remove this domain?')) {
		$(this).hide();
		$('#domain').val('');
		$('#domain').addClass('removing-domain');
		$('#step3').find('input[name="removing_domain"]').val('1');
		$('#step3').find('input[name="purchasing_domain"]').val('0');
	}
	return false;
}

intro.own_domain = function() {
	$("#step3").find(".set-domain-dns").find(".what").html($(this).attr('data-domain'));
	$("#step3").find(".set-domain-dns").removeClass('hidden');
	intro.hide_domain();
	return false;
}

intro.hide_set_domain_dns = function() {
	$("#step3").find(".set-domain-dns").addClass('hidden');
	return false;
}

intro.start_crop = function (image, field) {
	if (intro.crop.pic[field]) {
		image = intro.crop.pic[field];
	}
	
	intro.crop.image = image;
	intro.crop.field = field;
	
	if (intro.crop_api) {
		intro.crop_api.destroy();
		intro.crop_api = false;
	}
	
	$('#crop').removeClass('hidden');
	$('#crop img').attr('src', intro.crop.image);
	$('#crop a[rel=save]').click(intro.save_crop);
	$('#crop a[rel=cancel]').click(intro.cancel_crop);
	$('#crop iframe').attr('src', root + '/step2/upload?pic=' + field);
	
	$('#crop .buttons').removeClass('hidden');
	$('#crop .status').addClass('hidden');
	
      var boundx, boundy;
	  
      $('#crop img').Jcrop({
        aspectRatio: 1,
		setSelect: [150, 150, 0, 0],
		onSelect: update_coords
      },function(){
        // Use the API to get the real image size
        var bounds = this.getBounds();
        boundx = bounds[0];
        boundy = bounds[1];
        // Store the API in the jcrop_api variable
        intro.crop_api = this;
      });
	  
	  function update_coords (c) {
		intro.crop.x = c.x;
		intro.crop.y = c.y;
		intro.crop.w = c.w;
		intro.crop.h = c.h;
	  }
	
	return false;
}

intro.change_pic = function (image, field, image_orig) {
	intro.crop.image = image;
	intro.crop.field = field;
	intro.crop_api.setImage(image, intro.change_pic_handler);
	intro.crop_api.setSelect([150, 150, 0, 0]);
	
	//$('#crop img').width('auto').height('auto');
	//$('#crop img').attr('src', intro.crop.image);
}

intro.change_pic_handler = function () {
	$('#crop iframe').contents().find('span').html('Upload a new photo');
}

intro.save_crop = function () {
	$('#crop .buttons').addClass('hidden');
	$('#crop .status').removeClass('hidden');
	
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: 'step2/js',
		data: intro.crop,
		success: intro.save_crop_handler
	});
	
	return false;
}

intro.save_crop_handler = function (data) {
	if (data.success) {
		var box = $('a[rel=pic' + data.field + ']');
		
		box.addClass('selected');
		$('span', box).css('background-image', 'url(\'' + data.image + '\')');
		
		intro.close_crop();
	}
}

intro.cancel_crop = function () {
	var box = $('a[rel=pic' + intro.crop.field + ']');
	
	box.removeClass('loading');
	box.addClass('selected');
	$('span', box).css('background-image', intro.crop.image_orig);
	
	intro.close_crop();
	
	return false;
}

intro.close_crop = function () {
	//intro.crop = {};
	
	$('#crop').addClass('hidden');
}
intro.manage_admins = function () {
	$('#admins').toggle();
	
	return false;
}

intro.search_admin = function () {
	var friends = intro.friends;
	var matched_friends = [];
	
	if ($(this).val().length >= 2) {
		for (i = 0; i < friends.length; i++) {
			try {
				if (friends[i]['name'].toLowerCase().match($(this).val().toLowerCase())) {
					matched_friends[matched_friends.length] = i;
				}
			} catch (e) {}
		}
	}
	
	if (matched_friends.length) {
		$('#results_admin').removeClass('hidden');
	} else {
		$('#results_admin').addClass('hidden');
	}
	$('#results_admin').html('');
	
	for (i in matched_friends) {
		var index = matched_friends[i];
		$('#results_admin').append('<li><a href="#" onclick="intro.select_admin(' + index + '); return false"><img src="' + location.protocol + '//graph.facebook.com/' + friends[index]['fb_id'] + '/picture?type=square" alt="" /> <span>' + friends[index]['name'].toLowerCase().replace($(this).val().toLowerCase(), '<strong>' + $(this).val() + '</strong>') + '</span></a>');
	}
}

intro.select_admin = function (index) {
	var friends = intro.friends;
	
	$('#admin').val($('#admin').attr('title'));
	$('#results_admin').addClass('hidden');
	$('#selected_admins').append('<li id="admin-' + friends[index]['id'] + '" class="input"><a href="" onclick="intro.delete_admin(' + friends[index]['id'] + '); return false;"></a> <img src="https://graph.facebook.com/' + friends[index]['fb_id'] + '/picture?type=square" alt="" /> ' + friends[index]['name'] + '<input type="hidden" name="admins[' + index + ']" value="' + friends[index]['id'] + '" id="admin-input-' + friends[index]['id'] + '" /></li>');
}

intro.delete_admin = function (id) {
	$('#admin-' + id).remove();
	//$('#admin-input-' + index).remove();
	
	return false;
} 

intro.step1_click_option = function() {
	$(this).parents('.options:first').find('.option.active').removeClass('active');
	var input = $(this).parents('.options:first').attr('rel');
	$(this).addClass('active');
	$('input[name="' + input + '"]').val($(this).attr('data-role'));
	return false;
}

intro.edit_name = function() {
	$(this).parent().addClass('hidden');
	$(this).parent().next().removeClass('hidden');
	return false;
}

intro.change_fiance_search = function() {
	if($(this).hasClass('not-on-facebook')) {
		$(this).parent('.selection:first').find('#spouse').attr('title','Who is your fiancé?').val('Who is your fiancé?');
		$(this).html('On Facebook?')
		$(this).removeClass('not-on-facebook');
		$('#spouse').addClass("disabled");
		$('#results').addClass('hidden').html('');
		$("#spouse").attr('name','wedding[spouse][name]');
		$('#name2').removeAttr('name');
		$('input[name="_facebook"]').val('0');
		$('input[name="wedding[spouse][id]"]').val('');
	} else {
		$(this).parent('.selection:first').find('#spouse').attr('title','Search for your fiancé').val('Search for your fiancé');
		$(this).html('Not on Facebook?')
		$(this).removeClass('on-facebook');
		$(this).addClass('not-on-facebook');
		$('#spouse').removeClass("disabled");
		$('#name2').attr('name','wedding[spouse][name]');
		$('#spouse').removeAttr('name');
		$('input[name="_facebook"]').val('1');
	}

	return false;
}

$(document).ready(intro.init);