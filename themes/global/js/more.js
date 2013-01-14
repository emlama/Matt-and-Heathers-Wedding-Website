$(document).ready(function(){
	var num = 25;
	$(parent_element).find(child_element).slice(num).addClass("hidden");
	 if ($(parent_element).find(child_element+'.hidden').length == 0) {
			$("a.more").addClass("hidden");
		 };
	$("a.more").bind("click", function(){
		var cursor = $(parent_element).find(child_element+".hidden").first().index();
		$(parent_element).find(child_element).slice(cursor, cursor+25).removeClass("hidden");
		 if ($(parent_element).find(child_element+'.hidden').length == 0) {
			 $("a.more").addClass("hidden");
		 };
		 return false;
	});
});
  