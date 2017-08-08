/**
 *! Copyright (c) 2012 lxh13@126.com
 *
 * Version 1.0.0
 * 
 * 采用jQueryui css作为grid的主题（http://jqueryui.com/themeroller/）
 * 兼容主流浏览器：IE6+ ，firefox，chrome
 * 主要功能：支持冻结列
 * 			支持复合表头
 * 			支持点击表头排序
 * 			支持列宽调整
 * 			支持纯前端数据
 * 			支持单元格显示自定义
 * 			支持数据源自定义扩展
 * 
 */
(function($){
	function createTemplate(target,options){
		var html = [] ;
		html.push('<div class="lly-grid ui-widget ui-widget-content ui-corner-all">');
		html.push('	<div class="lly-grid-caption ui-widget-header ui-corner-top ui-helper-clearfix"><span></span></div>');
		html.push('	<div class="lly-grid-content">');

		if(options.forzenColumn.length>0){
			html.push('<div class="lly-grid-1 ui-widget-content">');
			
			//1 head start
			html.push('<div class="lly-grid-head lly-grid-1-head ui-state-default">');
			html.push("<div>")
			html.push('<table cellspacing=0 cellpadding=0 class="table table-bordered  table-striped table-condensed"><thead></thead></table>');
			html.push("</div>");
			html.push("</div>");
			//1head end
			
			//1body start
			html.push('<div class="lly-grid-body lly-grid-1-body"   style="height:'+options.height+'px">');
			html.push("<div class='lly-grid-scroll-y' >")
			html.push('<table cellspacing=0 cellpadding=0 class="table table-bordered  table-striped table-condensed"><tbody></tbody></table>');
			html.push("</div>");
			html.push("</div>");
			//1body end
			html.push('</div>');
		}
		
		html.push('<div class="lly-grid-2 ui-widget-content">');
		
		//2head start
		html.push('<div class="lly-grid-head lly-grid-2-head  ui-state-default ui-widget-content">');
		html.push("<div  class='lly-grid-scroll-x'>")
		html.push('<table cellspacing=0 cellpadding=0 class="table table-bordered  table-striped table-condensed"><thead></thead></table>');
		html.push("</div>")
		html.push("</div>") ;
		//2head end
		
		//2body start
		html.push('<div class="lly-grid-body lly-grid-2-body"  style="height:'+options.height+'px">');
		html.push('<table cellspacing=0 cellpadding=0 class="table table-bordered  table-striped table-condensed"><tbody></tbody></table>');
		html.push("</div>");
		//2body end
		
		html.push('</div>');
		html.push('<div style="clear:both"></div>');
		html.push('</div>');
		html.push('<div class="lly-grid-pager ui-state-default ui-corner-bottom"></div>');
		html.push('<div class="lly-grid-mask ui-widget-overlay"></div><div class="lly-grid-mask-msg  ui-state-default ui-state-active"></div>');
		html.push('</div>');
		target.append(html.join(""));
	}
	
	function createHead(target,options){
		var width = 0 ;
		
		if(options.forzenColumn.length>0){
			createHeadRow("lly-grid-1-head") ;
			createHeadCell(options.forzenColumn,"lly-grid-1-head") ;
			$(".lly-grid-1-head table",target).width( width  );
			$(".lly-grid-1-head",target).width( $(".lly-grid-1-head table",target).outerWidth(true)  );
			$(".lly-grid-1-body",target).width( $(".lly-grid-1-head table",target).outerWidth(true)  );
			$(".lly-grid-1-body > table",target).width( width ) ;
		}

		createHeadRow("lly-grid-2-head") ;
		createHeadCell(options.bodyColumn,"lly-grid-2-head") ;
		
		width = width + (options.bodyColumn.length)  ;
		$(".lly-grid-2-head table",target).width( width  );
		$(".lly-grid-2-body > table",target).width( width ) ;
		
		setTimeout(function(){
			adjustWidth(target) ;
		},0) ;
		
		function createHeadRow(container){
			$("<tr idx='_colwidth_' class='ui-widget-content' style='height:0px;'></tr>").appendTo( $("."+container+" table thead",target) ) ;
			for(var i =0 ;i<options.headRowNum ;i++){
				$("<tr idx='"+i+"' class='ui-widget-content'></tr>").appendTo( $("."+container+" table thead",target) ) ;
			}
		}
		
		function createHeadCell(columns,container){
			var groupCols = options.groupCols ;
		
			$(columns).each(function(index,col){
				var rowspan = options.headRowNum ;
				var sort = this.sort?"lly-sort-col":"" ;
				var styles = ['width:'+this.width+'px'] ;
				
				$("<th class='lly-grid-head-column' _width='"+this.width+"' style='"+styles.join("")+";height:0px;border-bottom:none;border-top:none;'></th>")
								.appendTo( $("."+container+" table thead tr[idx='_colwidth_']",target)) ;
				
				if( this.group ){
					var gs = this.group.split("|");
					rowspan = rowspan - gs.length ;
					for(var i = gs.length ;i>0 ;i--){//1,2
						var g = gs[i-1] ;
						
						var colspan = groupCols[g].length ;
						if( !$(".lly-grid-2-head table thead th[group='"+g+"']",target)[0]  ){
							$("<th class='lly-grid-head-column' colSpan='"+colspan+"' group='"+g+"'>"+g+"</th>")
								.appendTo( $("."+container+" table thead tr[idx='"+(gs.length-i)+"']",target)) ;
						}
					}
				}
				
				var sort = this.sort?"lly-sort-col":"" ;
				var rowSpanHtml = rowspan>1?"rowspan='"+rowspan+"'":"" ;
				$("<th "+rowSpanHtml+" key='"+this.key+"' colIndex='"+index+"'  class='lly-grid-head-column' style='border-bottom:0px;'>" +
						"<div class='"+sort+" cell-div'>"+headCellRender(col)+ 
						"</div> </th>").appendTo( $("."+container+" table thead tr[idx='"+(options.headRowNum - rowspan  )+"']",target)) ;

				width += parseInt(this.width) ;
			}) ;
		}
		
		function headCellRender(col){
			var format = col.format ;
			var _val = "" ;
			var _ = null ;
			if(format&&(_ = format.type )&&(_ = $.llygrid.format[_] ) && _.head ){
				_val = _.head(col) ;
			}else{
				_val = col.label ;
			}
			return _val||"&nbsp;" ;
		}
	}
	
	function adjustWidth(target){
			forzenWidth = $(".lly-grid-1-head",target).outerWidth(true);
			
			$(".lly-grid-content",target).width( $(".lly-grid",target).width() ) ;

			if( forzenWidth == $(".lly-grid-content",target).width()){
				setTimeout(function(){ adjustWidth(target) },100) ;
			}else{
				$(".lly-grid-content .lly-grid-2",target).width( $(".lly-grid-content",target).width() - forzenWidth )  ;
			}
			
			//height
			$(".lly-grid-2-body table tr",target).each(function(index){
				var h2 = $(this).outerHeight() ;
				var h1 = $(".lly-grid-1-body table tr:eq("+index+")",target).outerHeight() ;
				if(h2 > h1){
					$(".lly-grid-1-body table tr:eq("+index+")",target).height(h2) ;
				}else{
					$(this).height(h1) ;
				}
			}) ;
			
			$(".lly-grid-1-body tr").each(function(){
				$(this).find("td:last").addClass("lly-grid-fix-border") ;
			}) ;
			
			$(".lly-grid-1-head tr").each(function(){
				$(this).find("th:last").addClass("lly-grid-fix-border") ;
			}) ;
			
			//同步列宽
			$(".lly-grid-1-head tr:first th",target).each(function(index){
				
				var width = $.browser.msie? $(this).width():$(this).outerWidth() ;
				var width =  $(this).attr("_width")   ;
				$(".lly-grid-1-body table tr td:eq("+index+")",target).width( width ) ;
			}) ;
			
			$(".lly-grid-2-head tr:first th",target).each(function(index){
				var width = $.browser.msie? $(this).width():$(this).outerWidth() ;
				var width =  $(this).attr("_width")   ;
				$(".lly-grid-2-body table tr td:eq("+index+")",target).width( width ) ;
			}) ;
	}
	
	function createBody(target,records,p){
		var options = target.data("options") ;
		var columns = options.columns ;
		
		if(options.forzenColumn.length>0){
			$(".lly-grid-1-body table tbody",target).empty() ;
			$(records).each(function(index,record){
				var html = [] ;
				html.push("<tr class='ui-widget-content'>");
				$(options.forzenColumn).each(function(cindex,col){
					var val = col.key == '__index__'?(p.start+index+1):record[col.key] ;
					var clz = col.key == '__index__'?"lg-index-column ":"";
					
					var styles = ['width:'+col.width+'px'] ;
					colPropRender(this,styles) ;
					
					html.push("<td key='"+col.key+"' style='"+styles.join(";")+"' class='"+clz+" lly-grid-body-column '><div class='cell-div'>"+cellRender(val,record,col)+"</div></td>") ;	
				});
				html.push("</tr>");
				var row = $(html.join("")).appendTo($(".lly-grid-1-body table tbody",target)).data("record",record) ;
				if(options.rowClick){
					row.bind("click",function(){
						var _record = $(this).data("record") ;
						options.rowClick(_record) ;
					})
				}
				
				if(options.rowDblClick){
					row.bind("dblclick",function(){
						var _record = $(this).data("record") ;
						options.rowDblClick(_record) ;
					})
				}
			}) ;
			
		}
		
		$(".lly-grid-2-body table tbody",target).empty();
		$(records).each(function(index,record){
			html = [] ;
			var record = this ;
			html.push("<tr class='ui-widget-content'>");
			$(options.bodyColumn).each(function(index,col){
				var width = (".lly-grid-2-head table thead th:first:eq("+index+")",target).attr("_width")||col.width ;
			
				var styles = ['width:'+width+'px'] ;
				colPropRender(col,styles) ;
				html.push("<td key='"+col.key+"'  style='"+styles.join(";")+"' class='lly-grid-body-column'><div class='cell-div'>"+cellRender(record[col.key],record,col)+"</div></td>") ;
			});
			html.push("</tr>");
			var row = $(html.join("")).appendTo($(".lly-grid-2-body table tbody",target)).data("record",record) ;
			if(options.rowClick){
				row.bind("click",function(){
					var _record = $(this).data("record") ;
					options.rowClick(_record) ;
				})
			}
			if(options.rowDblClick){
				row.bind("dblclick",function(){
					var _record = $(this).data("record") ;
					options.rowDblClick(_record) ;
				})
			};
		}) ;
		//$(".lly-grid-2-body table tbody",target).html(html.join("")) ;
		
		$(".lly-grid-1-body table tr:even,.lly-grid-2-body table tr:even",target).addClass("lly-grid-row lly-grid-even") ;
		$(".lly-grid-1-body table tr:odd,.lly-grid-2-body table tr:odd",target).addClass("lly-grid-row lly-grid-odd") ;
		
		$(".lly-grid-body table tr",target).hover(function(){
			getRow(target,this).find("td").addClass("ui-state-hover") ;
		},function(){
			getRow(target,this).find("td").removeClass("ui-state-hover") ;
		}) ;
		
		function cellRender(val , record , col){
			var format = col.format ;
			var _val = "" ;
			if(format){
				if($.isFunction(format)){
					_val = format(val , record,col) ;
				}else if(format.type){
					var _ = $.llygrid.format[format.type] ;
					if( _ && _.body ){
						_val = _.body(val,record,col ) ;
					}else _val = val ;
				}else _val = val ;
			}else{
				_val = val ;
			}
			var title = (_val+"").replace(/<[^>]*>/g, "") ;
			var html = ["<span title='"+title+"'>"] ;// title='"+_val+"'
			html.push(_val||"&nbsp;") ;
			html.push("</span>")
			return html.join("") ;
		}
		
		function colPropRender(col,styles,clz){
			if(col.align){
				styles.push("text-align:"+col.align) ;
			}
		}
		
		adjustWidth(target) ;
	}
	
	function loadMask(target , isShow){
		if(!isShow) {
			$('.lly-grid-mask',target).hide();
			$('.lly-grid-mask-msg').hide() ;
			return ;
		}
		
		$('.lly-grid-mask',target).css({
			border:"none",top:"0px",bottom:"0px",right:"0px",left:"0px"
		}).show() ;
		$('.lly-grid-mask-msg',target).html(target.data("options").loadMsg).css({
					left:(target.find(".lly-grid").width()-$('.lly-grid-mask-msg',target).outerWidth())/2,
					top:(target.find(".lly-grid").height()-$('.lly-grid-mask-msg',target).outerHeight())/2
		}).show();
		
	}
	
	function formatColumns(target,options){
		var forzenColumn = [] ,bodyColumn = [] ,width = target.width() , totalWidth = 0 ;
		
		if( options.indexColumn){
			forzenColumn.push({align:"center",key:"__index__",width:options.indexColumnWidth||"25"}) ;
		}

		var headRowNum = 1 ;
		var groupCols = {} ;
		$(options.columns).each(function(index,col){
			col.width = col.width || (((1/options.columns.length)*100)+"%")
			if( (col.width+"").indexOf("%")!=-1){
				col.width =( width - 25) * parseInt( col.width.replace("%",""))/100 ;
			}
			totalWidth += parseInt(col.width) ;
			if( col.group ){
				headRowNum = Math.max( headRowNum , 1+(this.group.split("|").length) ) ;
				$(this.group.split("|")).each(function(){
					groupCols[this] = groupCols[this]||[]
					groupCols[this].push(col) ;
				})
			}
		}) ;
		options.groupCols = groupCols ;
		options.headRowNum = headRowNum ;
		if( options.indexColumn ){
			totalWidth += 25*totalWidth/(width - 25 ) ;
		}
		
		$(options.columns).each(function(index){
			for(var o in $.llygrid.format){//format
				if( this[o] && !this.format){
					this.format = {type:o,content:this[o]} ;
				}
			}
			options.autoWidth&&(this.width = parseInt( this.width/(totalWidth+options.columns.length )*width -1 ) ) ;

			this.forzen?forzenColumn.push(this):bodyColumn.push(this) ;
		}) ;
		options.forzenColumn = forzenColumn ;
		options.bodyColumn = bodyColumn ;
	}
	
	function getRow(target,el){
		var index = el.rowIndex ;
		return $(".lly-grid-1-body table tr:eq("+index+"),.lly-grid-2-body table tr:eq("+index+")",target) ;
	}
	
	function setResize(target){
		var lineMove = false;
 		var currTh = null;
 		var isMove = false ;
		$(".lly-grid-content",target).append("<div class='split' style=\"width:0px;border-left:1px solid blue; position:absolute;display:none\" ></div> ");
		
		var left = $(".lly-grid",target).offset().left - 5;
		
		$(".lly-grid .lly-grid-2",target).mousemove(function(event){
			if( lineMove == true ){
				isMove = true ;
				resizeBefore() ;
				$(".split",target).css({ "left": event.clientX -left , "top": "0px"}).show();
			}
		}).mouseup(function(event){
			resizeAfter();
			if (lineMove == true && isMove == true) {
   	             resizeHandler(event) ;
   	         }
		}).mouseleave(function(event){
			resizeAfter();
			$(".split",target).hide();
   	        lineMove = false;
		}) ;
		
		$(".lly-grid .lly-grid-2-head",target).find("th").mousemove( function(event) {
   	         var th = $(this);
   	         var left = th.offset().left;
   	         if ( (th.width() - (event.clientX - left)) < 8) {
   	         	resizeBefore() ;
   	        	var height = th.parents(".lly-grid-content").height();
   	            th.css({ 'cursor': 'e-resize' });
   	         }else {
   	         	if( lineMove ){
   	         		isMove = true ;
   	         		resizeBefore();
   	         		var height = th.parents(".lly-grid-content").height();
   	        		$(".split",target).css({ "left": event.clientX - left, "height": height, "top": "0px"}).show();
   	         	}else{
   	         		$(".split",target).hide();
   	            	th.css({ 'cursor': 'default' });
   	         	}
   	         }
   	     }).mousedown(function(event) {
   	     	resizeBefore();
   	         var th = $(this);
   	         var pos = th.offset();
   	         if ( th.css("cursor") == 'e-resize' ) {
   	             var height = th.parents(".lly-grid-content").height();
   	             $(".split",target).css({ "height": height, "top": "0px","left":event .clientX - left,"display":"" });
   	             lineMove = true;
   	             currTh = th ;
   	         }
   	     }).mouseup(function(event) {
   	     	 resizeAfter() ;
   	         if (lineMove == true && isMove == true) {
   	             resizeHandler(event) ;
   	         }
   	     }).mouseleave(function(event){
			resizeAfter();
			if(lineMove == false){
				$(".split",target).hide();
			}
		}) ; ;
   	     
   	    function resizeHandler(event){
   	    	$(".split",target).hide();
             lineMove = false;
             var pos = currTh.offset();

             //同步宽度
             var tWidth = currTh.parents("table").width() -currTh.width()  ;
             var ctWidth = event.clientX - pos.left ;
             
             var colIndex = currTh.attr("colIndex");
             var resizeTh = currTh.parents("table").find("tr:first th:eq("+colIndex+")") ;
             resizeTh.width(ctWidth) ;
             resizeTh.attr("_width",ctWidth) ;
             
             currTh.parents("table").width( tWidth + ctWidth ) ;
             
             var bodytable = currTh.parents("table").parent().parent().next().find("table") ;
             bodytable.width( tWidth + ctWidth ) ;
             $("tr",bodytable).find("td:eq("+colIndex+")").width(ctWidth) ;
             
             adjustWidth(target) ;
   	    }
   	     
   	    function resizeBefore(){
			$(document).bind("selectstart",function(){return false;});
		}
		
		function resizeAfter(){
			$(document).unbind("selectstart");
		}
	 }
	 
	 //绑定事件到列表
	function addEvent(target ,eventName,func){
		var events = target.data("events") ;
		events[eventName] = func ;
		target.data("events",events)
	}
	
	function load(target , p){
		var options = target.data("options") ;
		var records = null ;
		var totalRecord = 0 ;
		var start = parseInt(p.limit)*( parseInt(p.curPage) - 1) ;
		var end = parseInt(start) + parseInt(p.limit) ;
		
		//构造参数
		p = $.extend({},p,{start:start,end:end,limit:p.limit}) ;
		
		//alert( $.json.encode(p)+"  "+p.limit );
		
		var ds = options.ds ;
		if( !ds && options.CommandName ){
			ds = {type:"dataservice"} ;
		}
		
		//数据加载 ds:
		var cacheDs = target.data("cacheDs") ;
		loadMask(target,true) ;
		/*if(cacheDs){
			records = cacheDs.records.slice( p.start - cacheDs.p.start ,(p.start - cacheDs.p.start)+ parseInt(p.limit)  ) ;
			if( records.length < p.limit ){
				cacheDs = null ;//重新请求数据
			}else{
				renderPage(records , cacheDs.totalRecord , p) ;
				return ;
			}
		}*/
		var handle = $.llygrid.dsHandle[ ds.type ] ;
		
		handle( ds , p , options , function(records , totalRecord){
			/*if( !cacheDs ){
				target.data("cacheDs" , { records:records , totalRecord:totalRecord , p:p} ) ;
			}*/
			renderPage(records , totalRecord , p) ;
			bindEvent(target) ;
		} ) ;
		
		function renderPage(records , totalRecord , p){
			var options = target.data("options") ;
			var _ = records.slice(0,p.limit) ;
			createBody(target,_ , p) ;
			$(".lly-grid-pager",target).llypager({
				totalRecord:totalRecord,
				curPage:p.curPage,
				pageSizes:options.pageSizes,
				limit:p.limit,
				selectPage:function(curPage , limit ){
					reload(target,{curPage:curPage,limit:limit },true) ;
				}
			}) ;
			renderAfter() ;
			$(".lly-grid-2-body",target).scroll() ;
			setTimeout(function(){loadMask(target,false)},200) ;
		}
		
		function renderAfter(){
			$(options.columns).each(function(index,col){
				var _ = null ;
				if( col.format && col.format.type &&(_ = $.llygrid.format[col.format.type] )&& _.bindEvent ){
					_.bindEvent(col,target) ;
				}
			}) ;
			if(options.loadAfter){
				options.loadAfter() ;
			}
		}
	}
	
	function bindEvent(target){
		$(".lly-grid-2-body",target).scroll(function(){
			$(".lly-grid-1-body",target).scrollTop( $(".lly-grid-2-body",target).scrollTop() ) ;
			$(".lly-grid-2-head",target).scrollLeft( $(".lly-grid-2-body",target).scrollLeft() ) ;
		});
		
		$(".lly-sort-col",target).unbind("click.sort").bind('click.sort',function(){
			var span = $(this).find("span[sort]") ;
			var sort = "desc" ;
			if( span[0] ){
				sort = span.attr("sort")=="desc"?"asc":"desc" ;
				var clz = sort=="asc"?"ui-icon-triangle-1-n":"ui-icon-triangle-1-s" ;
				span.attr("sort",sort).removeClass("ui-icon-desc ui-icon-asc ui-icon-triangle-1-n ui-icon-triangle-1-s").addClass("ui-icon-"+sort+" "+clz);
			}else{
				$('<span sort="desc" class="lly-sort ui-icon-desc ui-icon ui-icon-triangle-1-s"></span>').appendTo($(this));
			}
			reload(target,{sortField:$(this).parent().attr("key"),sortType:sort},true) ;
			return false ;
		}) ;
		
		
		$(".lly-grid-body table tr",target).live('click', function(){
			$("div.lly-grid-content .ui-state-highlight",target).removeClass("ui-state-highlight") ;
			getRow(target,this).find("td").addClass("ui-state-highlight") ;
		} ) ;
	}
	
	function setTitle(target,option){
		var title = option.title ;
		if( !title || option.showTitle===false ){
			target.find(".lly-grid-caption").hide() ;
			target.find(".lly-grid-content").css("border-top-width","0px") ;
		}else
			title&&target.find(".lly-grid-caption span").html(title) ;
	}
	
	function reload(target , ps,isAdd){
		var qs = isAdd?target.data("rquerys"):target.data("querys") ;
		var p = $.extend({}, qs ,ps) ;
		target.data("rquerys",p) ;
		load(target,p) ;
	}
	
	//Grid 控件
	$.fn.llygrid = function(options,params){
		var me = $(this) ;
		if( typeof options == 'string' ){
			var opts = options ;
			options = me.data("options") ;
			var events = me.data("events") ;
			if(events[opts]){
				return events[opts](params) ;
			}
			
			//owner
			switch(opts){
				case "reload":
					params = params||{} ;
					params.curPage = 1 ;//重新定位到第一页
					reload($(this),params) ;
					break ;
				case "addEvent":
					addEvent(me,params.eventName , params.func ) ;
			}
			return ;
		}
		
		formatColumns(me,options) ;
		var querys = $.extend({},options.querys,options.params,{limit:options.limit,curPage:1}) ;
		options = $.extend({},$.llygrid.defaults,options) ;
		me.data("options",options)
		  .data("querys",querys)
		  .data("rquerys",querys)
		  .data("events",{});
		
		createTemplate(me , options) ;
		createHead(me, options) ;
		setTitle(me,options);
		
		setResize(me) ;
		var p = me.data("querys") ;
		p.start = 0 ;
		p.limit = options.limit ;
		load( me, p ) ;
		
		$(window).bind("resize" , function(){
			$.execResize("__gridResize",function(){
				adjustWidth(me);
			}) ;
		});
	}

	$.llygrid = {
		version:"1.0.0",
		defaults:{
			title: null,
			autoWidth:true,
			columns: null,
			loadMsg: 'Processing, please wait ...',
			pager: false,
			indexColumn: false,
			pageNumber: 1,
			limit: 10,
			pageSizes: null,
			querys: {},
			
			loadSuccess: function(){},
			loadError: function(){},
			rowClick: function( rowData){},
			rowDblClick: function(rowData){}
		},
		format:{
			"json":{
				body:function(val,record ,col){
					return col.format.content[val]||val  ;
				}
			},
			"checkbox":{
				head:function(col){
					return "<input type='checkbox' value='_' target='cb_"+col.key+"' name='cb_"+col.key+"_head'>" ;
				},
				body:function(val,record,col){
					return "<input type='checkbox' class='grid-checkbox' value='"+val+"' name='cb_"+col.key+"'>" ;
				},
				bindEvent:function(col,grid){
					var callback = col.format.callback||function(){} ;
					
					grid.find("input[name='cb_"+col.key+"_head']").unbind("click").bind("click",function(){
						grid.find("input[name='cb_"+col.key+"']")
							.attr("checked",$(this).attr("checked")||false);
						var checked = $(this).attr("checked");
						
						grid.find("input[name='cb_"+col.key+"']").each(function(){
							var row = $(this).parents("tr:first").get(0) ;
							/*if( checked ){
								getRow(grid,row).find("td").addClass("ui-state-checked") ;
							}else{
								getRow(grid,row).find("td").removeClass("ui-state-checked ui-state-highlight") ;
							}*/
							callback.call(this,$(row).data("record")) ;
						});
					});
					
					grid.find("input[name='cb_"+col.key+"']").unbind("click").bind("click",function(event){
						var row = $(this).parents("tr:first").get(0) ;
						/*if( $(this).attr("checked") ){
							getRow(grid,row).find("td").addClass("ui-state-checked") ;
						}else{
							getRow(grid,row).find("td").removeClass("ui-state-checked ui-state-highlight") ;
						}*/
						callback.call(this,$(row).data("record")) ;
						event.stopPropagation();
					});
					
					grid.llygrid("addEvent" , {
						eventName:"getSelectedValue",
						func:function(key){
							var vals = [] ;
							grid.find(":input[name='cb_"+key+"'][checked]").each(function(){
								vals.push( $(this).val() ) ;
							}) ;
							return vals ;
						}
					}) ;
				}
			},"radio":{
				head:function(col){
					return "选择" ;
				},
				body:function(val,record,col){
					return "<input type='radio' class='grid-checkbox' value='"+val+"' name='cb_"+col.key+"'>" ;
				},
				bindEvent:function(col,grid){
					var callback = col.format.callback||function(){} ;
					grid.find("input[name='cb_"+col.key+"']").unbind("click").bind("click",function(event){
						grid.find(".ui-state-checked").removeClass("ui-state-checked ui-state-highlight") ;
						var row = $(this).parents("tr:first").get(0) ;
						if( $(this).attr("checked") ){
							getRow(grid,row).find("td").addClass("ui-state-checked") ;
						}else{
							getRow(grid,row).find("td").removeClass("ui-state-checked ui-state-highlight") ;
						}
						callback.call(this,$(row).data("record")) ;
						event.stopPropagation();
					});
				}
			},
			"href":{
				body:function(val,record,col){
					var href = col.format.href||col.format.content ;
					for(var o in record){
						href = href.replace("{"+o+"}",encodeURIComponent(record[o])) ;
					}
					var target = col.format.target||'_blank' ;
					return "<a href='"+href+"' target='"+target+"'>"+val+"</a>" ;
				}
			}
		},
		dsHandle:{
			data:function(ds , p , options , callback){
				if( !ds.records && !ds.content ){
					ds = {records:ds} ;
				}else
					ds.records = ds.records||ds.content ;
				
				if( typeof ds.records == 'string' ){
					ds.records = $.parseJSON( ds.records ) ;
				}
					
				var records = ds.records.slice(p.start,p.end) ;
				var totalRecord = ds.totalRecord||ds.records.length ;
				callback(records , totalRecord) ;
			},
			url:function(ds , p , options , callback){
				$.ajax({//{type:'dms',command:'ddd'}  ds.command
					type:"get",
					url:ds.url||ds.content,
					data:p,
					cache:false,
					dataType:"text",
					success:function(result,status,xhr){
						var _result = {} ;
						if(typeof result == 'string'){
							eval("_result = "+result ) ;
						}
						callback(_result.datas||_result.records , _result.totalRecord ) ;
					},
			        error: function(xhr, textStatus, errorThrown){
			        	//alert(2+" ");
			        }
				}); 
			},
			dataservice:function(ds , p , options , callback){
				p.pagesize = p.limit ;
				p.page = p.curPage - 1 ;
				$.dataservice(options.CommandName, p ,function (response){
					//totalCount resultSet
					var totalCount = response.totalCount ;
					var resultSet  = response.resultSet ;
					callback(resultSet , totalCount) ;
				}) ; 
			}
		}
	} ;
	
	$.fn.llypager = function(settings){//pageSizes,curPage,totalRecord,limit,selectPage
		var me = $(this) ;
		var _id = null;
		var ec = null;
		settings = settings||{} ;
		
		var pageSizes = settings.pageSizes||[ settings.limit ] ;
		var curPage   = settings.curPage||0;
		var totalRecord = settings.totalRecord||0 ;
		var limit    = settings.limit ;
		var totalPage = calcTotalPage(totalRecord , limit) ;
		var selectPage = settings.selectPage ;
		
		template() ;
		render()   ;
		event() ;
		
		function calcTotalPage(totalRecord , limit){
			return totalRecord % limit == 0? (totalRecord / limit): (Math.floor(totalRecord / limit) + 1);
		}
		
		function render(){
			me.find("._totalpage_").html(totalPage||0) ;
			me.find("._totalnumber_").html(totalRecord||0) ;
			me.find("._jumpinput_").val(curPage||0) ;
			
			me.find("._limitselect_").html("").change(function(){
				selectPageHandler(curPage ,$(this).val() ) ;
			}) ;
			$(pageSizes).each(function(){
				me.find("._limitselect_").append("<option value='"+this+"' "+(this==limit?"selected":"")+">"+this+"</option>") ;
			}) ;
			
			var split = 6;
			var jg = Math.floor(split / 2);
			var cp = curPage;
			var tp = totalPage;
			var start = cp - jg < 1 ? 1 : (cp - jg);
			var end = Number(start) + Number(split - 1) > tp? tp: (Number(start) + Number(split - 1));
			if (end - start < split && start > 0) {
				start = end - split + 1;
			}
			
			var html = [] ;
			for (var i = start; i <= end; i++) {
				if (i <= 0) continue;
				var active = (i==curPage)?"ui-state-active":"ui-state-default" ;
				html.push('<a href="#" class="_page_ _numpage_  '+active+' " pn="'+i+'"><span>'+i+'</span></a>');
			}
			
			me.find(".grid-navig").html(html.join("")) ;
		}
		
		function event(){
			me.find("[pn]").click(function(event){
				if( $(this).hasClass("ui-state-disabled") ) return false ;
				var pn = $(this).attr("pn");
				var to = pn ;
				switch(pn){
					case "pre"	: to = Math.max(curPage - 1,1) ;break ;
					case "next"	: to = Math.min(curPage + 1,totalPage) ; break ;
					case "last"	: to = totalPage ; break ;
					case "first": to = 1 ; break ;
					case "input": return ; break;
					default:
						if(pn.indexOf("target:")==0){
							pn = pn.split("target:")[1] ;
							to = me.find(pn).val() ;
						}
				}
				selectPageHandler(to ,me.find("._limitselect_").val() ) ;
				return false ;
			}) ;
			
			me.find("[pn='input']").keydown(function(event){
				if(event.keyCode==13){
					selectPageHandler($(this).val() ,me.find("._limitselect_").val() ) ;
				}
			}) ;
			
			if(curPage <= 1){
				me.find("._firstpage_,._prepage_").addClass("ui-state-disabled") ;
			}
			
			if(curPage >= totalPage ){
				me.find("._nextpage_,._lastpage_").addClass("ui-state-disabled") ;
			}
			
			me.find("._page_:not(.ui-state-disabled)").hover(function(){
				$(this).addClass("ui-state-hover") ;
			},function(){
				$(this).removeClass("ui-state-hover") ;
			}) ;
		}
		
		function selectPageHandler(curPage , limit ){
			var cp = curPage>0 ? Math.min( curPage , calcTotalPage(totalRecord , limit) ):1 ;
			selectPage&&selectPage(cp , limit) ;
		}
		
		function template(){
			var html = [] ;
			html.push('<div class="grid-toolbar-div">');
			html.push('<div style="float:right">');
			html.push('	<table  cellspacing="0" cellpadding="0">');
			html.push('		<tbody>');
			html.push('			<tr>');
			html.push('				<td></td>');
			html.push('				<td> <span>共<span class="_totalpage_"></span>页/<span class="_totalnumber_"></span>条记录</span> &nbsp;&nbsp;每页</td>');
			html.push('				<td>');
			html.push('					<select class="_limitselect_"></select>');
			html.push('				</td>');
			html.push('				<td>条 &nbsp;跳转<span><input type="text" class="_jumpinput_" pn="input" style="width:20px;" value=""></span>页</td>');
			
			html.push('				<td>');
			html.push('					<a href="#" class="_page_ _firstpage_ " pn="first"><span class="ui-icon ui-icon-seek-first"></span></a>');
			html.push('					<a href="#" class="_page_ _prepage_ " pn="pre"><span class="ui-icon ui-icon-seek-prev"></span></a>');
			html.push('				</td>');
			html.push('				<td>');
			html.push('					<span class="grid-navig"></span>');
			html.push('				</td>');
			html.push('				<td>');
			html.push('					<a href="#" class="_page_ _nextpage_ " pn="next"><span class="ui-icon ui-icon-seek-next"></span></a>');
			html.push('					<a href="#" class="_page_ _lastpage_ " pn="last"><span class="ui-icon ui-icon-seek-end"></span></a>');
			html.push('				</td>');
			html.push('			</tr>');
			html.push('		</tbody>');
			html.push('	</table>');
			html.push('</div>');
			html.push('<div style="clear:both;"></div>');
			html.push('</div>');
			$(me).html(html.join('')) ;
	  	}
	}
})(jQuery) ;