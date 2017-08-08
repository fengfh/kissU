/**
 * 插件处理JS
 */
 var Plugin = function(){
 	var __plugins   = null ;
 	var __curPlugin = null ;//当前插件
 	
 	var setTempalte   = '<div class="alert alert-info">此菜单<b>{menuName}</b>已经设置为<b>{title}</b>，您可以修改该操作：</div>' ;
 	var unsetTemplate = '<div class="alert alert-info">该菜单<b>{menuName}</b>还未进行任何设置操作，您可以进行如下操作：</div>' ;
 	
 	var _options = {} ;
 	
 	this.add = function(options){
 		_options = $.extend({},_options,options) ;
 	}
 	
 	/**
 	 * 插件渲染
 	 */
 	this.render = function(plugins , cont){
 		var self = this ;
 		var html = [] ;
 		__plugins = plugins ;
 		var template = null ;
 		
 		 $(plugins).each(function(){
 		 		var _plugin = this ;
 		 		if( _plugin.filter ){
 		 			if( !self.filter( _plugin.filter ) ){
 		 				return ;
 		 			};
 		 		}
 		 		
 		 		if( _plugin.status == 'hidden' ) return ;
 		 		
 		 		if( pluginCode && pluginCode == _plugin.code ){
 		 			template = setTempalte.replace("{menuName}",menuName).replace("{title}",_plugin.title) ;
 		 		}
 		 		html.push( createPluginLink(_plugin) ) ;
 		 }) ;
 		 
 		 if(!template){
 		 	template = unsetTemplate.replace("{menuName}",menuName) ;
 		 }else{
 		 	html.push( CreatenullpageLink() ) ;
 		 }
 		 
 		 var div = cont||'pluginLinks' ;
 		 $('#'+div).html( html.join('') ) ;
 		 $('#pluginHeader').html( template ) ;
 		 
 		 $('.plugin_links').click( function(){
			  var code = $(this).attr('code');
			  if( !code ){
			  	 window.top.Portal.config.getCurrentMenu() .pluginCode = '' ;
			  	  self.callback('', true) ;
			  	  return ;
			  }
 		 	  __curPlugin = self.getPluginByCode(code) ;
 		 	  __curPlugin.options = typeof(__curPlugin.options)=='string'?eval('('+__curPlugin.options+')'):__curPlugin.options ;
 		 	  switch( __curPlugin.target ){
 		 	  	case 'div':
 		 	  		Plugin.win.div( __curPlugin ) ;
 		 	  		break;
 		 	  	case 'current':
 		 	  		Plugin.win.current( __curPlugin ) ;
 		 	  		break ;
 		 	  	case 'open':
 		 	  		Plugin.win.open( __curPlugin ) ;
 		 	  		break ;
 		 	  	default:
 		 	  		Plugin.win.open( __curPlugin ) ;
 		 	  		break ;
 		 	  }
 		 } ) ;
 	}
 	
 	/**
 	 * 插件保存信息回调
 	 * {\
 	 * 		code :
 	 * 		page_id :
 	 * 		url :
 	 * }
 	 */
 	this.callback = function( params  , isClear ){//url , object_id){
 		if( params.pageid ){
 			/*var currentMenu = window.top.contentMenu||contentMenu ;//当前编辑菜单
	 		currentMenu.url = params.url ;
	 		currentMenu.pluginCode = params.code ;
			window.top.cacheMenu[params.pageid] = currentMenu ;*/
 			var menuId = window.top.Portal.services.saveOrUpdate( params ) ;
 			
 			Plugin.win.close() ;
 			
 			//window.top.location.reload(true) ;
 			//更新菜单
	 		//if(menuId){
	 		//	window.location.href = window.top.jQuery.utils.parseUrl(params.url) ;
	 		//}
 		}else{
	 		var currentMenu =  window.top.Portal.config.getCurrentMenu() ;//当前编辑菜单
	 		currentMenu.url = params.url||'' ;
	 		currentMenu.pluginCode = params.code||'' ;
	 		if(isClear){
	 			currentMenu.pluginCode = "" ;
	 		}
			window.top.Index.menu.mapCacheMenu[menuId] = currentMenu ;
	 		var menuId = window.top.Portal.services.saveOrUpdate( currentMenu ) ;
	 		Plugin.win.close() ;
	 		if(menuId){
	 			//if( currentMenu.url ){
	 			//	window.location.href = window.top.jQuery.utils.parseUrl(currentMenu.url) ;
	 			//}else{
	 				window.top.location.reload(true) ;
	 			//}
	 		}
 		}
 	}
 	
 	this.close = function(){
 		Plugin.win.close() ;
 	}
 	
 	this.filter = function(filters){
 		if(!filters) return true ;
 		if( typeof filters == 'string' ){
 			eval( 'filters = '+filters) ;
 		}
 		for(var o in filters){
 			if(_options[o] != filters[o]) return false ;
 		}
 		return true ;
 	}
 	
 	this.getPluginByCode = function(code){
 		 var result = null ;
 		 $(__plugins).each(function(){
 		 	var _plugin = this ;
 		 	if( _plugin.code == code ) result = _plugin ;
 		 }) ;
 		 return result ;
 	}
 	
 	
 	function CreatenullpageLink(){
		var html = [] ;
		html.push('<a href="javascript:void(0)" id="confirmBtn" class="linkbtn plugin_links btn" code="">');
		html.push('	<span style="text-align: center;">清除现有设置</span>');
		html.push('</a>	<br/><br/>');
		return html.join('') ;
	}
 	
 	function createPluginLink(_plugin){
		var html = [] ;
		html.push('<a href="javascript:void(0)"  id="confirmBtn" class="linkbtn plugin_links btn" code="'+_plugin.code+'">');
		html.push('	<span style="text-align: center">'+_plugin.title+'</span>');
		html.push('</a>	<br/><br/>');
		return html.join('') ;
	}
 }
 
 Plugin.win = {
 	type:null,
 	instance:null,
 	/**
 	 * Div层打开
 	 * @param {} _plugin
 	 */
 	div:function(_plugin){
 		 var currentMenu =  window.top.Portal.config.getCurrentMenu() ||contentMenu ;//当前编辑菜单
 		 Plugin.win.type = 'div' ;
 		 var configUrl =  _plugin.configUrl  ;
 		 var split = configUrl.indexOf("?")==-1?"?":"&" ;
 		 if(url == 'javascript:void(0)')url = '' ;
 		 configUrl = configUrl+split
 		    +"currentCode=" + currentMenu.pluginCode
 		 	+"&code="+_plugin.code
 		 	+"&pageid="+ menuId
 		 	+"&content="+encodeURIComponent(url||'')+
 		 	"&callback="+encodeURIComponent('http://'+window.location.host+Config.contextPath+"/pagecreator/callback");
 		 configUrl = jQuery.utils.parseUrl(configUrl) ;
 		 //alert( configUrl ) ;
 		 var params = $.extend({},{url:configUrl},_plugin.options) ;
 		 window.parent.Portal.config.dialog.show(params) ;
 	},
 	/**
 	 * Window.open打开
 	 * @param {} _plugin
 	 */
 	open:function(_plugin){
 		
 		Plugin.win.type = 'open' ;
 		
 		var configUrl = _plugin.configUrl  ;
 		var split = configUrl.indexOf("?")==-1?"?":"&" ;
 		if(url == 'javascript:void(0)')url = '' ;

 		configUrl = configUrl+split+
 					"code="+_plugin.code+
 					"&config=true"+
 					"&pageid="+ menuId+
 					"&content="+encodeURIComponent(url||'')+
 					"&callback="+encodeURIComponent('http://'+window.location.host+Config.contextPath+"/pagecreator/callback");
  		configUrl =  jQuery.utils.parseUrl(configUrl) ;
		var name 		= _plugin.title ;
		var iWidth		= _plugin.options?_plugin.options.width: 600 ;
		var iHeight		= _plugin.options?_plugin.options.height:400 ;
		var iTop 		= (window.screen.availHeight-30-iHeight)/2	 ;
		var iLeft 		= (window.screen.availWidth-10-iWidth)/2  	 ;
		Plugin.win.instance =
		  window.open(configUrl,name,'height='+iHeight+',width='+iWidth+',top='+iTop+',left='+iLeft+',toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,status=no');
		Plugin.win.instance.focus();
		return Plugin.win.instance ;
 	},
 	/**
 	 * 本窗口打开
 	 * @param {} _plugin
 	 */
 	current:function(_plugin){
 		var currentMenu = window.top.Portal.config.getCurrentMenu() ||contentMenu ;//当前编辑菜单
 		var menuId = currentMenu.id ;
 		Plugin.win.type = 'current' ;
 		var configUrl = _plugin.configUrl  ;
 		var split = configUrl.indexOf("?")==-1?"?":"&" ;
 		if(url == 'javascript:void(0)')url = '' ;
 		configUrl = configUrl+split+
 			"code="+_plugin.code+
 			"&pageid="+ menuId+
 			"&config=true"+
 			"&content="+encodeURIComponent(url||'')+
 			"&callback="+encodeURIComponent('http://'+window.location.host+Config.contextPath+"/pagecreator/callback");
 		 
 		var options = _plugin.options ;
 		for(var o in options){
 			configUrl = configUrl+"&"+o+"="+encodeURIComponent(options[o]) ;
 		}
 		configUrl = jQuery.utils.parseUrl(configUrl) ;
 		window.location.href = configUrl  ;
 	},
 	close:function(){
 		switch(Plugin.win.type ){
 			case 'div':
 				window.parent.Portal.config.dialog.close() ;
 				break ;
 			case 'open':
 				Plugin.win.instance.close() ;
 				break ;
 			case 'current':
 				break;
 		}
 	}
 }
 