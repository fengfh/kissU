/*IE 6 fix*/	
$.browserFix.register("ie","6","base",function( target ){
	$('.row div[class^="span"]:last-child',target).addClass('last-child');
    $(':button[class="btn"], :reset[class="btn"], :submit[class="btn"], input[type="button"]',target).addClass('button-reset');
    $('input:checkbox,input:radio',target).addClass('input-checkbox');
    $('.pagination li:first-child a',target).addClass('pagination-first-child');

	//icon
	//$('[class^="icon-"],[class*=" icon-"]').addClass("class-icon") ;
    //$('[class^="icon-"], [class*=" icon-"]',target).addClass('icon-sprite');
})

/*index sideby*/
/*
$.browserFix.register("ie","9","index",function( target ){
			$("#sidebar>ul").addClass("rootmenu").find(">li>a").addClass("root") ;
			$("#sidebar>ul").find("ul").addClass("submenu") ;

			 $("#sidebar").height( $(window).height()- $(".header").height()-4) ;
			$("#settings").height( $(window).height()- $(".header").height()-4)  ;

			$(".collapsed #sidebar>ul>li").live("mouseover",function(){
					var h = $(this).height() ;
					$(this).addClass("hover");
					$(this).find(">a").addClass("collapsed_sidebar_hover_a")  ;
					$(this).find(">ul").addClass("collapsed_sidebar_hover_ul") .show().css("margin-top",h+"px") ;
					$(this).height(h).css("margin-bottom","-3px") ;
			}).live("mouseout",function(){
				    $(this).removeClass("hover");
					$(this).find(">a").removeClass("collapsed_sidebar_hover_a")  ;
					$(this).find(">ul").removeClass("collapsed_sidebar_hover_ul").hide().css("margin-top","0px") ;
					$(this).css("margin-bottom","0px") ;
			}) ;
			
			$(".content").css("padding-top", $(".header").height() ).height(  $(window).height()- $(".header").height()-4) ;

			$(".content").css("width", "100%");

			$("#sidebar").find("a[href]").click(function(){
				 $(".content").find("iframe").attr("src", $(this).attr("href")=='#'?"":$(this).attr("href")) ;
				 return false;
			}) ;
			$(".content").css("overflow-y", "auto");
} ) ;

$.browserFix.register("ie","9","layout",function( target ){
		 $('#settings .wrapper').hide();

		$('.row div[class^="span"]:last-child',target).addClass('last-child');
		$(".row-fluid > [class*='span']",target).addClass("row-fluid-span") ;
        $('.row-fluid > [class*="span"]:first-child',target).addClass("row-span-first") ;
} ) ;*/

$.browserFix.register("ie","6","bootstrap",function( target ){
				//layout
				$('.row div[class^="span"]:last-child').addClass('last-child');
				$(".row-fluid > [class*='span']").addClass("row-fluid-span") ;
				$('.row-fluid > [class*="span"]:first-child').addClass("row-span-first") ;
				//checkbox ,radio 在IE6下边框
				$("input[type='checkbox'],input[type='radio']").addClass("input-check");

				//pagination 第一项border-left为0
				$(".pagination li:first-child").addClass("pagination-first") ;
} ) ;
$.browserFix.register("ie",['6','7','8'],"bootstrap",function( target ){
		$(".table-striped tbody tr:even").addClass("table-striped-odd") ;
		//table-striped table隔行换色				
		$(".table-striped tbody tr").hover(function(){
				$(this).addClass("table-row-hover") ;
		},function(){
				$(this).removeClass("table-row-hover") ;
		}) ;
} ) ;

