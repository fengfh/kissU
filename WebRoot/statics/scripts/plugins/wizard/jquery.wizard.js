/**
 * 向导控件用户应用脚本
 */
;(function($){
	$.fn.wizard = function( params , callback ){
		$(this).each(function(){
			$(this).click(function(){
				$.wizard(params,callback) ;
			}) ;
		}) ;
	} ;
	
	$.wizard = function(params,callback){
		var width  = params.width||800  ;
		var height = params.height||600  ;
		var random = new Date().getTime() ;
		$.open(
			(Config.serverPath||Config.contextPath)+"/statics/scripts/plugins/wizard/wizard.template.html?random="+random , 
			width , 
			height , 
			{title:"" , params: params,iframe:true} 
			, callback ) ;
	}
})(jQuery) ;