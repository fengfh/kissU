if( typeof Portal == 'undefined'){
	window['Portal'] = function(){} ;
}

Portal.restConfig = {
	getBaseInfo:"/rest/portal/baseinfo",
	getPagecreator:"/rest/portal/pagecreator",
	getPreconfig:"/rest/portal/preconfig",
	getMenus:"/rest/portal/menus",
	getShortcuts:"/rest/portal/shortcut",
	getLayouts:"/rest/portal/getlayout",
	saveMenu:"/rest/portal/savemenu",
	deleteMenu:"/rest/portal/deletemenu",
	savePortal:"/rest/portal/saveportal",
	sysmodules:"/rest/portal/sysmodules",
	installmodules:"/rest/portal/installmodules",
	
	saveDesk:"/rest/portal/saveDesk",
	loadDeskItems:"/rest/portal/loadDeskItems",
	loadMarketApps:"/rest/portal/loadMarketApps",
	loadMarketAppFunctions:"/rest/portal/loadMarketAppFunctions",
	loadMarketWidgets:"/rest/portal/loadMarketWidgets",
	loadDeskStart:"/rest/portal/loadDeskStart",
	loadDeskAppFunctions:"/rest/portal/loadDeskAppFunctions",
	
	loadDeskTheme:"/rest/portal/loadDeskTheme",
	saveDeskTheme:"/rest/portal/saveDeskTheme"
} 

Portal.services = {
	getHashMenu:function(){
		if( Config.isConfig ){
			return jQuery.query.get("page") ;
		}else{
			var initMenuid = "" ;
			var hash = window.location.hash ;
			if( hash ){
				initMenuid = hash.split("#")[1] ;
			}
	
			return initMenuid ;
		}
		//hash 
		
		//param
		//return jQuery.query.get("page") ;
	},
	setHashMenu:function(menuId , targetMenuId){
		if( Config.isConfig ){
			var pg = jQuery.query.get("page") ;

			if(pg != (targetMenuId||menuId) ){
				var url = window.location.pathname+jQuery.query.set("page", targetMenuId||menuId).toString();
				window.location.href = url;
				return true ;
			}
	
			return false ;
		}else{
			window.location.hash = targetMenuId||menuId ;
			return false ;
		}
	},
	//根据相关配置，获取页面跳转目标地址
	//http://localhost/bingo-portal-web/portal/index.html?portalCode=testsdf&layout=iaas
	install:function(portalCode){
		window.location.href = Config.contextPath+"/portal/install/install.html?portalCode="+portalCode ;
	},
	forward:function(portalCode,layout){
		var portalCode = Portal.services._parsePortalCode(portalCode) ;
	
		if(! Portal.services.getBaseInfo(portalCode) ){
			Portal.services.install(portalCode) ;
			return ;
		};
	
		Config.portalCode = portalCode ;
		var layout = window.location.href.getQueryString('layout')||Portal.baseInfo.layoutId ;
		var config = window.location.href.getQueryString('config') ;
		var forwardUrl = "" ;
		if( layout ){
			$( Portal.services.getLayouts() ).each(function(){
				if( this.layoutId == layout) {
					forwardUrl = this.url ;
				}
			}) ;
		}
		var split = "" ;
		if( null == forwardUrl ) {
			split = "?"
		}else{
			split = (forwardUrl.indexOf("?")==-1)?"?":"&" ;
		}
		forwardUrl = forwardUrl||"" ;
		if (portalCode != 'default'){			
			forwardUrl += split+"portalCode="+encodeURIComponent(portalCode) ;
			split = "&" ;
		}
		if( config ){
			forwardUrl += split+"config="+true ;
		}
		window.location.href = Config.contextPath+"/"+ forwardUrl ;
	},
	getBaseInfo:function(portalCode){
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		var baseinfo = Portal.baseInfo||Portal.rest.json(Config.contextPath+Portal.restConfig.getBaseInfo,{portalCode:portalCode}) ;
		Portal.baseInfo = baseinfo ;
		return baseinfo ;
	},
	getPageCreator:function(portalCode){
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		Portal.menuPlugins = Portal.menuPlugins||Portal.rest.json(Config.contextPath+Portal.restConfig.getPagecreator,{portalCode:portalCode}) ;
		return Portal.menuPlugins ;
	},
	getPreConfig:function(portalCode){
		return null;
		/*
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		var perconfig = Portal.rest.json(Config.contextPath+Portal.restConfig.getPreconfig,{portalCode:portalCode}) ;
		return perconfig ;*/
	},
	getMenus :function(portalCode){
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		var isConfig = window.location.href.getQueryString("config")?true:false ;
		Portal.menus = Portal.menus||Portal.rest.json(Config.contextPath+Portal.restConfig.getMenus,{portalCode:portalCode,isConfig:isConfig}) ;
		return Portal.menus||[] ;
	},
	getShortcut :function(portalCode){
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		var isConfig = window.location.href.getQueryString("config") ;
		Portal.shortcut = Portal.shortcut||Portal.rest.json(Config.contextPath+Portal.restConfig.getShortcuts,{portalCode:portalCode,isConfig:isConfig}) ;
		return Portal.shortcut||[] ;
	},
	saveOrUpdate:function(menu){
		var _menu = {} ;
		var menuId = null ;
		
		var _cacheMenu = window.cacheMenu ;
		if(window.Index){
			_cacheMenu = Index.menu.mapCacheMenu ;
		}
		
		if( menu.pageid ){
			_menu 		     = _cacheMenu[ menu.pageid ] ;
			_menu.url 		 = menu.url ;
			_menu.pluginCode = menu.code ;
			var js = [menu.pageid] ;
			/*for(var o in _menu){
				js.push(o+" -- "+_menu[o]);
			}
			alert( js.join("\n\r") ) ;*/
		}else{
			for(var o in menu){
				_menu[o] = _menu[o]||menu[o]||'' ;
			}
		}
		
		_menu.portalCode = Config.portalCode ;
		
		_cacheMenu[ menu.pageid ] = _menu ;
		var menuId = Portal.rest.json(Config.contextPath+Portal.restConfig.saveMenu, _menu ) ;
		return menuId ;
	},deleteMenu:function(menuId){
		var menuId = Portal.rest.json(Config.contextPath+Portal.restConfig.deleteMenu, {menuId:menuId} ) ;
		window.top.location.reload(true) ;
	},order:function(menus){
		Portal.rest.json(Config.contextPath+Portal.restConfig.orderMenus, {menus:menus}) ;
	},clearCache:function(portalCode) {
		Portal.rest.json(Config.contextPath+Portal.restConfig.clearCache, {portalCode:portalCode}) ;
	},savePortalInfo:function(portal,url,callback){
		Portal.rest.json(Config.contextPath+Portal.restConfig.savePortal, portal ) ;
		return ;
	},getLayouts :function(portalCode){
		portalCode = Portal.services._parsePortalCode(portalCode) ;
		var layouts = Portal.layouts||Portal.rest.json(Config.contextPath+Portal.restConfig.getLayouts,{portalCode:portalCode} ) ;
		return layouts;
	},_parsePortalCode:function(portalCode){
		return portalCode||window.location.href.getQueryString('portalCode')||window.top.Config.portalCode||"default"  ;
	},
	///////////////////////////only portal///////////////////////////////
	/**
	 * 加载系统配置模块
	 */
	loadSysModules:function(portalCode){
		var sysModules = Portal.rest.json(Config.contextPath+Portal.restConfig.sysmodules ,{portalCode:portalCode} ) ;
		return sysModules ;
	},
	installSysModules:function( ids ){
		Portal.rest.json(Config.contextPath+Portal.restConfig.installmodules , ids ) ;
	}
}

Portal.menuCache 	= {} ;
Portal.menus 		= null ;
Portal.menuPlugins	= null ;
Portal.baseInfo  	= null ;
Portal.layouts      = null ;
Portal.ls           = {} ;
Portal.adapter      = null ;
//load xml from client
function loadXmlPortalConfig(params){
	params = params||{} ;
	$.ajax({
	    url : Config.contextPath+"/portal/portal.xml" ,
	    type: 'GET',
	    dataType:  "xml",//($.browser.msie) ? "text" :
	    timeout: 1000,
	    cache:false,
	    async:false,
	    error: function(xml){
	    },
	    success: function(xml){
	    	 //load Config rest
	    	 $(xml).find("config").find("rest").each( function(){
	    	 	  $(this).children().each(function(){
	    	 	  	  Portal.restConfig[this.tagName] = $(this).text() ;
	    	 	  }) ;
	    	 } ) ;
	    	 
	    	 //adapter
	    	 $(xml).find("config").find("adapter").each( function(){
	    	 	  var func = $(this).text() ;
	    	 	  eval(" Portal.adapter =  " + func ) ;
	    	 } ) ;
	    	 
	    	 var modules = {} ;//load
	    	 $(xml).find("config").find("load").each( function(){
	    	 	  $(this).children().each(function(){
	    	 	  	 var t = $(this).text() ;
	    	 	  	 if( t == 'xml' ){
	    	 	  	 	modules[this.tagName] = true ;
	    	 	  	 }
	    	 	  	 Portal.ls[this.tagName] = t ;
	    	 	  }) ;
	    	 } ) ;
	    	 
	    	 
	    	 
	    	 //init baseInfo
		     if(modules.getBaseInfo){
			       $(xml).find('baseinfo').each(function(){
			       		Portal.baseInfo = {} ;
			       		$(this).children().each(function(){
		    	 	  	  	Portal.baseInfo[this.tagName] = $(this).text() ;
		    	 	  	}) ;
			       }) ;
		     }
		     
		     //init shortcut
		     if(modules.getShortcuts){
	       	   var shortcuts = [] ;
		       $(xml).find('shortcut').each(function(){
		       		var shortcut = {} ;
		       		$(this).children().each(function(){
		    	 	  	  shortcut[this.tagName] = $(this).text() ;
		    	 	}) ;
		       		shortcuts.push(shortcut) ;
		       }) ;
		       Portal.shortcut = shortcuts ;
	         }
	         
	         //init menus
		     if(modules.getMenus){
			       var menus = [] ;
			       $(xml).find("menus").find('menu').each(function(){
			       		var menu = {
				       		id:$(this).attr('id'),
			   				title:$(this).attr('title'),
			   				url:$(this).attr('url'),
			   				target:$(this).attr('target'),
			   				pluginCode:$(this).attr('pluginCode')
		   				} ;
			       		var pid = null ;
			       		if( $(this).parent('menu')[0] ){//childrens
			       			pid = $(this).parent('menu').attr('id') ;
			       			menu.pid = pid ;
			       		}
			       		menus.push(menu) ;
			       }) ;
			       Portal.menus = menus ;
		    }
		    
		    //init layouts
		    if(modules.getLayouts){
	       		var layouts = [] ;
		        $(xml).find("layouts").find('layout').each(function(){
		       		var layout = {} ;
		       		$(this).children().each(function(){
			    	 	layout[this.tagName] = $(this).text() ;
			    	}) ;
		       		layouts.push( layout ) ;
		       }) ;
		       Portal.layouts = layouts ;
	        }
	        
	        //init plugins
	       if(modules.getPlugins){
		       var plugins = [] ;
		       $(xml).find('plugins').find('plugin').each(function(){
		       		var plugin = {} ;
		       		$(this).children().each(function(){
			    	 	plugin[this.tagName] = $(this).text() ;
			    	}) ;
		       		plugins.push( plugin ) ;
		       }) ;
		       Portal.menuPlugins = plugins ;
	       }
	    }
	});
}

loadXmlPortalConfig() ;

Portal.rest = {
	jsonp:function(url , params , success ,error){
		success = success||function(){} ;
		error   = error||function(e){
			alert("执行URL{"+url+"}出现异常："+e) ;
		} ;
		jQuery.ajax({
			url: url,
			dataType: 'jsonp',
			success:function(response){     
               success(response) ;
            },
            error:function(xhr, ajaxOptions, thrownError){ 
            	error() ;
            }
		});
	},
	json:function(url , params , success ,error){
		success = success||function(){} ;
		error   = error||function(e){
			alert("执行URL {"+url+"} 出现异常："+e) ;
		} ;
		var result = null ;
		var split = url.indexOf('?') != -1?'&':'?' ;
		params = params||{} ;
		jQuery.ajax({
			cache:"false",
            type:"POST",
            async: false,
            url: url + split + new Date().getTime(),
            data:params, 
            success:function(response){  
               //适配器转换格式
               if( Portal.adapter ){
               		response = Portal.adapter(response) ;
               }
               success(response) ;
               result = response ;
            },
            error:function(xhr, ajaxOptions, thrownError){ 
            	error() ;
            }
        });
		return result ;
	}
}