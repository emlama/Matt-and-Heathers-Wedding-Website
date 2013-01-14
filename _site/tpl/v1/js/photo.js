var photo = {};

photo.field = false;
photo.alias = false;
photo.filename = false;
photo.parent = false;
photo.legacy = true;
photo.facebook = false;

photo.crop = {};
photo.crop.alias = false;
photo.crop.legacy = true;
photo.crop.file = false;
photo.crop.field = false;
photo.crop.loading = false;
photo.crop.width = 0;
photo.crop.height = 0;
photo.crop.x = 0;
photo.crop.y = 0;
photo.crop.legacy = true;
photo.crop.scaled_width = 0;
photo.crop.scaled_height = 0;
photo.crop.w = 150;
photo.crop.h = 150;
photo.crop_api = false;
photo.require_crop = false;
photo.args = false;

photo.multiple = false;
photo.selected_photos = [];

photo.init = function () {
	$('a[rel~=photo]').live('click', photo.show_menu);
	$(window).mousedown(photo.close_menu);
}

/*
 * Pull in facebook photos if data-facebook-uid is set
 */
photo.load_default_photos = function() {
	FB.getLoginStatus(function(response) {
		if (response.authResponse) {
			$('a[rel~=photo]').each(function() {
				var item = $(this);

				if($(item).attr('data-facebook-uid') && ($(item).attr('data-filename') == '' || ($(item).attr('data-filename').match(/graph\.facebook/)))) {
					if($(item).prev('img').length) {
						$(item).prev('img').attr('src', "http://graph.facebook.com/" + $(item).attr('data-facebook-uid') + "/picture?type=large");
					} else {
						$(item).find('> span').css('background-image', 'url(\'' + "http://graph.facebook.com/" + $(item).attr('data-facebook-uid') + "/picture?type=large" + '\')');
					}
					
					$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT src_big FROM photo WHERE pid IN (SELECT cover_pid FROM album WHERE owner = ' + $(item).attr('data-facebook-uid') + ' AND type = \'profile\')'),
						function(data) {
							if(data.length && data[0]['src_big'] != undefined) {
								$(item).attr('data-filename',data[0]['src_big']);
								$(item).attr('data-is-facebook', '1');
							}
						});
				}
			});
		}
	});
}

photo.show_menu = function (object) {
	var photo_menu = $('#photo_menu');
	
	if (!photo_menu.length) {
		var rel = $(this).attr('rel');
		var filename = rel.match(/([a-z0-9]+\.[a-z]+)/);

		var _data_filename = $(this).attr('data-filename');
		var _data_is_facebook = $(this).attr('data-is-facebook');
		var _data_args = $(this).attr('data-args');

		if(_data_filename != undefined) {
			if(_data_filename) {
				filename = _data_filename;
				photo.filename = _data_filename;
			} else {
				filename = '';
				photo.filename = '';
			}
		} else if (filename) {
			photo.filename = filename[1];
		}

		if(_data_is_facebook) {
			photo.facebook = '1';
		} else {
			photo.facebook = '';
		}

		if(_data_filename != undefined) {
			photo.legacy = false;
		} else {
			photo.legacy = true;
		}

		var parent_id = $(this).parent().attr('id');

		if(typeof parent_id !== "undefined" && parent_id) {
			photo.parent = parent_id;
		}

		photo.alias = $(this).attr('data-alias');
		
		photo.field = rel.match(/photo([0-9])/)[1];
		photo.multiple = rel.match('multiple') ? true : false;
		
		if (rel.match('require_crop')) {
			photo.require_crop = true;
			var args = '?require_crop=1';
			if(rel.match('only_upload')) {
				args += '&only_upload=1';
			}
		} else {
			var args = '';
			if(rel.match('only_upload')) {
				args += '?only_upload=1'
			}
		}

		if(photo.alias != undefined) {
			args += '&alias=' + photo.alias;
		}

		if(photo.filename != '') {
			args += '&filename=' + encodeURIComponent(photo.filename);
		}

		if(_data_args != undefined) {
			args += _data_args;
			photo.args = _data_args;
		}

		var filename_for_menu = '';
		if(photo.filename && photo.filename.match(/http(s)?\:\/\//)) {
			filename_for_menu = photo.filename;
		} else {
			filename_for_menu = s3_prefix + '/l/' + photo.filename;
		}
		
		var html_string = '<ul id="photo_menu">';
		if (filename && !rel.match('no_crop') && !rel.match('only_upload')) {
			html_string += '<li><a href="#" onclick="photo.start_crop(' + photo.field + ', \'' + filename_for_menu + '\', \'' + photo.facebook + '\'); return false;" class="crop">View full size / crop photo</a></li>';
		}
		
		if(!rel.match('only_upload')) {
			html_string += '<li><a href="#" onclick="photo.fb_import(true); return false;" class="import">Choose a photo from Facebook</a></li>';
		}

		html_string += '<li>' +
				'<a href="#" onclick="return false;" class="upload">Upload your own photo</a>' +
				'<iframe src="' + root + '/upload/' + photo.field + args + '"></iframe>' +
			'</li>' +
		'</ul>'
		
		var photo_menu = $(html_string);

		/*if(rel.match('straight_to_upload')) {
			$(photo_menu).addClass('hidden');
		}*/
		
		$(document.body).append(photo_menu);
	}
	
	var offset = $(this).offset();
	photo_menu.css('top', (offset.top - $(photo_menu).height() - 5) + 'px');

	if(photo.field == '5') {
		photo_menu.css('left', (offset.left - 56) + 'px');
	} else if (photo.field == '1' || photo.field == '2' || photo.field == '6') {
		photo_menu.css('left', (offset.left - (($("#photo_menu").width()-$(this).width())/2)) + 'px');
	} else {
		photo_menu.css('left', (offset.left - 142) + 'px');

	}
	
	return false;
}

photo.close_menu = function (e) {
	var photo_menu = $('#photo_menu');
	
	if (photo_menu.length) {
		var close_menu = false;
		var offset = photo_menu.offset();
		
		if (e.pageX <= offset.left) // Left of menu
			close_menu = true;
		
		if (e.pageX >= offset.left +  photo_menu.width()) // Right of menu
			close_menu = true;
		
		if (e.pageY < offset.top) // Top of menu
			close_menu = true;
		
		if (e.pageY >= offset.top + photo_menu.height()) // Bottom of menu
			close_menu = true;
		
		if (close_menu) {
			photo_menu.remove();
			$('a.avatar').removeClass('active');
			return true;
		} else {
			return false;
		}
	}
}

photo.set_error = function(field, message) {
	field = parseInt(field);

	if(field === 3) {
		$('.main #main-error').html(message);
		$('#photo_menu .upload').html('Upload your own photo').removeClass('uploading').removeClass('freeze');
	} else if(field == 5) {
		$('#photo_menu .upload').html('Upload your own photo').removeClass('uploading').removeClass('freeze');
		$("#"+photo.parent).find('.error').html(message);
	}
}

photo.upload_handler = function (field, file, require_crop, photo_id) {
	$('#photo_menu .upload').html('Upload your own photo').removeClass('uploading').removeClass('freeze');
	$('.main #main-error').html('');
	
	if (require_crop) {
		photo.start_crop(field, file);
	} else {
		if (field == '3') {
			$('.photo img').attr('src', s3_prefix + '/s/' + file);
		} else if (field == '5') {
			$('.photo img').removeClass('disabled').attr('src', s3_prefix + '/s/' + file);
		} else if (field == '4') {
			var li = $('.list ul').prepend('<li><input type="hidden" name="delete_photo[' + photo_id + ']" /><a href="#" rel="' + photo_id + '" class="delete"></a><span><img src="' + s3_prefix + '/s/' + file + '" alt="" /></span></li>');
		}
	}
}

photo.start_crop = function (field, file, fb) {
	var crop_box = $('#crop_box');
	
	if (!file.match(/^http/)) {
		file = s3_prefix + '/l/' + file ;
	}

	photo.crop.legacy = photo.legacy;
	photo.crop.alias = photo.alias;
	photo.crop.file = file;
	photo.crop.field = field;

	if(typeof fb !== "undefined" && (fb != false && fb != '')) {
		photo.crop.facebook = true;
	}

	var crop_box = $(
		'<div id="crop_box" class="loading">' +
			'<a href="#" class="cancel"></a>' +
			'<a href="#" class="save"></a>' +
			'<p>Crop your image to a square</p>' +
			'<div class="overlay"><span></span> Cropping...</div>' +
			'<div class="container"><img src="' + file + '" id="crop_img" onload="photo.start_crop_handler(this);" /></div>' +
		'</div'
	);
	
	$('.cancel', crop_box).click(photo.destroy_crop);
	$('.save', crop_box).click(photo.save_crop);
	
	$(document.body).append(crop_box);
	
	return false;
}

photo.start_crop_handler = function (image) {
	if (photo.crop.loading) {
		return false;
	} else {
		photo.crop.loading = true;
	}

	photo.crop.width = image.naturalWidth;
	photo.crop.height = image.naturalHeight;

	photo.crop.scaled_width = $("#crop_img").width();
	photo.crop.scaled_height = $("#crop_img").height();

	$("#crop_box").removeClass('loading');
	
	var boundx, boundy;

	$("#crop_box").css("marginLeft","-"+Math.ceil($("#crop_img").width()/2)+"px");
	$("#crop_box").css("marginTop","-"+Math.ceil($("#crop_img").height()/4)+"px");
	
	$('#crop_img').Jcrop({
		aspectRatio: 1,
		setSelect: [150, 150, 0, 0],
		onSelect: update_coords,
		minSize: [150, 150]
	}, function () {
		var bounds = this.getBounds();
		boundx = bounds[0];
		boundy = bounds[1];
		
		photo.crop_api = this;
	});
	
	function update_coords (c) {
		photo.crop.x = c.x;
		photo.crop.y = c.y;
		photo.crop.w = c.w;
		photo.crop.h = c.h;
	}
	
	return false;
}

photo.destroy_crop = function () {
	// Destroy Crop API Instance
	try {
		photo.crop_api.destroy();
	} catch(err) {

	}

	// Unset vars
	photo.crop.legacy = true;
	photo.crop.file = false;
	photo.crop.field = false;
	photo.crop.loading = false;
	photo.crop.alias = false;
	photo.crop.x = 0;
	photo.crop.y = 0;
	photo.crop.w = 150;
	photo.crop.h = 150;
	photo.crop_api = false;
	photo.crop.facebook = false;
	photo.args = false;
	
	$('#crop_box').remove();
	
	return false;
}

photo.save_crop = function () {
	$('#crop_box').addClass('cropping');
	$('#crop_box').css('marginTop',parseInt($('#crop_box').css('marginTop'))+59+"px");
	photo.crop_api.release();
	photo.crop_api.disable();

	var url  = root + '/crop';

	if(photo.crop.field == 6)
		url += "/6";

	if(photo.crop.field == 1 || photo.crop.field == 2)
		url += "/" + photo.crop.field;

	if(photo.args)
		url += "/?" + photo.args.replace(/^\&/,'');
	
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: url,
		data: photo.crop,
		success: photo.save_crop_handler
	});
	
	return false;
}

photo.save_crop_handler = function (data) {
	if (data.success) {
		photo.destroy_crop();
		photo.destroy_import();

		var field = photo.field;

		// Aliasing
		if($('body').is("#profile") || $('body').is("#page-profile")) {
			field = 6;
		}

		if (field == '1' || field == '2') {
			var element = $('a[data-alias="'+photo.alias+'"]');
			$(element).removeClass('default').removeClass('empty');
			$(element).attr('data-filename', data.image + '?' + Date.now());
			$(element).removeAttr('data-is-facebook');
			photo.crop.facebook = false;
			$('span', element).first().css('background-image', 'url(\'' + s3_prefix + '/c/' + data.image + '?' + Date.now() + '\')');
		} else if (field == '3') {
			var element = $('a[rel~=photo' + field + ']');
			$('.photo img').attr('src', s3_prefix + '/c/' + data.image + '?' + Date.now());
			element.attr('rel', element.attr('rel').replace(/([a-z0-9]+\.[a-z]+)/, data.image));
		} else if(field == '5') {
			var element = $("#"+photo.parent).find('a[rel~=photo' + field + ']');
			$("#"+photo.parent).find('.photo img').removeClass('disabled');
			$("#"+photo.parent).find('.photo img').attr('src', s3_prefix + '/c/' + data.image + '?' + Date.now());
			element.attr('rel', element.attr('rel').replace(/([a-z0-9]+\.[a-z]+)/, data.image));
			$("#"+photo.parent).find("#"+photo.parent+"_id").val(data.photo_id);
			$("#"+photo.parent).find('.photo .delete').removeClass('hidden');
		} else if(field == '6') {
			var element = $('a[data-alias="'+photo.alias+'"]');
			$(element).removeClass('default').removeClass('empty');
			$(element).attr('data-filename', data.image + '?' + Date.now());
			$(element).removeAttr('data-is-facebook');
			photo.crop.facebook = false;
			$(element).prev('img').attr('src', s3_prefix + '/c/' + data.image + '?' + Date.now());
		}
	}
};

// Facebook import
photo.fb_import = function (require_crop) {
	var import_box = $('#import_box');
	
	if (!import_box.length) {
		var import_box = $(
			'<div id="import_box" class="loading">' +
				'<div class="top">' +
					'<p>Select photos to import from Facebook</p>' +
					'<span><em class="photo_count">0</em> selected</span>' +
				'</div>' +
				'<div class="center"><div class="wrap">' +
					'<div class="left">' +
						'<p>Select an album:</p>' +
						'<div class="you"><div>' +
							'<a href="#" onclick="photo.load_album(0); return false;"></a>' +
							'<p>Photos of You <em class="count"></em></p>' +
						'</div></div>' +
						'<ul class="albums"></ul>' +
					'</div>' +
					'<div class="right">' +
						'<ul class="photos"></ul>' +
					'</div>' +
				'</div><div class="overlay"><span></span> Loading...</div></div>' +
				'<div class="bottom">' +
					'<a href="#" class="cancel">Cancel</a>' +
					'<a href="#" class="save"></a>' +
					'<span class="status">Importing...</span>' +
				'</div>' +
			'</div>'
		);
		
		$('.cancel', import_box).click(photo.destroy_import);
		$('.save', import_box).click(photo.save_import);
		
		$(document.body).append(import_box);

		$('#import_box .wrap').bind('scroll', photo.scroll_box);
	}
	
	import_box.css('left', (Math.ceil($(window).width() / 2) - Math.ceil(import_box.width() / 2)) + 'px');
	
	photo.populate_albums();
}

photo.destroy_import = function () {
	$('#import_box').remove();
	photo.selected_photos = [];
	
	return false;
}

photo.save_import = function () {
	$('#import_box .status').css('display', 'block');
	
	$.ajax({
		type: 'POST',
		dataType: 'json',
		url: root + '/import',
		data: {'field': photo.field, 'photos': photo.selected_photos},
		success: photo.save_import_handler
	});
	
	return false;
}

photo.save_import_handler = function (data) {
	$('#import_box .status').css('display', 'none');
	
	if (data.field == '3') {
		if(data.success == false || data.success === 'false') {
			photo.set_error('3',data.message);
		} else {
			$('.main #main-error').html('');
			$('#main_pic').attr('src', s3_prefix + '/s/' + data['photos'][0].file);
		}
	} else if (data.field == '4') {
		for (i = 0; i < data['photos'].length; i++) {
			var li = $('.list ul').prepend('<li><input type="hidden" name="delete_photo[' + data['photos'][i].id + ']" /><a href="#" rel="' + data['photos'][i].id + '" class="delete"></a><span><img src="' + s3_prefix + '/s/' + data['photos'][i].file + '" alt="" /></span></li>');
		}
	}
	
	photo.destroy_import();
}

photo.populate_albums = function () {
	// Photos of You
	photo.load_album(0);
	
	// All albums
	$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT aid, cover_pid, owner, name, photo_count, modified FROM album WHERE owner = ' + fb_id + ' ORDER BY modified DESC'),
		function(data) {
			for (i = 0; i < data.length; i++) {
				$('#import_box .albums').append(
					'<li id="aid-' + data[i].aid + '">' +
						'<a href="#" onclick="photo.load_album(\'' + data[i].aid + '\'); return false"></a>' +
						'<div>' + data[i].name + '</div>' +
						'<p>' + data[i].photo_count + ' photos</p>' +
					'</li>'
				);
				
				$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT pid, aid, src_small FROM photo WHERE pid = \'' + data[i].cover_pid + '\''),
					function(data) {
						$('a', $('#aid-' + data[0].aid)).html('<span style="background-image: url(\'' + data[0].src_small + '\');"></span>');
						$('a', $('#aid-' + data[0].aid));
					}
				);
			}
		}
	);
}

photo.load_album = function (aid,appending,offset,limit) {
	$('#import_box').attr('data-current-album', aid);

	if(typeof appending === "undefined")
		var appending = false;

	if(typeof offset === "undefined") {
		offset = 0;
	} else {
		offset = parseInt(offset);
	}

	if(typeof limit === "undefined") {
		limit = 18;
	} else {
		limit = parseInt(limit);
	}

	if(!appending) {
		$('#import_box').attr('data-offset', 0);
		$('#import_box').removeAttr('all-photos-loaded');
		$('#import_box .photos').html('');
		$('#import_box .wrap').scrollTop(0);
	} else {
		$('#import_box').addClass('appending');
	}

	var load = true;
	
	if (aid == '0') {
		// Photos of You
		$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT pid FROM photo_tag WHERE subject = ' + fb_id),
			function(data) {
				$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT src_big FROM photo WHERE pid IN (SELECT pid FROM photo_tag WHERE subject = ' + fb_id + ') LIMIT '+offset+','+limit+''),
					function(data) {
						if(data.length && data[0] !== undefined && data[0].src_big !== undefined)
							$('#import_box .you a').html('<span style="background-image: url(\'' + data[0].src_big + '\');"></span>');

						if($('#import_box').attr('data-offset') === undefined) {
							$('#import_box').attr('data-offset', data.length);
						} else {				
							$('#import_box').attr('data-offset', parseInt($('#import_box').attr('data-offset'))+data.length);
						}

						if(typeof data === undefined || !data || data.length == 0) {
							$('#import_box').attr('all-photos-loaded','true');
							$('#import_box').removeClass('appending');
							load = false;
						}

						if(load) {
							for (i = 0; i < data.length; i++) {
									var selected = $.inArray(data[i].src_big, photo.selected_photos) >= 0 ? 'selected' : '';
									$('#import_box .photos').append(
										'<li>' +
											'<a href="#" onclick="photo.select_photo(\'' + data[i].src_big + '\', this, true); return false;" class="' + selected + '"><span style="background-image: url(\'' + data[i].src_big + '\');"></span></a>' +
										'</li>'
									);

									if(i == data.length-1) {
										$('#import_box').removeClass('appending');

										window.setTimeout(
											function() {
												$('#import_box').addClass('loaded');
												$('#import_box').removeClass('loading');
											}, 350
										);
									}
							}

							$('#import_box .count').html('(' + i + ')');
						}
		
					}
				);
			}
		);
	} else {
		$.get(root + '/facebook/fql/' + encodeURIComponent('SELECT pid, src_big FROM photo WHERE aid = \'' + aid + '\''),
			function(data) {
				if($('#import_box').attr('data-offset') === undefined) {
					$('#import_box').attr('data-offset', data.length);
				} else {				
					$('#import_box').attr('data-offset', parseInt($('#import_box').attr('data-offset'))+data.length);
				}

				if(typeof data === undefined || !data || data.length == 0) {
					$('#import_box').attr('all-photos-loaded','true');
					$('#import_box').removeClass('appending');
					load = false;
				}

				if(load) {
					for (i = 0; i < data.length; i++) {
						var selected = $.inArray(data[i].src_big, photo.selected_photos) >= 0 ? 'selected' : '';
						$('#import_box .photos').append(
							'<li>' +
								'<a href="#" onclick="photo.select_photo(\'' + data[i].src_big + '\', this, true); return false;" class="' + selected + '"><span style="background-image: url(\'' + data[i].src_big + '\');"></span></a>' +
							'</li>'
						);

						if(i == data.length-1) {
							$('#import_box').removeClass('appending');

							window.setTimeout(
								function() {
									$('#import_box').addClass('loaded');
									$('#import_box').removeClass('loading');
								}, 350
							);
						}
					}
				}
			}
		);
	}
}

photo.scroll_box = function(e) {
	if(!($("#import_box").hasClass('appending')) && $('#import_box').attr('all-photos-loaded') == undefined) {
		// one step away from the end
		if($("#import_box .wrap").scrollTop()+455 >= $("#import_box .right").height()-$("#import_box .wrap").height()) {
			photo.load_album(parseInt($('#import_box').attr('data-current-album')), true, $('#import_box').attr('data-offset'));
		}
	}
}

photo.select_photo = function (url, link, fb) {
	if (photo.multiple) {
		// Add to list of photos
		var index = $.inArray(url, photo.selected_photos);
		if (index < 0) {
			var count = photo.selected_photos.length;
			photo.selected_photos[count] = url;
			$('#import_box .photo_count').html(count + 1);
			$(link).addClass('selected');
		} else {
			photo.selected_photos = $.grep(photo.selected_photos, function(value, index2) {
				return index2 != index;
			});
			
			$('#import_box .photo_count').html(photo.selected_photos.length);
			$(link).removeClass('selected');
		}
	} else if (photo.require_crop) {
		photo.start_crop(photo.field, url, fb);
	} else {
		photo.selected_photos = [];
		photo.selected_photos[0] = url;
		$('#import_box .photo_count').html('1');
		
		$('#import_box .selected').removeClass('selected');
		$(link).addClass('selected');
	}
}

photo.populate_photos = function () {
}

photo.return_false = function () {
	return false;
}

$(document).ready(photo.init);