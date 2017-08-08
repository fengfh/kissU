Index.menu.hasTopMenu = false ;

$(function(){
	$("#topmenu_template").remove() ;
	$(".navbar").remove() ;
	$("#menucollapse").remove();
	 
	$("#sidebar").prepend('<div class="sidebar-head"><h3></h3></div>') ;
	$("#sidebar .sidebar-head h3").html($(".sidebar-title span").text()) ;
	
	$(".sidebar-title").remove() ;
	
	$("#header-toolbar .container-fluid:first").css({
		"position":"absolute",
		left:"0px",
		right:"0px",
		top:"0px"
	}) ;
	
	$("#header-toolbar .container-fluid:eq(1)").show() ;
	$("#sidebar .control").show();
})