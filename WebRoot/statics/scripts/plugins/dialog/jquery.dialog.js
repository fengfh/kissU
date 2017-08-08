(function($){
	var zIndex = 900 ;
	var dialogArray = [] ;
	
	$.fn.dialogResize = function(opts){
		var dialog = $(this).parents(".ui-dialog-wrapper:first").data("dialog");
		
		if(!dialog){
			if( window.parent.jQuery("iframe[name='"+window.name+"']").parents(".ui-dialog-wrapper:first")[0]){
				opts = opts || (function(){
					var pos = {} ;
					try{
						pos =getWinPos(window);
					}catch(e){
						pos = {width:0,height:0} ;
					}
					return pos ;
				})() ;
				opts.iframe = true ;
				window.parent.jQuery("iframe[name='"+window.name+"']").dialogResize(opts);
			}
		}else{
			resizeDialog.call(dialog,opts);
		}
	};
	
	$.fn.dialogReload = function(opts){
		var dialog = $(this).parents(".ui-dialog-wrapper:first").data("dialog");
		if(!dialog){
			if( window.parent.jQuery("iframe[name='"+window.name+"']").parents(".ui-dialog-wrapper:first")[0]){
				window.parent.jQuery("iframe[name='"+window.name+"']").dialogReload(opts);
			}
		}else{
			reloadDialog.call(dialog,opts);
		}
	};
	
	$.fn.dialogReturnValue = function(val){
		var dialog = $(this).parents(".ui-dialog-wrapper:first").data("dialog");
		if(!dialog){
			if( window.parent.jQuery("iframe[name='"+window.name+"']").parents(".ui-dialog-wrapper:first")[0]){
				window.parent.jQuery("iframe[name='"+window.name+"']").dialogReturnValue(val);
				return true ;
			}
		}else{
			_dialogReturnValue.call(dialog,val);
			return true ;
		}
		$.dialogReturnValue(val) ;
	}
	
	$.fn.dialogClose = function(value){
		var dialog = $(this).parents(".ui-dialog-wrapper:first").data("dialog");
		if( typeof value != 'undefined' ){
			$(dialog).dialogReturnValue(value) ;
		}
		if(!dialog){
			if( window.parent.jQuery("iframe[name='"+window.name+"']").parents(".ui-dialog-wrapper:first")[0]){
				window.parent.jQuery("iframe[name='"+window.name+"']").dialogClose() ;
				return true ;
			}
		}else{
			close.call(dialog);
			return true ;
		}
		//window.close() ;
	}
	
	
	$.dialog = function(options){
		options = $.extend({},$._dialog.defaults,options) ;
		var dialogWin = options.renderTop?$topWindow():window ;

		options.opener = window ;
		options.window = dialogWin ;
		return new dialogWin.jQuery._dialog( options ) ;
	}
	
	$._dialog = function(options){
		this.__id = new Date().getTime() ;
		this.settings = options ;
		this.settings.iframe   = typeof(this.settings.iframe) == 'undefined'?true:this.settings.iframe ;
		var me  = this ;
	
		dialogArray.push({id:this.__id,dialog:this})
		
		if(typeof this.settings.model=="undefined" || this.settings.model){
			model.call(this,true);
		}
		
		var jQDomEl = renderFramework.call(this) ;
		
		if(this.settings.titleStyle){
			jQDomEl.find(".ui-dialog-titlebar")[0].style.cssText = this.settings.titleStyle ;
		}
		
		if(!this.settings.max ){
			jQDomEl.find(".ui-dialog-titlebar-max").hide() ;
		}
		
		//' + this.settings.title + '
		if( jQDomEl.find(".ui-dialog-titlebar").css("position") != "absolute" ){
			jQDomEl.find(".ui-dialog-title").html(this.settings.title ) ;
		}
		
		if(this.settings.buttonBar){
			jQDomEl.find(".ui-dialog-buttonpane").show() ;
		}

		attachEvent.call(this,jQDomEl) ;
		
		jQDomEl.show().center(false) ;
		this.frwDom = jQDomEl ;
		
		jQDomEl.find(".dialog_close,.btn-cancel").click(function(event){
			event.stopPropagation();
			close.call(me) ;
			return false ;
		}) .mouseover(function(event){
			event.stopPropagation();
			return false ;
		}) .mousedown(function(event){
			event.stopPropagation();
			return false ;
		});
		
		jQDomEl.find(".dialog_max").click(function(event){
			var isMax = $(this).find("span.icon-plus").length ;
			if( isMax ){
				max.call(me) ;
				$(this).find("span").removeClass("icon-plus").addClass("icon-minus") ;
			}else{
				min.call(me) ;
				$(this).find("span").removeClass("icon-minus").addClass("icon-plus") ;
			}
			event.stopPropagation();
			
			return false ;
		}) .mouseover(function(event){
			event.stopPropagation();
			return false ;
		}) .mousedown(function(event){
			event.stopPropagation();
			return false ;
		}).hover(function(){
			$(this).addClass("ui-dialog-titlebar-hover") ;
		},function(){
			$(this).removeClass("ui-dialog-titlebar-hover") ;
		});
		
		renderContent.call(this) ;
		
		jQDomEl.find(".dialog_close").focus().blur() ;
		this.settings.window.focus();
		setTimeout(function(){
			jQDomEl.find(".dialog_close").focus().blur() ;
		},200) ;
		return this ;
	}
	
	$._dialog.prototype.close = function(){
		close.call(this) ;
	}
	
	
	$.dialog.defaults = $._dialog.defaults = {
		okButtonText:"确定",
		cancelButtonText:"取消",
		title:"",
		escClose:true,
		okEvent:function(){},
		cancelEvent:function(){
			close.call(this) ;
		},
		renderTop:true
	};
	
	$(function(){
		if( $._dialog.defaults.escClose ){
			$(window).keydown(function(e){
				var kNo = window.event?e.keyCode:e.which;
				if(kNo==27){
					var dialog = dialogArray[dialogArray.length-1]||{} ;
					if(dialog.dialog){
						close.call(dialog.dialog) ;	
					}else{
						var dialogWin = $topWindow() ;
						dialogWin.jQuery && dialogWin.jQuery.dialog_ESCClose() ;
					}
				};
			});
		}
		
		$.dialog_ESCClose = function(){
			var dialog = dialogArray[dialogArray.length-1]||{} ;
			if(dialog.dialog){
				close.call(dialog.dialog) ;	
			}
		}
	}) ;
	
	///////////private/////////////
	
	function _dialogReturnValue(val){
		this.returnValue = val ;
		this.settings.opener.returnValue = val ;
	}
	
	function renderFramework(){
		var html = '\
		    <div class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-dialog-wrapper">\
				  <div class=" drag_handler_target ui-dialog-titlebar ui-widget-header ui-corner-top ui-helper-clearfix">\
					 <span class="ui-dialog-title"></span>\
					 <a href="###" class="ui-dialog-titlebar-close ui-corner-all dialog_close">\
						<span class="ui-icon ui-icon-closethick">X</span>\
					 </a>\
					<a href="###" class="ui-dialog-titlebar-max ui-corner-all dialog_max">\
						<span class="ui-icon icon-plus">+</span>\
					 </a>\
				  </div>\
				  <div class="ui-dialog-content ui-widget-content dialog-content" style="height:100px;">\
			      </div>\
				  <div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix" style="display:none;">\
					<div class="ui-dialog-buttonset">\
	 					<button type="button"  class="btn btn-primary btn-ok">\
							'+this.settings.okButtonText+'\
						</button>\
						<button type="button" class="btn btn-cancel">\
							'+this.settings.cancelButtonText+'\
						</button>\
					</div>\
				</div>\
			</div>\
		';
		
		var dom = $(html).appendTo(document.body).hide().css("z-index",zIndex).data("dialog",this) ;
		/*if( this.settings.width ){
			dom.width( this.settings.width ) ;
		}*/ 
		return dom ;
	} ;
	
	function block(){
		var pos = this.frwDom.find(".ui-dialog-titlebar").css("position")  ;
		var opts = {} ;
		if( pos == "absolute" ){
			opts.styleClass = "margin-top:"+( this.frwDom.find(".ui-dialog-titlebar").height() + 10)+"px;";
		}
		if($.block)this.frwDom.block(opts) ;
	}
	
	function unblock(){
		if($.block)this.frwDom.unblock() ;
	}
	
	function model(state){
		
		if(state){
			var height = Math.max($(document).height()-20,$(window).height()) ;
			
			if( isIE6() ){
				this.modelFrm = $('<iframe src="about:blank" style="filter:alpha(opacity=0);" class="ui-dialog-mask" frameborder="0"></iframe>')
					.appendTo(document.body)
					.css({"z-index":zIndex,"height":height+"px","position":"absolute","left":"0px","top":"0px","width":"100%"}) ;
				zIndex++ ;
			}
			this.modelEl = $('<div class="ui-dialog-mask ui-widget-overlay"></div>')
				.appendTo(document.body)
				.css({"z-index":zIndex,"height":height+"px","position":"absolute","left":"0px","top":"0px","width":"100%"}) ;
			zIndex++ ;
		}else{
			if(this.modelFrm)this.modelFrm.hide(200).remove();
			if(this.modelEl)this.modelEl.hide(200).remove();
		}
	}
	
	function renderContent(){
		zIndex++ ;
		var me = this ;
		var url = this.settings.url;
		
		
		var contentDom = this.frwDom.find(".dialog-content").empty() ;
		var iframe = this.settings.iframe ;
		
		//set params
		this.settings.window.$_dialogArguments = this.settings.data ;
		
		//init width and height
		var _height = '' ;
		if( this.settings.width ){
		    _height = this.settings.height || (this.settings.width*(6/19)) ;
			resizeDialog.call(this,{width:this.settings.width,height:_height,iframe:true}) ;
		}
		block.call(this) ;
		
		if( this.settings.content ){//文本信息
			unblock.call(this) ;
			contentDom.html(this.settings.content) ;
			resizeDialog.call(me) ;
			if( me.settings.onload ) me.settings.onload.call(me) ;
		}else if( this.settings.contentSelector ){//文本内容
			var targetDom = this.settings.opener.jQuery(this.settings.contentSelector)[0].outerHTML ;
			unblock.call(this) ;
			contentDom.html(targetDom) ;
			resizeDialog.call(me) ;
			if( me.settings.onload ) me.settings.onload.call(me) ;
		}else if( iframe ){//iframe
			var ifr = $('<iframe width="100%" name="'+new Date().getTime()+'" scrolling="auto" frameborder="0" style="border:none;" src="' + url + '"></iframe>').appendTo(contentDom) ;
			this.innerFrame = ifr ;
	
			if(_height)ifr.css("height",_height+"px") ;
		
			$(ifr).bind("load",function(){
					$(ifr).show() ;
					unblock.call(me) ;
					var contentWindow = contentDom.find("iframe")[0].contentWindow ;
					
					me.ifrWindow = contentWindow ;
					
					//get Width
					if( me.settings.width ){
						resizeDialog.call(me,{width:me.settings.width,iframe:true}) ;
					}else{
						try{
							var width = getMaxWidth.call(me, contentWindow.jQuery(contentWindow.document.body) ) ;
							resizeDialog.call(me,{width:width,iframe:true}) ;
						}catch(e){}
					}
	
					var pos = {} ;
					try{
						pos =getWinPos(contentWindow);//me.ifrWindow
					}catch(e){
						pos = {width:0,height:0} ;
					}
	
					pos.iframe = true ;
					resizeDialog.call(me,pos) ;
					if( !me.frwDom.data("isRender") ){
						me.frwDom.data("isRender",true) ;
					}
					
					if( me.settings.onload ) me.settings.onload.call(me) ;
	
					
			})
		}else if( !iframe  ){//url no iframe
			var split = url.indexOf("?")!=-1?"&":"?" ;
		 	var options = {
			  	url:url+split+new Date().getTime(),
			  	cache: false,
			  	data:this.settings.data||{},
			  	success: function(html){
			  		setTimeout(function(){
							unblock.call(me) ;
			  				contentDom.html(html) ;
			  				resizeDialog.call(me) ;
			  				if( me.settings.onload ) me.settings.onload.call(me) ;
			  		},10) ;
				},
				_error:function(xhr, textStatus, errorThrown,url){
					me.close(false);
				}
			 } ;
			 
		 	 if(this.settings.requestType){
		 	 	options.type = this.settings.requestType ;
		 	 }
		 	 options.noblock = true ;
		 	 $.request(options);
		}
	}
	
	function getMaxWidth(container){
		var me = this ;
		var width = 0;
		container.find("table").each(function(){
			var _width = $(this).outerWidth() ;
			
			var parent = $(this).parent() ;

			while( parent[0] != container[0] ){
				_width = _width +( parent.outerWidth() - parent.width() ) ;
				parent = parent.parent() ;
			}
			width = Math.max(width,_width) ;
		});
		return width ;
	}
	
	function getWidth(container,opts){
		var _dom = container.find(".dialog-content")[0] ;
		var contentTableWidth = getMaxWidth.call(this, container.find(".dialog-content") ) ;
		var _width  =  Math.max(this.settings.width||0 , _dom.scrollWidth , _dom.offsetWidth , opts.width||0,contentTableWidth||0 );
		return Math.min(_width,$(window).width()) ;
	}
	
	function getHeight(container,opts){
		var _dom = container.find(".dialog-content")[0] ;
		if( !container.data("isRender") ){
			return Math.max(this.settings.height||0,_dom.scrollHeight , _dom.offsetHeight  , opts.height||0) ;//_dom.scrollHeight ,
		}else{
			return Math.max(this.settings.height||0, _dom.offsetHeight  , opts.height||0) ;//_dom.scrollHeight ,
		}
	}
	
	function reloadDialog(opts){
		this.settings = $.extend(this.settings,opts) ;
		renderContent.call(this) ;
	}
	

	function resizeDialog(opts){
		//clear height
		
		opts = opts||{} ;
		var container = this.frwDom ;
		this.settings._pos = {} ;
		var fixWidth = 30 ;
		var fixHeight = 50 ;
		if(opts.force){
			fixHeight = 0 ;
		}
		
		opts.height&&container.find(".ui-dialog-content:first").height(opts.height);

		var _width  =  opts.force?opts.width:getWidth.call(this,container,opts) ;
		var width   = Math.min(_width,$(window).width()-fixWidth) ;
		this.settings._pos.width = width ;
		
        container.width(width);
        
        var _height =  opts.force?opts.height:getHeight.call(this,container,opts) ;
		var titleBar = container.find(".ui-dialog-titlebar");
		var btnBar = container.find(".ui-dialog-buttonpane");
		var titleBarHeight = titleBar.is(":visible") ?titleBar.height():0 ;
		var btnPanelHeight = btnBar.is(":visible") ?btnBar.height():0 ;

		var height  = Math.min(_height,$(window).height() - titleBarHeight - btnPanelHeight -fixHeight );
		if( opts.force ){
			_height =  Math.min(_height,height) ;
		}

		var noScroll = this.settings.isScroll === false  ;//不设置滚动条，内容区自己决定控制滚动位置
		
		if(height<_height && !container.data("renderHeight")){
			container.data("renderHeight",true);
			var fixWidth = $.browser.msie?25:20 ;
			width = width +fixWidth ;
			this.settings._pos.width = width ;
			container.width(width);
		}
		var isScrollX = noScroll?false:width < _width;
		container.find(".dialog-content").css("overflow-x", isScrollX ? "auto" : "hidden");
        
        var isScrollY = noScroll?false:height < _height;
        this.settings._pos.height = height ;
        container.find(".dialog-content").height(height);
        container.find(".dialog-content").css("overflow-y", isScrollY ? "auto" : "hidden");

        if (opts.iframe) {
        	
            container.find(".dialog-content>iframe").css("overflow-y", isScrollY ? "auto" : "hidden");
            container.find(".dialog-content>iframe").css("overflow-x", isScrollX ? "auto" : "hidden");
            var frmHeight = noScroll?Math.min(height, _height):Math.max(height, _height);
            this.settings._pos.frmHeight = frmHeight ;
            container.find(".dialog-content>iframe").height( frmHeight );
   
            if (isIE6() && isScrollX && !(nnoScroll ===false) ) container.find(".dialog-content>iframe").width(width - 14);
        }
		
		this.frwDom.center(false) ;
	}
	
	function attachEvent(jQDomEl){
		var draggable = typeof this.settings.draggable == "undefined" || this.settings.draggable ;
		var resizable = this.settings.resizable ;
		var me 		  = this ;
		var okBtn = jQDomEl.find(".btn-ok") ;
		var cancelBtn = jQDomEl.find(".btn-cancel") ;
		//
		okBtn[0].onclick = function(){
			me.settings.okEvent.call(me) ;
		} ;
		
		cancelBtn[0].onclick = function(){
			me.settings.cancelEvent.call(me) ;
		};
		
		if( $.fn.btn ){//兼容旧框架
			okBtn.attr("value",okBtn.text()) ;
			cancelBtn.attr("value",cancelBtn.text()) ;
		
			okBtn.btn().init(okBtn,{'icon':'icon-save'}) ;
			cancelBtn.btn().init(cancelBtn,{'icon':'icon-cancel'}) ;
		}
		
		if(draggable && jQDomEl.draggable ){
			jQDomEl.draggable({
				handle: jQDomEl.find(".drag_handler_target").css("cursor","move"),
				containment:"window",
				iframeFix: true,
				cancel:".dialog_close,.dialog_max"
			}) ;
		}
		
		if(resizable && jQDomEl.resizable ){
			jQDomEl.resizable({
			  start:function(){
			  	jQDomEl[0].ondragstart = "return false;"  
	        	jQDomEl[0].onselectstart = "return false;"  
	        	jQDomEl[0].onselect = "document.selection.empty();"  
			  },stop:function(){
			  	jQDomEl[0].ondragstart = null ;  
	        	jQDomEl[0].onselectstart = null ;  
	        	jQDomEl[0].onselect = null ;  
			  }
			}) ;
		}
		
		this.settings.window.jQuery(this.settings.window).bind("resize",function(){
			$.execResize("__dialogResize",function(){
				if( me.settings.iframe ){
					var pos = {} ;
					try{
						pos =getWinPos(me.ifrWindow);//me.ifrWindow
					}catch(e){
						pos = {width:0,height:0} ;
					}
					pos.iframe = true ;
					resizeDialog.call(me,pos) ;
				}else{
					resizeDialog.call(me ) ;
				}
				
				if(me.modelFrm)me.modelFrm.css({height:$(document).height()+"px"});
				if(me.modelEl)me.modelEl.css({height:$(document).height()+"px"});
			}) ;
		})
	}
	
	function max(){
		var me = this ;
		$(me).data("_pos",this.settings._pos) ;
		resizeDialog.call(me,{width:$(window).width(),height:$(window).height(),force:true,iframe:this.settings.iframe}) ;
	}
	
	function min(){
		var me = this ;
		var _pos = $(me).data("_pos");
		resizeDialog.call(me,{width:_pos.width,height:_pos.height,force:true,iframe:this.settings.iframe}) ;
	}
	
	function close(){

		var me = this ;
		
		try{
			if( this.settings.close ){
				var _ = this.settings.close.call(this,this.settings.opener) ;
				if( _ === false ){
					return ;
				}
			}
		}catch(e){alert(e.message);}

		
		this.frwDom.hide() ;

		if(typeof this.settings.model=="undefined" || this.settings.model)
			model.call(this,false) ;

		//清除iframe，释放内存
	    if(this.frwDom.find(".dialog-content>iframe").length){
	   	 try{
	   	   jQuery.memory.iframe( this.frwDom.find(".dialog-content>iframe")[0] ) ;
	   	 }catch(e){}
	    }
		
		this.frwDom.remove() ;
		
		var _index = -1;
		$(dialogArray).each(function(index){
			if(this.id == me.__id ){
				delete this.dialog ;
				_index = index;
			}
		});
		if(_index>=0)dialogArray.splice(_index,1) ;

		//document.focus();
	}
	
	//////////utils///////////////
	jQuery.fn.center = function(f) {  
	    return this.each(function(){  
	        var p = f===false?document.body:this.parentNode;  
	        if ( p.nodeName.toLowerCase()!= "body" && jQuery.css(p,"position") == 'static' )  
	            p.style.position = 'relative';  
	        var s = this.style;  
	        s.position = isIE6()?'absolute':'fixed'; 
	        
	        if(p.nodeName.toLowerCase() == "body")  
	            var w=$(window);  
	        if(!f || f == "horizontal") {
	            //s.left = "0px";  
	           
	            if(p.nodeName.toLowerCase() == "body") {  
	                var clientLeft = w.scrollLeft() - 3 + (w.width() - parseInt(jQuery.css(this,"width")))/2;  
	                s.left = Math.max(clientLeft,0) + "px";  
	            }else if(((parseInt(jQuery.css(p,"width")) - parseInt(jQuery.css(this,"width")))/2) > 0)  
	                s.left = ((parseInt(jQuery.css(p,"width")) - parseInt(jQuery.css(this,"width")))/2) + "px";  
	        }  
	        
	        if(!f || f == "vertical") {  
	            //s.top = "0px";  
	            if(p.nodeName.toLowerCase() == "body") {  
	                var clientHeight = w.scrollTop() - 4 + (w.height() - parseInt(jQuery.css(this,"height")))/2;  
	                s.top = Math.max(clientHeight,0) + "px";  
	            }else if(((parseInt(jQuery.css(p,"height")) - parseInt(jQuery.css(this,"height")))/2) > 0)  
	                s.top = ((parseInt(jQuery.css(p,"height")) - parseInt(jQuery.css(this,"height")))/2) + "px";  
	        }  
	        
	    });  
	}; 
	
	jQuery.memory = {
		iframe:function(ifr,bool,b2){
			try{
			   ifr.src = "about:blank"; 
		   	   
		   	   var frames = ifr.contentWindow.document.getElementsByTagName("iframe");
		   	   for(var i=0 ;i<frames.length ;i++){
		   	   	  jQuery.memory.iframe(frames[i],true) ;
		   	   }
		   	   
			   ifr.contentWindow.document.write(""); 
			   ifr.contentWindow.document.clear(); 
			   ifr.contentWindow.close() ;
			   $(ifr).remove();
			   ifr = null ;
			}catch(e){}
		   //if(!bool)CollectGarbage();
		}
	}
	
	function isIE6(){
		if (jQuery.browser.msie) {
		   return parseInt(jQuery.browser.version)<=6 ;
		}
		return false;
	}
	
	var dialogWindow = null ;
	window.$topWindow = function () {
	    var parentWin = window;
	    if( parentWin.jQuery._dialog ) dialogWindow = parentWin ;
	    while (parentWin != parentWin.parent) {
	    	try{
	        	if (parentWin.parent.document.getElementsByTagName("FRAMESET").length > 0) break;
	        	parentWin = parentWin.parent;
	        	if( parentWin.jQuery._dialog ) dialogWindow = parentWin ;
	    	}catch(e){
	    		return dialogWindow ;
	    	}
	    }

	    return dialogWindow;
	};
	
	function getWinPos(win){
		return {
			width:Math.max(
				win.document.body['scrollWidth'],
				win.document.documentElement['scrollWidth'],
				win.document.body['offsetWidth'],
				win.jQuery(win.document.body).find("table").width()
			),
			height:Math.max(
				win.document.body['scrollHeight'],
				win.document.documentElement['scrollHeight'],
				win.document.body['offsetHeight']
			)
		};
	}
})(jQuery) ;