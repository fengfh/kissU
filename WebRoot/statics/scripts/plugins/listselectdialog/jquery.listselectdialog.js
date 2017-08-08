/**
 * 列表选择控件
 * 作者: lixh@bingosoft.net
 * 功能：
 * 	TODO
 * 使用示例：
 *  TODO
 */
;(function($){
	$.listselectdialog = function(params , callback){
		var _p = $.extend({},params) ;
		
		callback = callback||function(){
			var args = jQuery.dialogReturnValue() ;
			if(args){
				var value = args.value ;
				var label = args.label ;
				if( _p.valueField && _p.labelField ){
					$(_p.valueField).val(value) ;
					$(_p.labelField).val(label) ;
				}
			}
		} ;
		
		//build default values defaults:[{value:'1',label:'广东省'},{value:'11',label:'广州市'}],
		if( _p.valueField && _p.labelField ){
			var val 	= $(_p.valueField).val() ;
			var label 	= $(_p.labelField).val() ;
			var vals = (val+"").split(",");
			var labels = (label+"").split(",");
			var defaults = [] ;
			$(vals).each(function(index,v){
				defaults.push({value:v,label:labels[index]}) ;
			}) ;
			_p.defaults = defaults ;
		}else if($.isFunction(_p.defaults)){
			_p.defaults = _p.defaults.call(this) ;
		}
		
		var defaultWidth = null ;
		var defaultHeight = null ;
		var defaultSelectHeight = null ;
		if(_p.grid || _p.tree ){
			if( params.tree && params.grid ){
				defaultWidth = 800 ;
				defaultHeight = 600 ;
			}else if(params.tree){
				defaultWidth = 500 ;
				defaultHeight = 500 ;
			}else{
				defaultWidth = 800 ;
				defaultHeight =  600 ;
			}
			templateName = "treegrid_template.html" ;
		}else{
			defaultWidth = 600 ;
			if( _p.queryFields ){
				defaultHeight = 450 ;
			}else{
				defaultHeight = 410 ;
			}
			templateName = "select_template.html" ;
		}
		
		defaultSelectHeight = params.multi?120:50 ;
		
		//格式化宽度高度
		params.layout = params.layout ||{} ;
		params.layout.height = params.layout.height || defaultHeight ;
		params.layout.width  = params.layout.width || defaultWidth ;
		params.layout.selectHeight = params.layout.selectHeight||defaultSelectHeight;
		
		_p.layout = params.layout ;
		
		var random = new Date().getTime() ;
		
		$.open(
			(Config.serverPath||Config.contextPath)+"/statics/scripts/plugins/listselectdialog/"+templateName+"?random="+random , 
			params.layout.width , 
			params.layout.height , 
			{
			 title:_p.title , 
			 params: _p,
			// isScroll:false,
			 titleStyle:_p.titleStyle||""} 
			, callback ) ;
			
	}
	$.fn.listselectdialog = function( params , callback ){
		$( this ).each(function(){
			$(this).unbind("click.listselect").bind("click.listselect",function(){
				$.listselectdialog( params , callback ) ;
			})
		});
	}
	
})(jQuery)