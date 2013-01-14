tagger = {};

tagger['char_limit'] = 6000;

tagger['allowed_elements'] = [
	'div',
	'p',
	'br',
	'b',
	'strong',
	'em',
	'i',
	'ul',
	'u',
	'a',
	'li'
];

tagger['block_elements'] = [
	'p',
	'ul'
];

tagger.init = function () {
	// Options
	tagger.use_tags();

	$('div.tagger_wrapper .tagger_nav span.count').html(tagger.char_limit - $('div.tagger_area').text().length);

	// Events
	$('.tagger_nav a').live('mousedown', tagger.nav_click);
	$('.tagger_nav a.link').live('click', tagger.create_link);
	$('.tagger_nav a.unlink').live('click', tagger.remove_link);
	$('.tagger_nav a.bold').live('click', tagger.bold);
	$('.tagger_nav a.italic').live('click', tagger.italic);
	$('.tagger_nav a.under').live('click', tagger.under);
	$('.tagger_nav a.list').live('click', tagger.list);
	$('.tagger_nav a.align-left').live('click', tagger.align_left);
	$('.tagger_nav a.align-center').live('click', tagger.align_center);
	$('.tagger_nav a.align-right').live('click', tagger.align_right);
	$('div.tagger_area').live('paste', tagger.paste);
	$('div.tagger_area').live('keydown', tagger.keydown);
	$('div.tagger_area').live('keyup', tagger.keyup);
	$('div.tagger_area').live('change keydown input cut', tagger.change);
	$('div.tagger_area').live('click.update_nav keyup.update_nav', tagger.update_nav);
	// $('div.tagger_area a:not(.ok)').live('click.preview_link', function() { tagger.preview_link(null, $(this)); return false; });
	$('div.wrapper .edit_box_preview  a.change').live('click', function() { tagger.update_link(null, $('a.ready')); return false; });
	$('div.wrapper a.close').live('click', tagger.cancel_link);
	$('div.wrapper a.remove_link').live('click', function() { tagger.remove_link(null, $('a.ready')); return false; });
	$('div.wrapper a.ok').live('click', tagger.save_link);
	
	var tagger_nav = $('div.tagger_wrapper .tagger_nav').offset().top;

	$(window).scroll(function(e) {

		var section = ($('.section.greeting').offset().top + $('.section.greeting').outerHeight()) - (2 * $('div.tagger_wrapper .tagger_nav').outerHeight());
		
		setTimeout(function(){
			if($(window).scrollTop() > tagger_nav) {
				$('.tagger_nav').addClass('tagger_nav-fixed');
				if($(window).scrollTop() >= section){
					$('#registry .tagger_nav').removeClass('tagger_nav-fixed');
				}
			} else {
				$('.tagger_nav').removeClass('tagger_nav-fixed');
			}
		}, 100);
	});

};

tagger.use_tags = function() {
	try {
		Editor.execCommand("styleWithCSS", false, false);
	} catch (e) {
		try {
			Editor.execCommand("useCSS", false, false);
		} catch (e) {
			try {
				Editor.execCommand('styleWithCSS', false, false);
			}
			catch (e) {
			}
		}
	}
}

tagger.push_to_end = function(el) {
	if(document.createRange) {
		range = document.createRange();//Create a range (a range is a like the selection but invisible)
		range.selectNodeContents(el);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		selection = window.getSelection();//get the selection object (allows you to change selection)
		selection.removeAllRanges();//remove any selections already made
		selection.addRange(range);//make the range you have just created the visible selection
	}
	else if(document.selection) { 
		range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
		range.moveToElementText(el);//Select the entire contents of the element with the range
		range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
		range.select();//Select the range (make it the visible selection
	}
}

tagger.nav_click = function() {
	if(!($(this).hasClass('link')) && !($(this).hasClass('unlink'))) {
		// Push the focus to the editor
		if(!($(document.activeElement).hasClass('tagger_area')) || !($(document.activeElement).is('[contenteditable]'))) {
				var area = $(this).parents('.tagger_wrapper:first').find('div.tagger_area');
				$(area).focus();
				tagger.push_to_end($(area)[0]);
		}

		// Activate nav button
		if($(this).hasClass('align')) {
			if(!($(this).hasClass('active'))) {
				$(this).addClass('active');
			}
		} else {
			$(this).toggleClass('active');
		}
	}
}

tagger.update_nav = function(e) {
	var target = $(e.target);
	var nav = $(this).parents('div.tagger_wrapper:first').find('.tagger_nav');

	if($(e.target).hasClass('tagger_area')) {
		var sel = rangy.getSelection();
		target = $(sel.anchorNode.parentElement);

		// Fix for new paragraphs with pre-assigned alignment
		if($(target).hasClass('tagger_area')) {
			if($(sel.anchorNode.firstElementChild).parent().length)
				target = $(sel.anchorNode.firstElementChild).parent();
		}
	}

	if($(target).find('> .tagger_area')) {
		var area = $(target).find('> .tagger_area:first');
	} else {
		var area = $(target).parents('.tagger_area:first')
	}

	if($(target).get(0).nodeName == 'A' || $(target).parents('a').length) {
		tagger.preview_link(null, $(target));
		$(nav).find('a.link').addClass('active');
	} else {
		tagger.cancel_link(null, { focus_after_link: false });
		tagger.cancel_link_preview(null, { focus_after_link: false });
		$(nav).find('a.link').removeClass('active');
	}

	if($(target).get(0).nodeName == 'B' || $(target).get(0).nodeName == 'STRONG' || $(target).parents('b,strong').length) {
		$(nav).find('a.bold').addClass('active');
	} else {
		$(nav).find('a.bold').removeClass('active');
	}

	if($(target).get(0).nodeName == 'I' || $(target).get(0).nodeName == 'EM' || $(target).parents('i,em').length) {
		$(nav).find('a.italic').addClass('active');
	} else {
		$(nav).find('a.italic').removeClass('active');
	}

	if($(target).get(0).nodeName == 'U' || $(target).parents('u').length) {
		$(nav).find('a.under').addClass('active');
	} else {
		$(nav).find('a.under').removeClass('active');
	}

	if($(target).get(0).nodeName == 'UL' || $(target).parents('UL').length) {
		$(nav).find('a.list').addClass('active');
	} else {
		$(nav).find('a.list').removeClass('active');
	}

	if($(target).get(0).nodeName == 'LI' || $(target).parents('LI').length) {
		$(nav).find('a.list').addClass('active');
	} else {
		$(nav).find('a.list').removeClass('active');
	}

	if(($(target).parentsUntil('.wrapper').filter('.align-center,.align-right').length) || $(target).is('.align-center') || $(target).is('.align-right')) {
		$(nav).find('a.align.align-left').removeClass('active');
	} else {
		$(nav).find('a.align.align-left').addClass('active');
	}

	if($(target).hasClass('align-center') || $(target).parentsUntil('.wrapper').filter('.align-center').length) {
		$(nav).find('a.align.align-center').addClass('active');
	} else {
		$(nav).find('a.align.align-center').removeClass('active');
	}
	
	if($(target).hasClass('align-right') || $(target).parentsUntil('.wrapper').filter('.align-right').length) {
		$(nav).find('a.align.align-right').addClass('active');
	} else {
		$(nav).find('a.align.align-right').removeClass('active');
	}
}

tagger.paste = function(e) {
	var contents = $(this).html();

	var _paste = e.originalEvent.clipboardData.getData('text/html');

	// Check length
	var _paste_text = e.originalEvent.clipboardData.getData('text/plain');

	if(!tagger.limit(e, $(this), _paste_text.length))
		return false;

	if(_paste === '')
		return null;

	// Strip meta tag
	_paste = _paste.replace(/^<meta charset=\'utf-8\'>/i, "");

	// Strip style tags
	_paste = _paste.replace(/style="([^"]*)"/ig, "");

	// P tag cleanup
	_paste = _paste.replace(/<p >/ig, "<p>");

	// Comment cleanup
	_paste = _paste.replace('<!--StartFragment-->','').replace('<!--EndFragment-->','');

	// Strip disallowed tags
	var temporary = $('<div></div>');
	$(temporary).html(_paste);

	temporary.find('*').not(tagger.allowed_elements.join(",")).each(function() {
		if($(this).html() == '') {
			temporary.html(temporary.html().replace($(this).outerHTML(), ''));
		} else {
			$(this).replaceWith($(this).html());
		}
	 });

	document.execCommand('insertHTML', false, temporary.html());

	$(this).trigger('change');

	return false;
}

tagger.keyup = function(e) {
	if(!tagger.limit(e, $(this)))
		return false;
}

tagger.keydown = function(e) {
	return tagger.limit(e, $(this), null);
}

tagger.limit = function(e, el, additional) {
	if(typeof additional === "undefnied" || additional === null || additional === undefined)
		additional = 0;

	var count = tagger.char_limit - ($(el).text().length + additional);

	if(count >= 0)
		$('span.count', $(el).parents('.tagger_wrapper:first')).html(count);

	if (e.which != 8 && e.which != 46 && count <= 0) {
		return false;
	}

	return true;
}

tagger.change = function() {
	var el = $(this);

	window.setTimeout(function() {
		var output = $(el).clone();
		var html = output.html();
		var nodeName = '';

		/*
		 * Cleanup..
		 * Remove markers
		 * Strip disallowed tags
		 * Add first paragraph tag
		 * Remove empty paragraphs
		 * Add p tags for any children that are missing p tags
		 * Replace style tags with tags
		 * Add target blank to links
		 */
		output.find('.tagger_focus_node').remove();
		output.find('.rangySelectionBoundary').remove();

		output.find('*').not(tagger.allowed_elements.join(",")).each(function() {
			if($(this).html() == '') {
				output.html(output.html().replace($(this).outerHTML(), ''));
			} else {
				$(this).replaceWith($(this).html());
			}
		 });

		if(!(html.match(/^\<(div|p)/i))) {
			if(!(html.match(/\<(div|p)/i))) {
				output.html('<p>' + html + '</p>');
			} else {
				var pos_of_first_p = html.regexIndexOf(/\<(div|p)/i);
				output.html('<p>' + html.substr(0, pos_of_first_p) + '</p>' + html.substr(pos_of_first_p));
			}
		}

		output.children().each(function() {
			nodeName = $(this).get(0).nodeName;
			if($(this).text() === '') {
				$(this).remove();
			} else {
				if(!($.inArray(nodeName.toLowerCase(),tagger.block_elements))) {
					if($(this).attr('class') !== undefined) {
						var class_str = ' class = "' + $(this).attr('class') + '"'
					} else {
						var class_str = '';
					}

					$(this).replaceWith('<p' + class_str + '>' + $(this).html() + '</p>');
				}
			}
		});
		
		output.children().each(function() {
			if($(this).text() === '') {
				$(this).remove();
			}
		});

		$(output).find("*[style*=\"font-style: italic\"]").each(function() {
			$(this).removeAttr('style');
			$(this).wrap('<i />');
		});

		$(output).find("*[style*=\"font-weight: bold\"]").each(function() {
			$(this).removeAttr('style');
			$(this).wrap('<b />');
		});

		$(output).find("*[style*=\"text-decoration: underline\"]").each(function() {
			$(this).removeAttr('style');
			$(this).wrap('<u />');
		});

		$(output).find("*[style*=\"text-align: left\"]").each(function() {
			$(this).removeAttr('style');
		});

		$(output).find("*[style*=\"text-align: center\"]").each(function() {
			$(this).removeAttr('style');
		});

		$(output).find("*[style*=\"text-align: right\"]").each(function() {
			$(this).removeAttr('style');
		});

		$(output).find("*[style*=\"text-align: justify\"]").each(function() {
			$(this).removeAttr('style');
		});
		
		// External links
		$(el).find('a').attr('target', '_blank');
		output.find('a').attr('target', '_blank');

		// Save output to input
		$('input[name="' + $(el).attr('rel') + '"]').val(output.html());
	}, 10);
}

tagger.create_link = function(e) {
	// If it's already a link, show the change link popup
	var target = $(rangy.getSelection().anchorNode.parentElement);

	if($(target).get(0).nodeName == 'A') {
		tagger.update_link(e, $(target));
		return false;
	} else if ($(target).parents('a').length) {
		tagger.update_link(e, $(target).parents('a:first'));
		return false;
	}

	var selection = rangy.getSelection().getRangeAt(0);

	if(selection.startOffset != selection.endOffset) {
		// Create the link
		var d = new Date();
		var now = d.getTime();
		var href = '#empty-' + now;
		document.execCommand('createLink', false, href);
		
		// Update link attributes
		var link = $('.tagger_area a[href="' + href + '"]');
		$(link).addClass('ready');
		$(link).attr('href', 'http://');
		$(link).attr('target', '_blank');
		$(this).parents('.tagger_wrapper:first').find('div.tagger_area').trigger('change');

		// Insert focus node
		$(link).after('<span class="tagger_focus_node" style="display: none; line-height: 1">&nbsp;</span>');
		
		// Append the edit box
		var title = $(link).text();
		var url = $(link).attr('href');
		var parent = $('div.wrapper');
		$('span.holder').remove();

		var pos = tagger.position($(link));

		var box = '<div class="edit_box" data-new-link="true">' +
		'<a href="#" class="close"></a>' +
		'<label>Title</label>' +
		'<input type="text" class="title" value="' + title + '"/>' +
		'<label>Link Destination</label>' +
		'<input type="text" class="url" value="' + url + '"/>' +
		'<a class="ok" href="#">OK</a>' +
		'</div>';

		$(parent).append(box);

		$('div.edit_box').css({'left': pos.left, 'top': pos.top, 'margin': '-215px 0px 0px -162px'});
	}
	return false;
}


tagger.remove_link = function(e, link) {
	if(typeof link === "undefined") {
		var target = $(rangy.getSelection().anchorNode.parentElement);
	} else {
		var target = $(link);
	}

	var current_selection = rangy.saveSelection();

	if($(target).get(0).nodeName == 'A') {
		$(target).replaceWith($(target).html());
	} else if ($(target).parents('a').length) {
		$(target).html($(target).html().replace(/<a([^"]*)">/i, '').replace(/<\/a>/i, ''));
	} else {
		return false;
	}

	rangy.restoreSelection(current_selection);
	$('div.edit_box_preview').remove();
	return false;
}

tagger.update_link = function(e, link) {
	tagger.cancel_link_preview();
	
	if(($('div.edit_box').size()) <= 0 ) {
		// Insert focus node
		$(link).after('<span class="tagger_focus_node" style="display: none; line-height: 1">&nbsp;</span>');

		$(link).addClass('ready');

		var title = $(link).text();
		var url = $(link).attr('href');
		var parent = $('div.wrapper');
		var pos = tagger.position($(link), false);

		var box = '<div class="edit_box" data-new-link="false">' +
			'<a href="#" class="close"></a>' +
			'<label>Title</label>' +
			'<input type="text" class="title" value="' + title + '"/>' +
			'<label>Link Destination</label>' +
			'<input type="text" class="url" value="' + url + '"/>' +
			'<a class="ok" href="#">OK</a>' +
			'</div>';
		
		$('div.wrapper').append(box);

		$('div.edit_box').css({'left': pos.left, 'top': pos.top, 'margin': '-215px 0px 0px -162px'});
	}

	return false;
}

/*
 * Find the position of an element in the tagger area
 * Will always use the first letter of the element
 * So if it is a link that spans two lines, 
 * the link will return the position of the first letter
 */
tagger.position = function(el, restore_selection) {
	var area = $(el).parents('.tagger_area:first');
	var wrapper = $(area).parents('.wrapper:first')

	$(el).addClass('currently-checking-position');
	
	var cloned = $($(area).outerHTML());

	$(cloned).addClass('clone').css({
		opacity: 0,
		left: ($(area).offset().left - $(wrapper).offset().left),
		top: '6px',
		position: 'absolute',
		'margin-left': 0,
		'margin-right': 0
	});
	
	$(area).after(cloned);
	
	var cloned = $(area).next();
	
	var clone_el = $(cloned).find('.currently-checking-position');

	$(el).removeClass('currently-checking-position');

	// If it's two lines, get the position of the div if it was just one character
	var current_html = $(clone_el).html();
	var current_height = $(clone_el).height();

	$(clone_el).html($(clone_el).text().substr(0,1));
	var one_char_height = $(clone_el).height();

	if(current_height == one_char_height) {
		$(clone_el).html(current_html);
	}
	
	var parent_offset = $(wrapper).offset();
	var clone_el_offset = $(clone_el).offset();

	var relative_offset = { 'top': (clone_el_offset.top - parent_offset.top), 'left': (clone_el_offset.left - parent_offset.left) };
	
	var pos = relative_offset;

	$('.tagger_area.clone').remove();
	
	return pos;
}

tagger.preview_link = function(e, link) {
	if($('div.edit_box_preview').length <= 0 && $('div.edit_box').length <= 0) {
	
		$(link).addClass('ready');
		
		var pos = tagger.position($(link));
				
		var title = $(link).text();
		var url = $(link).attr('href');
		var parent = $('div.wrapper');
		
		if((url.length) >= 20){
			var url = url.replace(/http(s)?:\/\//i, "");
			var start = url.slice(0, 10);
			var end = url.slice(-7);
			var urlconcat = start + '...' + end;
		}else{
			var urlconcat = url;
		}
		var box = '<div class="edit_box_preview">' +
		'<p>Got to:</p>' +
		'<a class="go" href="' + $(link).attr('href') + '" target="_blank">'+ urlconcat + '</a>' +
		'<a class="change" href="#">- Change Link</a>' +
		'<a class="remove_link" href="#">- Remove Link</a>' +
		'<a class="close" href="#"></a>' +
		'</div>';

		$('div.wrapper').append(box);

		$('div.edit_box_preview').css({'left': pos.left, 'top': pos.top, 'margin': '20px 0px 0px -78px'});
	}

	return false;
}

tagger.update_preview_link_position = function(e, link) {
	if($(link).length > 0 && $('div.edit_box_preview').length > 0) {
		var pos = tagger.position($(link));

		$('div.edit_box_preview').css({'left': pos.left, 'top': pos.top, 'margin': '20px 0px 0px -78px'});
	}

	return false;
}

tagger.bold = function() {
	document.execCommand('bold', false, "");
	return false;
}

tagger.italic = function() {
	document.execCommand('italic', false, "");
	return false;
}

tagger.under = function() {
	document.execCommand('underline', false, "");
	return false;
}

tagger.list = function() {
	document.execCommand('insertunorderedlist', false, "");
	return false;
}

tagger.align_left = function() {
	var area = $(this).parents('.tagger_wrapper:first').find('div.tagger_area:first');

	$(this).parent().find('a:not(.align-left)').removeClass('active');
	document.execCommand('justifyleft', false, "");
	
	var element = $(area).find('*[style="text-align: left;"]');
	element.removeAttr('class').addClass('align-left').removeAttr('style');

	tagger.update_preview_link_position(null, $(area).find('a.ready'));
	return false;
}

tagger.align_center = function() {
	var area = $(this).parents('.tagger_wrapper:first').find('div.tagger_area:first');

	$(this).parent().find('a:not(.align-center)').removeClass('active');
	document.execCommand('justifyfull', false, "");

	var element = $(area).find('*[style="text-align: justify;"]');
	element.removeAttr('class').addClass('align-center').removeAttr('style');
	
	tagger.update_preview_link_position(null, $(area).find('a.ready'));
	
	return false;
}

tagger.align_right = function() {
	var area = $(this).parents('.tagger_wrapper:first').find('div.tagger_area:first');

	$(this).parent().find('a:not(.align-right)').removeClass('active');
	document.execCommand('justifyright', false, "");
	
	var element = $(area).find('*[style="text-align: right;"]');
	element.removeAttr('class').addClass('align-right').removeAttr('style');

	tagger.update_preview_link_position(null, $(area).find('a.ready'));

	return false;
}

tagger.focused = function(node) {
	if(rangy.getSelection().anchorNode === null)
		return false;

	return Boolean($(rangy.getSelection().anchorNode.parentElement).parents(node).length);
}

tagger.cancel_link = function(e, opts) {
	if($('div.edit_box').length) {
		if($('div.edit_box').data('new-link')) {
			tagger.remove_link(null, $('a.ready'));
			$('div.edit_box').remove();
		} else {
			$('div.edit_box').remove();

			if((typeof opts === "undefined" || typeof opts['focus_after_link'] === "undefined") || opts['focus_after_link'] === true) {
				if(!tagger.focused($('.tagger_area'))) {
					tagger.focus();
				} else {
					$('.tagger_focus_node').remove();
				}
			}
		}
	}
	
	$('a.ready').removeClass('ready');

	$('div.edit_box_preview').remove();

	return false;
}

tagger.cancel_link_preview = function(e, opts) {
	if($('div.edit_box_preview').length) {
		$('div.edit_box_preview').remove();
	}
	
	$('a.ready').removeClass('ready');

	return false;
}

tagger.focus = function(node, remove) {
	var default_node = false;

	if(typeof node === "undefined") {
		default_node = true;
		node = $('.tagger_focus_node');
	}

	rangy.getSelection().collapse($(node).get(0));

	if(default_node || (typeof remove !== "undefined" && remove)) {
		$(node).remove();
	}
}

tagger.save_link = function() {
	var link = $('a.ready');

	$(link).attr('href', $('input.url').attr('value'));

	$('a.ready').filter(function() {
		if($(this).text() === $('input.title').attr('value')) {
			return false;
		} else {
			return true;
		}
	}).text($('input.title').attr('value'));

	$(this).parents('.wrapper:first').find('div.tagger_area').trigger('change');

	if(!tagger.focused($('.tagger_area'))) {
		// Insert focus node
		$(link).after('<span class="tagger_focus_node" style="display: none; line-height: 1">&nbsp;</span>');
	}

	$('div.edit_box').remove();
	$('a.ready').removeClass('ready');

	if(!tagger.focused($('.tagger_area'))) {
		tagger.focus();
	} else {
		$('.tagger_focus_node').remove();
	}

	return false;
}


$(document).ready(function() {
	if($('div.tagger_wrapper').length){
		tagger.init();
	}
});
