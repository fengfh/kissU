/*解析 ConextPath*/
function getContextPath() {
    var pathName = document.location.pathname;
    var index = pathName.substr(1).indexOf("/");
    var result = pathName.substr(0,index+1);
    
    var protocol = window.location.protocol ;
    if( protocol == "file:" ){
    	result = pathName.split("bingo-css-framework")[0]+"bingo-css-framework" ;//直接浏览器查看文件路径
    	return window.location.protocol+"//"+result;
    }
    return result ;
}

window.Config = window.Config || {
	contextPath:getContextPath(),
	serverPath:window.location.protocol+"//"+window.location.host+getContextPath()
} ;
window.Global = window.Global || window.Config ;


/*******************************************
 @description 打开窗口
 @example
    打开窗口            ： jQuery.open( url , width , height , params ,callback ) ;
    在打开窗口中获取参数 ： var args        = jQuery.dialogAraguments() ;
    获取打开窗口中返回值 ： var returnValue = jQuery.dialogReturnValue() ;
 ******************************************/
if( !jQuery.fn.dialogClose ){
	jQuery.fn.dialogClose = function(){
		window.close() ;
	}
}

jQuery.open = function(){//url,width,height,params,callback,fixParams
	var url , width , height , params , callback , fixParams ;//6
	var args = arguments ;
	var argsLength = args.length ;
	for(var i=argsLength+1 ;i<7;i++){
		args[i-1] = null ;
	}
	url = args[0] ;
	$(args).each(function(index,arg){
		if(index == 0 )return ;
		if( jQuery.isFunction( arg )  ){
			callback = arg ;
		}else if( typeof arg == 'string' || typeof arg == 'number' ){
			if(!width) width = arg ;
			else if(!height) height = arg ;
			else params = arg ;
		}else if(arg === null || arg === "" ){
			//none
		}else if(typeof arg == "object"){
			params = arg ;
		}
	}) ;
	
	url = jQuery.utils.parseUrl(url||"") ;
	jQuery.dialogReturnValue("__init__");
	params = params||{} ;
	fixParams = fixParams||{} ;
	if( $.dialog  && (params.showType == 'dialog' || !params.showType ) ){
		var opts = {
			width:width,
			height:height,
			title:params.title||params.Title||fixParams.title||'',
			url:url,
			data:params,
			onload:function(){
				var me = this ;
				if(params.iframe===false || params.iframe === "false"){
					setTimeout(function(){
						//控件初始化
						me.frwDom.uiwidget() ;
						//浏览器兼容
						me.frwDom.browserFix() ;
					},5 ) ;
				}
			},close:function(){
				callback && callback.call(this) ;
			}
		}
		
		opts = $.extend({},opts,params,fixParams) ;
		var _dialog = jQuery.dialog(opts) ;
		return _dialog ;
		
	}else if(!$.browser.msie || params.showType == 'open'){
		
		var win = openCenterWindow(url, width, height);
		window._dialogArguments = params ;
		
		var _callbak = function(){
			if( $.unblock ){$.unblock() ; }
			callback(window);
		}
		try{
			if( jQuery.browser.msie ){
				win.attachEvent("onunload", _callbak );
			}else{
				win.onbeforeunload = _callbak ;
			}
		}catch(e){
			
		}
		return win ;
	} else if( $.browser.msie ){
		_returnValue = showCenterModalDialog(url , width ,height ,params) ;
		jQuery.dialogReturnValue(_returnValue||"") ;
		callback() ;
	}
}

jQuery.dialogAraguments = function(){
	//showmodeldialog
	var args = window.dialogArguments||window.$_dialogArguments ;
	if( args ) return args ;
	var target =  window.opener || window.parent ;
	return target._dialogArguments||target.$_dialogArguments ;
}

jQuery.dialogReturnValue = function(returnValue){
	if(typeof returnValue != 'undefined'){
		if( returnValue == "__init__" || !returnValue   ){
			window.returnValue = null ;
			return ;
		}

		//window.winReturnValue = returnValue ;
		window.returnValue = returnValue ;//showModelDialog

		try{
			if( window.opener.location.href != window.location.href ){ //open
				//fix crossdomain
				try{ window.opener.returnValue = returnValue }catch(e){} ;
			}
		}catch (e){
		}

		if(window.location.href != window.top.location.href ){//no iframe
			//dialog iframe
			$(document.body).dialogReturnValue && $(document.body).dialogReturnValue(returnValue) ;
		}
		
		//dialog iframe
		if( $(".ui-dialog-wrapper:last")[0]){
			$(".ui-dialog-wrapper:last").find("div:first").dialogReturnValue(returnValue) ;
		}
	}else{
		return window.returnValue ;
	}
}

function showCenterModalDialog(URL,dlgWidth,dlgHeight,arg){
    var dlgLeft = (window.screen.width-dlgWidth)/2;
    var dlgTop  = (window.screen.height-dlgHeight)/2;
    var widthTmp = dlgWidth ;
    var form    = "scroll:no;status:no;dialogHeight:" + dlgHeight + "px;dialogWidth:" + widthTmp + "px;dialogLeft:" + dlgLeft + ";dialogTop:" + dlgTop;
    return window.showModalDialog(URL,arg,form);
}

function openCenterWindow(URL,wndWidth,wndHeight){
	var wndLeft = (window.screen.width-wndWidth)/2;
	var wndTop  = (window.screen.height-wndHeight)/2;
	var form    = "width=" + wndWidth + ",height=" + wndHeight + ",left=" + wndLeft + ",top=" + wndTop + ",resizable=yes";
	 return window.open(URL,'',form);        
}

/*******************************************
 @description 转化form表单元素为JSON对象（也可以为div）
 @example
    var json = $(formSelector).toJson() ;
 ******************************************/
jQuery.fn.toJson = function(beforeExtend,afterExtend,params) {
	var me = jQuery(this) ;
	beforeExtend = beforeExtend||{} ;
	afterExtend = afterExtend||{} ;
	params = params||{} ;
	var a = {};
	
	/*var json = {};
	jQuery.map(me.find(":input").serializeArray(), function(n, i) {
		json[n['name']] = n['value'];
	});
	return json;*/
	
	//text hidden password
	me.find("input[type=text],input[type=hidden],input[type=password]").each( function(){
		_add(this.name||this.id,this.value) ;
	} ) ;
	me.find("textarea").each( function(){
		_add(this.name||this.id,this.value) ;
	} ) ;
	
	//radio
	me.find("input[type=radio]").filter(":checked").each( function(){
		_add(this.name||this.id,this.value) ;
	} ) ;
	
	//checkbox
	var temp_cb = "" ;
	me.find("input[type=checkbox]").filter(":checked").each( function(){
		if (temp_cb.indexOf(this.name ) == -1) {
			temp_cb += (this.name) + ",";
		}
	} ) ;
	jQuery( temp_cb.split(",") ).each( function(){
		var tempValue = [] ;
		jQuery("input[name='" + this + "']:checked").each(function(i) {
			tempValue.push( this.value ) ;
		});
		_add(this ,tempValue.join(",")) ;
	} ) ;
	
	//select
	me.find('select').each( function(){
		var multi = $(this).attr('multiple')  ;
		var val = [] ;
		jQuery(this).find('option:selected').each(function(){
			if(this.value)val.push( this.value ) ;
		});
		
		if( val.length == 0 ){
			val.push(this.value||"") ;
		}
		
		if(multi && params.mulSelectSplit ){
			_add(this.name||this.id,"'"+val.join("','")+"'") ;
		}else{
			_add(this.name||this.id,val.join(',')) ;
		}
	} ) ;
	
	return $.extend(beforeExtend , a , afterExtend) ;
	
	function _add(key,value){
		if(key == "__ValidatorRules") return ;
		
		if(!key || !jQuery.trim(key)) return ;
		
		value = value||'' ;
		a[key] = value ;
	}
}


/********************************
 *************jQuery.utils*******
 *********************************/
jQuery.utils = {
	//解析URL
	parseUrl: function (url,params) {
        params = params || {};
        url = jQuery.trim(url);
        if (url.startWith("~")) {
            url = url.substring(1);
            url = Config.contextPath + url;
        }

        //url = url.replace("~",Config.contextPath) ;
        url = url.replace("{host}", getHost());
        url = url.replace("{port}", getPort());
        
        for (var o in params) {
            url = url.replace("{" + o + "}", params[o]);
        }

        if (new RegExp("^(http|https)://").test(url)) {
            var urlObject = parseUrlInternal(url);
            if ((urlObject.host + ":" + urlObject.port == window.location.host) || urlObject.host == window.location.host) {
                url = url.replace(new RegExp("^(http|https)://[^/]+/"), window.location.protocol + "//" + window.location.host + "/");
            }
        }

		return url ;
		
		function getHost(){
			var host = window.location.host ;
			return host.split(":")[0] ;
		}
		
		function getPort(){
			return window.location.port ;
		}
		
		 function parseUrlInternal(url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                query: a.search,
                params: (function () {
                    var ret = {},
         seg = a.search.replace(/^\?/, '').split('&'),
         len = seg.length, i = 0, s;
                    for (; i < len; i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1')
            };
        }
	},
	scrollContent:function(header,content,footer){
		$(document.body).attr("scroll","no").css("overflow","hidden");
		
		var header 	= content||".header" ;
		var footbtn = footbtn||".footbtn" ;
		var content = content||".content" ;
		
		var h = header===false?0:$(header).outerHeight() ;
		var f = footer===false?0:$(footbtn).outerHeight() ;
		
		var contentHeight =  $(document.body).height() -  h - f - 5;
		
		if($.browser.msie){
			$(content).width($(document.body).width()-5) ;
		}
		
		$(content).height(contentHeight).css({'overflow-x':'hidden','overflow-y':'auto'}) ;
	},scriptPath:function(scriptName){
		var _scriptRoot = window.defaultScriptRoot||"~/statics/scripts" ;
		var _themeRoot  = window.defaultThemeRoot||"~/statics/themes" ;
		var _defaultTheme = window.defaultTheme||"mobile" ;
		
		if(scriptName == "plugin"||scriptName == "plugins") return jQuery.utils.parseUrl(_scriptRoot+"/plugins/") ;
		if(scriptName == "upload") return jQuery.utils.parseUrl(_scriptRoot+"/plugins/") ;
		if( scriptName == 'jqueryui.css' ) return  jQuery.utils.parseUrl(_themeRoot+"/"+_defaultTheme+"/jquery-ui.css") ;
		var path = "" ;
		$("script,link").each(function(){
			if(path) return ;
			var src = this.src||this.href ;
			if(src &&  src.toLowerCase().indexOf(scriptName.toLowerCase())!=-1 ){
				path = src.substring(0, src.toLowerCase().indexOf(scriptName.toLowerCase()));
				var A = path.lastIndexOf("/");
				if (A > 0)
					path = path.substring(0, A + 1);
				return ;
			}
		}) ;
		return path ;
	}
};


/**
 * 统一获取数据入口
 * 参数格式：
 * 	1、 params
 *       type: 'post',
         url: 'demo-data.html' ,
         data: req.term ,
         async: true ,
         dataType:'json'
         
         返回数据格式
         returnCode:       --  int
         returnDesc:        -- string
         error:                  --  string
         returnValue:      --  json object
 * 
 */
jQuery.support.cors = true ;
jQuery.request = function(params){
	var _url     = null ;
	var _data    = null ;
	var _success = null ;
	var _error   = null ;
	var target   = params.target||window.document.body ;

	 if( jQuery.block && !params.noblock ) jQuery(target).block() ;
	 
 	 var dataType 	= params.dataType||'text' ;
 	 var async 		= typeof params.async == 'undefined' ? true : params.async ;
 	 var type 		= params.type||'post' ;
 	 var error 		= params.error||_error|| jQuery.request.defaultErrorHandler;
 	 var success 	= params.success||_success ;
 	 var url 		= params.url ||_url ;
 	 var data 		= params.data || _data ;
 	 
	 if(jQuery.utils) url = jQuery.utils.parseUrl(url) ;
	 if (url.indexOf("?") > 0) {
        url = url + "&sb=" + Math.random();
     } else {
        url = url + "?sb=" + Math.random();
     }
     
     var ajaxOptions = {
        type: type,
        url: url ,
        data: data ,
        async: async ,
        dataType:dataType ,
        success: function(response){
        	if( jQuery.unblock && !params.noblock ) jQuery(target).unblock() ;
        	var json = response ;
        	if(typeof(response) == 'string'){
        		try{
        			eval("response = "+ response ) ;
        		}catch(e){
        			success(response,params.custom||{}) ;
        			return ;
        		}
        	}

        	if( typeof response.returnCode != 'undefined' && response.returnCode != 200 ){
        		error(null , response.returnCode , response.error,url) ;
        	}else{
        		if( !response.returnValue ||  typeof  response.returnValue == 'string')
        			success(response.returnValue===false?false:(response.returnValue||response),params.custom||{}) ;
        		else{
        			if( response.returnValue.Rows ){
        				var items = [] ;
        				var columnNames = response.returnValue.ColumnNames ;
        				$(response.returnValue.Rows).each(function(){
        					var item = this ;
        					var temp = {} ;
        					$(item).each(function(index,record){
        						var colName = columnNames[index] ;
        						temp[colName] = this ;
        					}) ;
        					items.push(temp) ;
        				}) ;
        				success(items) ;
        			}else{
        				success( response.returnValue || response,params.custom||{}) ;
        			}
        		}	
        	}
        } ,
        error: function(xhr, textStatus, errorThrown){
        	if( jQuery.unblock && !params.noblock ) jQuery(target).unblock() ;
        	error(xhr, textStatus, errorThrown,url) ;
        	params._error && params._error(xhr, textStatus, errorThrown,url) ;
        }
     } ;
     
     if( jQuery.request._events['beforeSend'] || params.beforeSend){
     	ajaxOptions.beforeSend = function(xhr){
     		$( jQuery.request._events['beforeSend']||[] ).each(function(index,func){
     			func.call(ajaxOptions,xhr) ;
     		}) ;
     		if( params.beforeSend ){
     			params.beforeSend.call(ajaxOptions,xhr) ;
     		}
     	}
     }
     
 	 $.ajax(ajaxOptions);
 }
jQuery.request._events = {} ;
jQuery.request.addEvent = function( type , func ){
	 jQuery.request._events[type] == jQuery.request._events[type]||[] ;
	 jQuery.request._events[type].push(func) ;
}
 
jQuery.request.defaultErrorHandler = function(xhr, textStatus, errorThrown,url){
	 $.open(Global.contextPath+"/common/error/report500.jsp",570,410,{errorThrown:errorThrown} ) ;
}


/**
 * 数据服务统一调用接口
 * @param {} commandName
 * @param {} params
 * @param {} callback   {success:function(){},error:function(){}} or function(){}//success
 */
jQuery.dataservice = function(commandName , params , callback , reqParams ){
	callback 			= callback||{} ;
	params  			= params||{} ;

	for(var o in params){
		if( typeof params[o]  == 'object'){
			params[o] =  $.json.encode(params[o])  ;
		}
	}
	
	params.CommandName 	= commandName ;
	
	reqParams 			= reqParams||{} ;
	reqParams.data 		= params ;
	reqParams.type		= 'post' ;
	reqParams.noblock 	= reqParams.noblock === false?false:true ;
	reqParams.url 		= commandName? (window.dataServiceUrl||"~/dataservice") :reqParams.url ;
	reqParams.dataType 	= commandName?'json':"text" ;
	//alert(reqParams.url);
	//process callback
	if( callback.success ){
		reqParams.success = callback.success ;
	}
	
	if( callback.error ){
		reqParams.error = callback.error ;
	}
	
	if( jQuery.isFunction(callback) ){
		reqParams.success = callback ;
	}
	jQuery.request(reqParams) ;
}


/*********************
 * common 
 * */
String.prototype.startWith=function(str){     
      var reg=new RegExp("^"+str);     
      return reg.test(this);        
}  

String.prototype.endWith=function(str){     
      var reg=new RegExp(str+"$");     
      return reg.test(this);        
} 

String.prototype.getQueryString = function(name){ //name 是URL的参数名字 
	var reg = new RegExp("(^|&|\\?)"+ name +"=([^&]*)(&|$)"), r; 
	if (r=this.match(reg)) return (unescape(r[2])||"").split("#")[0]; return null; 
}; 


/* fix 表单点击回车提交问题 */
$(function(){
   $(document).find("form").keydown(function(e){
	  var kc = e.keyCode ;
	  if(kc == 13){
		 var $tgt = $(e.target);
		 
		 if (!$tgt.is('input'))return true ;
			 
	 		 if (e && e.preventDefault) {
	 			e.preventDefault();
	 		 } else {
				window.event.returnValue = false;
			 }
			 return false;
		  }
		  return true ;
      }) ;
  }) ;
  

 
/* widget-common */
(function($){
	/**
	 * 控件初始化
	 */
	$.uiwidget = {
		mark:"data-widget",
		options:"data-options",
		validator:"data-validator",
		defaultValue:"defaultValue",
		map:{},
		dependMap:{},
		/**
		 * eg: $.widget.register("combotree",function(){})
		 */
		register:function(){//type ,depend , func
			var type = arguments[0] ;
			var func = null ;
			var depend = null ;
			if( arguments.length == 2 ){
				func = arguments[1] ;
			}else if( arguments.length == 3 ){
				func = arguments[2] ;
				depend = arguments[1] ;
			}
			
			$.uiwidget.map[type] = func ;
			$.uiwidget.dependMap[type] = depend ;
		},
		init:function(options,target){
			var widgetTrack = [] ;
			var pushed = {};
			//format dependMap
			for(var o in $.uiwidget.map){
				_addTypeTrack(o) ;
			}
			
			options = options||{} ;
			options.before && options.before(target) ;
			var cacheType = {} ;
			
			$(widgetTrack).each(function(index,type){
				if( $.uiwidget.map[type] ){
					var selector = $("["+$.uiwidget.mark+"^='"+type+"'],["+$.uiwidget.mark+"*=',"+type+"']",target)
					$.uiwidget.map[type]( selector,target)  ;
				}
			})

			options.after && options.after(target) ;
			
			function _addTypeTrack(o){
				var depend = $.uiwidget.dependMap[o] ;
				if( depend ){//存在依赖
					$(depend).each(function(index,type){
						_addTypeTrack(type) ;
					}) ;
				}
				(!pushed[o]) && widgetTrack.push(o) ;
				pushed[o] = true ;
			}
			
			pushed = null ;
			widgetTrack = null ;
			
		}
	}
	
	$.fn.uiwidget = function(){
		$.uiwidget.init({},this) ;
	}
	
	/**
	 * 浏览器兼容
	 */
	var browserFix_map = {} ;
	$.browserFix = function(el){
		if ($.browser.msie){
			var bowser = "ie" ;
			var version = parseInt($.browser.version, 10) ;
			for(var type in browserFix_map[bowser+"_"+version]||{} ){
				(browserFix_map[bowser+"_"+version]||{})[type]( el ) ;
			}
		}
	}
	
	/**
	 * eg: $.browserFix.register("ie","6","base",function( target ){} ) ;
	 * 
	 */
	$.browserFix.register = function(bowser, version,type,func ){
		if( typeof version == "string" ){
			browserFix_map[bowser+"_"+version] = browserFix_map[bowser+"_"+version]||{} ;
			browserFix_map[bowser+"_"+version][type] = func ;
		}else{
			$(version).each(function(index,item){
				browserFix_map[bowser+"_"+item] = browserFix_map[bowser+"_"+item]||{} ;
				browserFix_map[bowser+"_"+item][type] = func ;
			}) ;
		}
	}
	
	$.fn.browserFix = function(){
		var me = this ;
		setTimeout(function(){
			$.browserFix(me) ;
		},1) ;
	};
	
	$.pageLoad = {before:[],after:[]} ;
	$.pageLoad.register = function(type , func){
		$.pageLoad[type].push(func) ;
	} ;
	
	$(function(){
		$( $.pageLoad.before ).each(function(index,func){
			func() ;
		}) ;
		
		//控件初始化
		$(document.body).uiwidget() ;
		//浏览器兼容
		$(document.body).browserFix() ;
		
		$( $.pageLoad.after ).each(function(index,func){
			func() ;
		}) ;
	})
})(jQuery)

//register dialog
$.uiwidget.register("dialog",function(selector){
	selector.live("click",function(){
		var options = $(this).attr( $.uiwidget.options )||"{}";
		eval(" var jsonOptions = "+options) ;
		var url 	= jsonOptions.url||$(this).attr("href") ;
		var width 	= jsonOptions.width ;
		var height 	= jsonOptions.height ;
		
		var fixOPtions = {} ;
		if($(this)[0].tagName == "A"){
			fixOPtions.requestType = "GET" ;
		}
		fixOPtions.target = this ;

		var id     = $(this).attr("id")||$(this).attr("name");
		var callback = jsonOptions.callback||(window[id+"Callback"]||function(){}) ;
		
		$.open(url , width , height ,jsonOptions,callback,fixOPtions ) ;
		return false ;
	}) ;
}) ;
//register btn-toggle
$.uiwidget.register("btn-toggle",function(selector){
	selector.live("click",function(){
		var options = $(this).attr( $.uiwidget.options )||"{}";
	    eval(" var jsonOptions = "+options);
		var target = jsonOptions.rel;
		
		if( $(this).find('.icon-plus').hasClass('icon-minus')){
			$(target ).hide();	
			$(this).find('.icon-plus').removeClass('icon-minus');
		}else if($(this).find('.icon-plus').length){
			$( target ).show();
		    $(this).find('.icon-plus').addClass('icon-minus');
		}
		
		if( $(this).find('.icon-plus2').hasClass('icon-minus2')){
			$(target ).hide();		
			$(this).find('.icon-plus2').removeClass('icon-minus2');
		}else if($(this).find('.icon-plus2').length){
			$( target ).show();
		    $(this).find('.icon-plus2').addClass('icon-minus2');
		}
		return false ;
	}) ;
	//init
	selector.each(function(){
		var options = $(this).attr( $.uiwidget.options )||"{}";
	    eval(" var jsonOptions = "+options);
		var target = jsonOptions.rel;
		
		if( $(this).find('.icon-plus').hasClass('icon-minus')){
			$(target ).show();
		}else{
			$( target ).hide();
		}
		if( $(this).find('.icon-plus2').hasClass('icon-minus2')){
			$(target ).show();
		}else{
			$( target ).hide();
		}
	}) ;
}) ;
//register ajaxForm

/**
 * data-widget="ajaxlink" data-options="{action:'',before:function(req){return true;},success:function(resp){}}"
 */
$.uiwidget.register("ajaxlink",function(selector){
	selector.live("click",function(){
		var options = $(this).attr( $.uiwidget.options )||"{}";
		eval(" var jsonOptions = "+options) ;
		
		var action = jsonOptions.action||$(this).attr("href") ;
		var type   = jsonOptions.type||"GET" ;
		
		jsonOptions.before = jsonOptions.before||function(){return true ;} ;
		jsonOptions.success = jsonOptions.success||function(){return true ;} ;
		var data = {} ;
		if( jsonOptions.before( data ) ){//doSubmit
        	$.request({
        		type:type ,
        		url:action ,
        		data:data,
        		success: jsonOptions.success
        	}) ;
        }
		
		return false ;
	}) ;
}) ;

jQuery(function($){
	bui.panel();
	//bui.toggle();
})

var bui = {
	panel : function(){
		/**
		 * Slide toggle for panel down
		 * */
		 $('.panel-head .tabs').parent().find('.toggle').remove(); 
		 $('.panel-head .toggle').each(function(){
		 	$(this).click(function(){
				 $(this).toggleClass('toggle-hide').parents(".panel:first").find('.panel-content').slideToggle(300);
				 return false; 
			 });
		 }) ;
		/**
		 * Slide toggle for panel left
		 * */
		var panelNextClass;
		 $('.panel-head .toggle-left').toggle(function(){
			var $parentSpan = $(this).parent().parent().parent(),
				$panel = $(this).parents('.panel'),
				$panelNextClass = $parentSpan.next().attr('class');
				panelNextClass = $panelNextClass;
				
				$(this).addClass('toggle-hide');
				$parentSpan.addClass('span1')
						.next().removeClass()
							.addClass('span11');
				$panel.addClass('panel-collapsed').find('.panel-content').hide();
				return false; 
		 },function(){
			var $parentSpan = $(this).parent().parent().parent(), 
				$panel = $(this).parents('.panel');				
				
				$(this).removeClass('toggle-hide')
				$parentSpan.removeClass('span1')
						.next().removeClass()
							.addClass(panelNextClass);
							
				$panel.removeClass('panel-collapsed').find('.panel-content').show();
				return false; 
		 });
		 /**
		 * Slide toggle for panel right
		 * */
		var panelNextClass;
		 $('.panel-head .toggle-right').toggle(function(){
			var $parentSpan = $(this).parent().parent().parent(),
				$panel = $(this).parents('.panel'),
				$panelNextClass = $parentSpan.prev().attr('class');
				panelNextClass = $panelNextClass;
				
				$(this).addClass('toggle-hide');
				$parentSpan.addClass('span1')
						.prev().removeClass()
							.addClass('span11');
				$panel.addClass('panel-collapsed').find('.panel-content').hide();
				return false; 
		 },function(){
			var $parentSpan = $(this).parent().parent().parent(), 
				$panel = $(this).parents('.panel');				
				
				$(this).removeClass('toggle-hide')
				$parentSpan.removeClass('span1')
						.prev().removeClass()
							.addClass(panelNextClass);
							
				$panel.removeClass('panel-collapsed').find('.panel-content').show();
				return false; 
		 });
	}
}

/*IE6下浏览器执行resize时死掉问题*/
$.execResize = function(flag , func ){//执行resize
	var version = parseInt( $.browser.version, 10 );  
	if(version < 7 ){
		window[flag] = window[flag]||0 ;
        var now = new Date().getTime();
		if (now - window[flag] > 300) { 
			window[flag] = now;  
			func() ;
		}
	}else{
		func() ;
	}
}

/*组装url*/
function buildUrl(url, paramObject) {
    if (paramObject) {
        var queryString = "";
        var attrs = paramObject.attributes;
        for (var attr in paramObject) {
            var name = attr;
            var value = paramObject[attr];

            if (queryString.length > 0) { queryString += "&"; }
            queryString += name + "=" + encodeURI(value);
        }
        if (queryString.length > 0) {
            if (url.indexOf("?") >= 0) {
                url = url + "&" + queryString;
            } else {
                url = url + "?" + queryString;
            }
        }
    }
    return url;
}


//handle ajax 401
$(document).ready(function () {
    $(document).ajaxError(function (event, jqxhr, settings) {
        if (jqxhr.status == 401) {
            //tryLoginFromSSO(function (identity) { $.ajax(settings) }, gotoSSOLogin);
            gotoLocalLogin();//local login
        }
    });

    var localLoginUrl = Global.contextPath + "/common/login/login_popup.jsp?returnUrl=login_popup_callback.jsp";
    // sso 1.0
    var checkSSOLoginUrl = Global.contextPath + "/openid/islogin?return_url=common/login/check_sso_login_callback.jsp";
    var ssoLoginUrl = Global.contextPath + "/openid/login?openid.ex.ui_mode=popup&return_url=common/login/login_popup_callback.jsp"
    // sso 2.0
    //var checkSSOLoginUrl = Global.contextPath + "/ssoclient/islogin?return_url=common/login/check_sso_login_callback.jsp";
    //var ssoLoginUrl = Global.contextPath + "/ssoclient/login?openid.ex.ui_mode=popup&return_url=common/login/login_popup_callback.jsp"
    
    function tryLoginFromSSO(loginHandle, unLoginHandle, errorHandle) {
        if (!loginHandle || !unLoginHandle) {
            throw new Error("loginHandle和unLoginHandle不能为空!");
        }
        errorHandle = errorHandle || function () { alert("未知错误，请稍后再试！") };
        var isSSOLoginError = true;
        //wrap callback
        ssoLoginBack = function (isSuccess, identity) {
            isSSOLoginError = false;
            if (isSuccess) {
                loginHandle(identity);
            } else {
                unLoginHandle();
            }
        }

        var iFrameObj = document.createElement('iframe');
        iFrameObj.src = checkSSOLoginUrl;
        document.body.appendChild(iFrameObj);
        $(iFrameObj).load(function () {
            document.body.removeChild(iFrameObj);
            //TODO 通过在回调中设置某个属性判断是否登录成功
            if (isSSOLoginError) {
                errorHandle();
            }
        });
    }

    function gotoLocalLogin() {
        $.open(localLoginUrl, 460, 250, null, null);
    }

    function gotoSSOLogin() {
        $.open(ssoLoginUrl, 460, 250, null, null);
    }
});