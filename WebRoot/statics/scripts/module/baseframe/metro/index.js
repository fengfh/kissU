$.pageLoad.register("before",function(){
		var shortcut = $(".header-menu .pull-right").html() ;
		
		$("<div class='user-info'></div>")
		.appendTo($(".header-menu .pull-right").empty()) 
		.append(shortcut)
		.append($(".navbar .user-info").html()) ;
		$(".navbar .user-info").remove();
		
		$(".user-info").find(".btn-shortcut img").css({width:"18px",height:"18px"});
		$(".user-info").find(".btn-shortcut").css({width:"20px",height:"20px","margin-top":"2px"})
});

Index.menu.menuWidthCallback = function(){
	var left = parseInt( $(".navbar").css("left").replace("px","") ) ;
	return $(window).width() - left - $(".user-info").outerWidth(true) - ( $(".navbar").outerWidth(true) -  $(".navbar").width()) ;
}