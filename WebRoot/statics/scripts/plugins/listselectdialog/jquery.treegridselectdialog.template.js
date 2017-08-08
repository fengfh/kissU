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
	var dialogInstance = null ;
	try{
		dialogInstance = window.parent.jQuery("iframe[name='"+window.name+"']").parents(".ui-dialog-wrapper:first").data("dialog");
	}catch(e){}
	
	if( $.json  ){
		args = $.json.decode($.json.encode(args)) ;
	}
	
	
	
	var params =  args.params  ;
	var layout =  params.layout ;
	
	if(params.dataServiceUrl){
		window.dataServiceUrl = params.dataServiceUrl ;
	}
	
	var key    = params.key ;
	var valueKey = key.value ;
	var labelKey = key.label ;
	
	var defaults   = params.defaults ;
	var gridConfig = params.grid   ;
	var treeConfig = params.tree   ;
	
	var ismulti = params.multi ;//是否多选

	$(function(){
		//初始化页面布局
		initLayout() ;
	
		if(treeConfig){
			initTree() ;
		}
		
		if(gridConfig){
			initGrid() ;
		}else{
			$(".search-panel").remove() ;
		}
		
		
		bindEvent() ;
		
	});
	
	function initGrid(){
		gridConfig.showTitle = false ;
		gridConfig.loadMsg = "数据加载中，请稍候......" ;
		gridConfig.indexColumnWidth = 50 ;
		
		gridConfig.ds = gridConfig.ds || gridConfig.datasource ;
		gridConfig.limit = gridConfig.limit || gridConfig.pagesize || 13 ;
		gridConfig.querys = gridConfig.querys || gridConfig.params||{} ;
		gridConfig.querys.__executeType = "query" ;
		
		var queryColumns = [] ;
		
		//addCheckbox column
		gridConfig.indexColumn = gridConfig.indexColumn == true ;
		
		if(!gridConfig.isAddColumn){
			var type = ismulti?"checkbox":"radio" ;
			
			var _proxyColumns = [] ;
			_proxyColumns.push({align:"center",key:valueKey,forzen:false,width:"30",
				format:{type:type,callback:function(record){
						var checked = $(this).attr("checked");
						if( ismulti ){
							if( checked){
								addSelectedItem(record) ;
							}else{
								removeSelectedItem(record) ;
							}
						}else{
							$(".selected-container ul").empty() ;
							if(checked){
								addSelectedItem( record ) ;
							}
						}
					}}}) ;
			
			$(gridConfig.columns).each(function(){
				_proxyColumns.push(this) ;
			}) ;
			
			gridConfig.columns = _proxyColumns ;
			gridConfig.isAddColumn = true ;
		}
		
		$(gridConfig.columns).each(function(index,column){
			if(column.query){
				queryColumns.push(column) ;
			}
		}) ;

		//build query form
		var hasQuery = false ;
		$(queryColumns).each(function(index,column){
			
			hasQuery = true ;
			var html = queryRender(column) ;
			var label = column.label ;
			$("#select-searchform").append(label+'：'+html) ;
		}) ;

		if( hasQuery ){
			$("#select-searchform").append('<button class="queryBtn btn">查询</button>') ;
			$("#select-searchform").append('<button type="reset" class="btn">重置</button>') ;
		}else{
			$(".search-panel").remove() ;
		}

		if(defaults){
			if( $.isArray( defaults ) ){
				$(defaults).each(function(index,record){
					addSelectedItem(record) ;
				}) ;
			}
		}
		
		setTimeout(function(){
			gridConfig.loadAfter = function(){
				$(".grid-checkbox").each(function(){
					var val = $(this).attr("value") ;
					if( $(".selected-item[val='"+val+"']").length ){
						$(this).attr("checked",true) ;
					}
				}) ;
			}
			
			$(".grid-container").width("100%");
			gridConfig.height = $(".grid-layout").height() - $(".search-panel").outerHeight(true) - 55 ;
			ie6Callback(function(){
				$(".grid-container").width("98%");
				gridConfig.height = $(".grid-layout").height() - $(".search-panel").outerHeight(true) - 65 ;
			}) ;
		
			$('.grid-container').llygrid(gridConfig) ;
				
		},100) ;
	}
	
	function queryRender(column){
		var key   = column.key ;
		var html = '' ;
		
		if(dialogInstance && typeof column.queryRender == 'string'){
			return dialogInstance.settings.opener[column.queryRender](column) ;
		}
		
		var qr = column.queryRender||{} ;
		var styleClass = qr.styleClass||"input-small" ;
		if( qr.type == 'select' ){
			var _ = ["<select name='"+key+"'  class='"+styleClass+"'>"] ;
			$(qr.json).each(function(){
				_.push("<option value='"+this.val+"'>"+this.label+"</option>")
			}) ;
			_.push("</select>") ;
			html =  _.join("") ;
		}else{
			 html = '<input class="'+styleClass+'"  name="'+key+'" type="text" value=""/>' ;
		}
		
		return html ;
	}
	
	function initTree(){
		treeConfig.method = treeConfig.method||'post' ;
		treeConfig.asyn   = typeof(treeConfig.asyn)=='undefined'?true:treeConfig.asyn ;
		treeConfig.rootId = treeConfig.rootId||'root' ;
	
		if( gridConfig ){//grid 选择
			treeConfig.onNodeClick = function(id, text, record,node){
		        	var gridKey = treeConfig.gridKey||'treeId' ;
		        	if(id == treeConfig.rootId){
		        		id = '' ;
		        	}
		        	var _params = {} ;
		        	_params[gridKey] = id ;
		        	$('.grid-container').llygrid("reload",_params) ;
		    }
		}else if( !ismulti ){//单选
			treeConfig.onNodeClick = function(id, text, record,node){
				if(id == treeConfig.rootId ) return ;
				$(".selected-container ul").empty() ;
		        addSelectedItem( record ) ;
		    }
		}else{//多选
			treeConfig.showCheck = true ;
			treeConfig.onChecked = function(id, text,checked, record){
				if(id == treeConfig.rootId ) return ;
				if( checked ){
					 addSelectedItem( record ) ;
				}else{
					 removeSelectedItem( record ) ;
				}
          	} ;
		}
		
		if( !gridConfig ){
			if(defaults){
				if( $.isArray( defaults ) ){
					$(defaults).each(function(index,record){
						addSelectedItem(record) ;
					}) ;
				}
			}
		}
		
		if(defaults){
			treeConfig.nodeFormat = function(data){//checkstate = 1 ;
				var dataId = data.id || data.ID ;
				$(defaults).each(function(index,record){
					var val = record[valueKey]||record["value"] ;
					if(dataId == val){
						data.checkstate = 1 ;
					}
				}) ;
				return data ;
			} ;
		}
		
		$('.tree-container').tree(treeConfig) ;
	}
	
	function initLayout(){
		//初始化高度
		var selectHeight = layout.selectHeight||120 ;
		$("#south").height(selectHeight);
		$(".selected-container").height(selectHeight-17);
		
		ie6Callback(function(){
			$(".selected-container").width("98%");
		}) ;
		
		if( !treeConfig ){
			 $(".tree-layout").remove() ;
		}

		if( !gridConfig ){
			 $(".tree-layout").remove() ;
			 $(".grid-layout").removeClass("grid-layout").addClass("tree-layout") ;
			 $(".grid-container").removeClass("grid-container").addClass("tree-container") ;
		}
		
		//title render
		if( treeConfig &&  treeConfig.title ){
			$(".tree-layout").attr("title",treeConfig.title ) ;
			if(!gridConfig){
				$(".tree-layout").attr("title","" ) ;
				$(".page-title h2").html(args.title||treeConfig.title) ;
			}
		}
	
		if( gridConfig &&  gridConfig.title ){
			var _title =  !treeConfig?"":gridConfig.title ;
			$(".grid-layout").attr("title",_title ) ;
			$(".page-title h2").html(args.title||gridConfig.title) ;
		}
		
		var height =$(window).height() - ( $(".panel-foot").outerHeight(true)+$(".page-title").outerHeight(true) ) - 10;
		$(".panel-content:first").css({height:height+"px",'max-height':height+"px"}) ;
	
		$(".ui-layout").layout();
		
	}
	
	function ie6Callback(callback){
		if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) { 
		 	callback && callback() ;
		}
	}
	
	function addSelectedItem(record){
		var val = record[valueKey]||record["value"] ;
		var lab = record[labelKey]||record["label"] ;
		$(".selected-container ul").find("[val='"+val+"']").remove() ;
		
		$(".selected-container ul").append("<li title='双击删除' class='selected-item alert alert-success' val='"+val+"'>"+lab+"</li>") ;
		//checkgrid
		$(".grid-checkbox[value='"+val+"']").attr("checked",true ) ;
	}
	function removeSelectedItem(record){
		var val = record[valueKey]||record["value"] ;
		$(".selected-container ul").find("[val='"+val+"']").remove() ;
	}
	
	function bindEvent(){
		$(".selected-item").live("dblclick",function(){
			var val = $(this).attr("val") ;
			
			
			if(gridConfig){
				$(".grid-checkbox[value='"+val+"']").attr("checked",false ) ;
			}else{
				$('.tree-container').tree().checkNode(val,false) ;
			}
			
			$(this).remove() ;
			
			
			return false ;
		});
	
		$(".queryBtn").live("click",function(){
			var querys = $("#select-searchform").toJson() ;
			$('.grid-container').llygrid("reload",querys) ;
			return false ;
		}) ;
	
		$(".clear-btn").click(function(){
			$(".selected-container ul").empty() ;
			$(".grid-checkbox").attr("checked",false) ;
			return false ;
		}) ;
	
		$(".close-btn").click(function(){
			jQuery.dialogReturnValue(null) ;	 
			$(".close-btn").dialogClose(); //如果是页面内部的窗口 用这个关闭窗口
			window.close(); //如果是window.open() 的用这个关闭窗口
			//return false ;
		}) ;
	
		$(".confirm-btn").click(function(){
			var vals = [] ;
			var labels = [] ;
			$(".selected-item").each(function(){
				vals.push($(this).attr("val")) ;
				labels.push($.trim($(this).text())) ;
			}) ;
	
			$(this).dialogReturnValue({value:vals,label:labels}) ;
			$(this).dialogClose() ;
			window.close();
			//return false ;
		}) ;
	}
})(jQuery) ;
