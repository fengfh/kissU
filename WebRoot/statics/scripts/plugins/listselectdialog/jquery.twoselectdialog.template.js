/**
 * 列表选择控件
 * 作者: lixh@bingosoft.net
 * 功能：
 * 	TODO
 * 使用示例：
 *  TODO
 */
(function(){
	
	var args = jQuery.dialogAraguments() ;//dialogAraguments
	window.document.title = args.title ;
	
	if( $.json  ){
		args = $.json.decode($.json.encode(args)) ;
	}
	
	var params =  args.params  ;
	
	if(params.dataServiceUrl){
		window.dataServiceUrl = params.dataServiceUrl ;
	}
	
	var key    = params.key ;
	var valueKey = key.value||"value" ;
	var labelKey = key.label||"label" ;
	
	var defaults   = params.defaults ;
	

	$(function(){
		//初始化页面布局
		initLayout() ;
		initSelect() ;
		bindEvent() ;
	});
	
	function initSelect(){
		var hasQuery = false ;
		$(params.queryFields).each(function(index,column){
			hasQuery = true ;
			var label = column.label ;
			var key   = column.key ;
			$("#select-searchform").append(label+'：<input class="input-small" name="'+key+'" type="text" value=""/>') ;
		}) ;

		if( hasQuery ){
			$("#select-searchform").append('<button class="queryBtn btn">查询</button>') ;
			$("#select-searchform").append('<button type="reset" class="btn">重置</button>') ;
		}else{
			$(".search-panel").remove() ;
		}
		
		$.dataservice(params.CommandName,params.params ,function (response){
			response = response||[] ;
			
			$(defaults).each(function(index,record){
				var val = record[valueKey]||record['value']  ;
				var isExist = false ;
				$(response).each(function(i,r){
					if( this[valueKey] == val ){
						this.selected = true ;
						isExist = true ;
					}
				}) ;
				if( !isExist ){
					record.selected = true ;
					response.push(record) ;
				}
			}) ;
			
			$(response).each(function(){
				var value = this[valueKey] || this.value ;
				var label = this[labelKey] || this.label ;
				if(this.selected){
					$(".right-select").append("<option value='"+value+"'>"+label+"</option>") ;
				}else{
					$(".left-select").append("<option value='"+value+"'>"+label+"</option>") ;
				}
			}) ;
			
		},{async:false}) ;
	}
	
	
	function initLayout(){
		if( params.title ){
			$(".page-title h2").html(params.title ) ;
		}
		var height =$(window).height() - ( $(".panel-foot").outerHeight(true)+$(".page-title").outerHeight(true) ) - 10;

		$(".panel-content:first").css({height:height+"px",'max-height':height+"px"}) ;
		//$(".ui-layout").layout();
	}

	
	function bindEvent(){
		$(".right-select").bind("dblclick",function(){
			$(".left-select").append( $(".right-select option:selected") ) ;
		}) ;
		
		$(".left-select").bind("dblclick",function(){
			$(".right-select").append( $(".left-select option:selected") ) ;
		}) ;
		
		$(".toLeft").click(function(){
			$(".right-select").append( $(".left-select option:selected") ) ;
		}) ;
		
		$(".toRight").click(function(){
			$(".left-select").append( $(".right-select option:selected") ) ;
		}) ;
		
		$(".toLeftAll").click(function(){
			$(".right-select").append( $(".left-select option") ) ;
		}) ;
		
		$(".toRightAll").click(function(){
			$(".left-select").append( $(".right-select option") ) ;
		}) ;
		
		
		$(".queryBtn").live("click",function(){
			var querys = $("#select-searchform").toJson() ;
			
			var _params = $.extend({},params.params,querys) ;
			
			$.dataservice(params.CommandName,_params ,function (response){
				response = response||[] ;
				$(".left-select option").remove() ;
				$(response).each(function(){
					var value = this[valueKey] || this.value ;
					var label = this[labelKey] || this.label ;
					
					if( $(".right-select").find("option[value='"+value+"']").length ) return ;
					
					if(this.selected){
						$(".right-select").append("<option value='"+value+"'>"+label+"</option>") ;
					}else{
						$(".left-select").append("<option value='"+value+"'>"+label+"</option>") ;
					}
				}) ;
				
			},{async:false}) ;
			return false ;
		}) ;
	
		$(".close-btn").click(function(){
			jQuery.dialogReturnValue(null) ;
			$(this).dialogClose();
			return false ;
		}) ;
	
		$(".confirm-btn").click(function(){
			var vals = [] ;
			var labels = [] ;
			$(".right-select option").each(function(){
				if($(this).attr("value")){
					vals.push($(this).attr("value")) ;
					labels.push($.trim($(this).text())) ;
				}
			}) ;
	
			$(this).dialogReturnValue({value:vals,label:labels}) ;
			$(this).dialogClose() ;

			//return false ;
		}) ;
	}
})(jQuery) ;
