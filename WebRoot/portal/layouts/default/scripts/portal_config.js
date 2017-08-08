/**
 * 页面布局配置
 * Portal.config = {
 * 		renderMenu ://顶层菜单渲染，添加图标和事件
 * 		createConfigMenu：创建菜单配置项
 * 		renderOpMenu：渲染添加菜单和菜单排序
 * 		leftMenuEventRender：左侧菜单添加事件
 * 		opMenuShow：下拉操作菜单显示
 * 		opMenuHide:下拉操作菜单隐藏
 * }
 * 
 * Portal.config.event = {
 * 		addTopMenu: //添加顶级节点事件
 * 		setMenuOrder：菜单排序事件
 * 		createSubMenu：创建子菜单
 * 		renameMenu:重命名菜单
 * 		deleteMenu：删除菜单
 * 		editMenu：编辑菜单 
 * 		addMenuAction：添加菜单操作方法
 * 		renameMenuAction：重命名菜单操作
 * }
 * 
 * Portal.config.dialog = {
 * 		show：显示弹出对话框
 * 		menu：显示菜单重命名弹出对话框
 * 		close：关闭对话框
 * 		callback：回调弹出对话框
 * }
 * 
 * Portal.services = {
 * 		saveOrUpdate：更新或保存菜单
 * 		deleteMenu：删除菜单
 * }
 */
(function(){
	if( typeof Portal == 'undefined'){
		window.Portal = function(){}
	}
	
	Index.menu.addEvent("renderTopAfter",function(){
		Portal.config.renderMenu() ;
	}) ;
	
	Index.menu.addEvent("renderLeftAfter",function(){
		$(portal_config.left_menu_selector).css("position","relative")
			.append('<div class="icon-play-circle"></div>').css({'line-height':'20px'}) ;
				//.append('<img src="'+_bip_+'images/down.gif" border="0"></img>').css('line-height','20px') ;
			$(portal_config.left_menu_selector).find('.icon-play-circle').css({
				'position':'absolute',
				right:'6px',
				top:'6px'
			});
	}) ;
	
	$( function(){
		Portal.config.createConfigMenu() ;
	} ) ;
	
	var _bip_ = Config.contextPath+"/portal/" ;
	
	var portal_config  = {
		top_menu_selector:".navbar ul.nav li",
		menu_text_selector:".menu-text",
		left_menu_selector:"#sidebar ul.rootmenu li a"
	}
	
	Config.pluginConfig = Config.contextPath+'/portal/views/plugin_config.html',
	Config.menuConfig	= Config.contextPath+'/portal/views/menu_config.html',
	Config.orderConfig	= Config.contextPath+'/portal/views/order.html' ;
	
	var portalCode = Portal.services._parsePortalCode() ;
	Config.portalCode 	= portalCode ;
	
	
	function getCacheMenu(){
		return Index.menu.mapCacheMenu ;
	}
	
	
	Portal.config = {
		params:{},
		//渲染菜单为可配置
		renderMenu:function(arg1, menuId){
	
			var tcm = portal_config.top_menu_selector ;
			var lcm = portal_config.left_menu_selector ;
			
			var custom = menuId?'[menuid='+menuId+']':"" ;
			tcm = tcm.replace("{custom}",custom) ;
			
			//top select
			var selector = $(tcm) ;
			selector.css("position","relative")
			.append('<div class="icon-white icon-download"></div>').css({'line-height':'20px'}) ;
				//.append('<img src="'+_bip_+'images/down.gif" border="0"></img>').css('line-height','20px') ;
			selector.find('.icon-download').css({
				'position':'absolute',
				right:'6px',
				top:'13px'
			});
			
			//left selector
			menuId || Portal.config.leftMenuEventRender(lcm) ;
			
			selector.mouseover(function(){
				//获取当前菜单ID
				var menuId = $(this).attr('menuId') ;
				Portal.config.params['curMenuId'] = menuId ;
				Portal.config.params['curMenu'] = getCacheMenu()[menuId] ;
				
				//if( !$(this).hasClass('active') )return ;
				
				Portal.config.opMenuShow( $(this)  ) ;
			}).click( function(e){
				//e.stopPropagation() ;
				$(selector).parent().removeClass('current') ;
				$(this).parent().addClass('current').css('line-height','24px') ;
				Portal.config.opMenuShow( $(this)  ) ;
			} ) ;
			
			if($('.op_menu table').length<=0)Portal.config.renderOpMenu() ;
		},
		createConfigMenu:function(){
			var html = [] ;
			html.push('<div id="config_menu" class="config_menu" style="display:none;" >');//style="display:none;"
			
			html.push('  <ul class="dropdown-menu" style="position:relative;display:block;top:0px;">') ;
			html.push('	<li event="createSubMenu"><a href="#">创建子页面</a></li>') ;
			html.push('	<li event="editMenu"><a href="#">编辑页面</a></li>') ;
			html.push('	<li event="renameMenu"><a href="#">重命名</a></li>') ;
			html.push('	<li class="divider"></li>') ;
			html.push('	<li event="deleteMenu"><a href="#">删除此项</a></li>') ;
			html.push('	<li event="setMenu" id="setMenu"><a href="#">功能配置</a></li>') ;
			html.push('  </ul>') ;
			
	       	html.push('</div>') ;
	       	html.push('<iframe id="config_menu_iframe" src="" style="position:absolute;display:none;"></iframe>') ;
	       	$(document.body).append(html.join('')) ;
	       	
	       	$('.config_menu').mouseleave( function(e){
	       		 Portal.config.opMenuHide() ;
	       	 } ) ;
	
	        $('.config_menu li') 
	            .mouseout( function(e){ 
	            	$(this).removeClass('over') ;
	             }).mouseover( function(e){
	 		    	$(this).addClass('over'); 
	 		    }).click( function(){
					var event = $(this).attr('event');
					Portal.config.event[event]( Portal.config.params['curMenuId']) ;
					Portal.config.opMenuHide() ;
				}) ;
	        
	        $(document.body).click( function(){$('#config_menu').hide();} ) ;
		},
		//渲染操作菜单
		renderOpMenu:function(){
			
				var html = [] ;
				html.push('<table class="op_menu" style="width:50px;display:inline;">') ;
				html.push('	<tr>') ;
				html.push('		<td><i  onclick="Portal.config.event.addTopMenu()" class="op-menu-action icon-plus icon-white" title="添加菜单"></i></td>') ;
				html.push('		<td><i onclick="Portal.config.event.setMenuOrder()" class="op-menu-action icon-indent-right icon-white" title="菜单显示顺序设置"></i></td>') ;
				//html.push('		<td><img  style="cursor:pointer;"  onclick="Portal.config.event.addTopMenu()" src="'+_bip_+'images/addition.gif"  alt="添加菜单"/></td>') ;
				//html.push('		<td><img  style="cursor:pointer;" style="width:16px;height:16px;"  onclick="Portal.config.event.setMenuOrder()" src="'+_bip_+'images/icon_menu_order.gif" alt="菜单显示顺序设置" /></td>') ;
				html.push('	</tr>') ;
				html.push('</table>') ;
				
				var index = $(portal_config.top_menu_selector).parent().find("li").length +1  ;
		
				var li = [] ;
				li.push('<li class="op-menu-container"> ');
				li.push('</li>');
				
				$(li.join("")).appendTo( $(portal_config.top_menu_selector).parent() ).append(html.join('')) ;
				
			
		},leftMenuEventRender:function(selector){
			$(selector).live('mouseover',function(e){
				var menuId = $(this).attr('menuid');
				var el = $(this).get(0) ;
				var html = el.innerHTML ;
				curMenuId = Portal.config.params['curMenuId'] = $(this).attr('menuid');
				Portal.config.params['curMenu'] = getCacheMenu()[menuId] ;
				window.curEl = this ;
				Portal.config.opMenuShow( $(el) ,'left') ;
			}).live('mouseout',function(e){
				curMenuId = Portal.config.params['curMenuId'] = $(this).attr('menuid');
				Portal.config.params['curMenu'] = getCacheMenu()[curMenuId] ;
				window.curEl = this ;
			}).live('mousedown',function(e){
				Portal.config.params['curMenuId'] = $(this).attr('menuid');
				Portal.config.params['curMenu'] = getCacheMenu()[$(this).attr('menuid')] ;
				window.curEl = this ;
			}).live('click',function(e){
				/*var menuId = $(this).attr('menuId');
				var el = $(this).get(0) ;
				window.curEl = this ;
				Portal.config.params['curMenuId'] = $(this).attr('menuid');
				Portal.config.params['curMenu'] = getCacheMenu()[$(this).attr('menuid')] ;
				Portal.config.opMenuShow( $(el) ,'left') ;
				
				var ris = document.getElementsByName('rightImg') ;
				if(ris){
					for(var i=0 ;i<ris.length ;i++){
						var ri = ris[i] ;
						ri.style.display = 'none' ;
					}
				}
				
				var a = el.getElementsByTagName('A')[0]||el.getElementsByTagName('span')[0] ;
				
				window.curText = $(a).text();
				var html = a.innerHTML ;
				if(html.indexOf('right.gif')!=-1){
					var imgs = el.getElementsByTagName('IMG') ;
					var img = imgs[ imgs.length-1 ] ;
					img.style.display = '' ;
				}else{
					var img = '<img align=absmiddle name="rightImg" src="'+_bip_+'images/config/right.gif" border="0">' ;
					a.innerHTML = html+img ;
				}*/
			}) ;
		},
		getCurrentMenu:function(){
			var curMenuId = Portal.config.params['curMenuId'] ;
			var menu = getCacheMenu()[curMenuId] ;
			return menu ;
		},
		opMenuShow:function(el , position){ //显示操作菜单
			//
			var om = $('.config_menu') ;
			
			/*om.css({
				width:"200px",
				border:"1px solid red",
				height:"200px"
			}) ;*/
			
			if( 'left' == position ){
				om.show().css( {
					'z-index':100,
					position: 'absolute',
					top     : el.offset().top  ,
					left    : el.offset().left+ el.width()
				} ) ;
			}else{
				om.show().css( {
					'z-index':100,
					position: 'absolute',
					top     : el.offset().top + el.height()  ,
					left    : el.offset().left
				} ) ;
			}
			
			var menuId = Portal.config.params['curMenuId'] ;
			var menu = getCacheMenu()[menuId] ;
			//alert(menuId);
			if( menu.configUrl ){
				$("#setMenu").show() ;
			}else{
				$("#setMenu").hide() ;
			}
			
			$('#config_menu_iframe').css({
				'z-index':90,
				position: 'absolute',
				top:om.offset().top ,
				left:om.offset().left,
				width:om.width(),
				height:om.height()
			}) ;
		},
		opMenuHide:function(){
			$('.config_menu').hide() ;
			$('#config_menu_iframe').hide() ;
		}
	}
	
	/**
	 * 布局配置事件
	 */
	Portal.config.event = {
			
		addTopMenu:function(){
			Portal.config.dialog.menu('新建页面','',Portal.config.event.addMenuAction,null ) ;
		},setMenuOrder:function(){//菜单排序
			Portal.config.dialog.show( {
				Height: 450,
				Width: 400,
				url: Config.orderConfig,
				Title:'菜单排序',
				menus:Portal.services.getMenus()
			}) ;
		},
			
		/**
		 * 创建子菜单
		 * @param {} id
		 * @param {} parentMenuObj
		 * @param {} menuCount
		 */
		createSubMenu:function(menuId){
			var _menuId = menuId||curMenuId ;
			var menu = getCacheMenu()[_menuId] ;
			Portal.config.dialog.menu('新建页面','',Portal.config.event.addMenuAction,menu) ;
	    },
		
		/**
		 * 重命名菜�?
		 * @param {} id
		 * @param {} menuObj
		 * @param {} menuCount
		 */
		renameMenu:function(menuId){
			var _menuId = menuId||curMenuId ;
			var menu = getCacheMenu()[_menuId] ;
			Portal.config.dialog.menu('页面重命名',menu.title ,Portal.config.event.renameMenuAction ,menu ) ;
		},
		setMenu:function(menuId){
			var _menuId = menuId||curMenuId ;
			var menu = getCacheMenu()[_menuId] ;
			Portal.config.dialog.show({
				url:menu.configUrl,
				Width:800,
				Height:600,
				Title:menu.title+"-设置"
			}) ;
		},
		/**
		 * 删除菜单
		 * @param {} id
		 * @param {} menuObj
		 */
		deleteMenu:function(menuObjId){
			var _menuId = menuObjId||curMenuId ;
			
			var menuObj = getCacheMenu()[_menuId] ;
			var pid = menuObj.pid ;
			var msg = "确认删除该项页面吗？" ;
			
			$.block() ;
	
			if(confirm(msg)){
				if( !Portal.services.deleteMenu( _menuId ) ) {
					return ;
				}
	
				curEl = $('#'+'_A_'+ _menuId ) ;
	
				var curParentEl = $(curEl).parent() ;
				 $(curEl).remove() ;
				 
				 if( !curParentEl.children()[0] ){
				 	curParentEl.remove() ;
				 }
				 
				$.unblock() ;
				delete getCacheMenu()[_menuId] ;
				
				for(var o in getCacheMenu()){
					var _menu = getCacheMenu()[o] ;
					if(_menu && pid == _menu.id ){
						//删除对象
						for( var i=0 ;i<_menu.childs.length;i++ ){
							if( _menuId == _menu.childs[i].id  ){
								_menu.childs.splice(i,1) ;
								break ;
							}
						}
						break;
					}
				}
			}else{
				//LoadingBar.unlock() ;
				$.unblock() ;
			}
			
		},
		
		/**
		 * 编辑视图页面
		 * 
		 * @param {} id
		 * @param {} menuObjId
		 */
		editMenu:function(menuId){
			var _menuId = menuId||curMenuId ;
			var menuObj = getCacheMenu()[_menuId] ;

			Index.menu._navigate(null,Config.pluginConfig) ;
			
			//Portal.layout.showContent(menuObj.url,'config') ;
		} ,
		
		/**
		 * 添加子菜�?
		 * @param {} pmenu
		 * @param {} menuCount
		 * @param {} name
		 * @param {} callback
		 */
		addMenuAction:function(pmenu,name,callback){
			
			$.block() ;
			
			/**
			 * TODO: 创建子菜单，返回菜单ID
			 */
			var menuId = Portal.services.saveOrUpdate( Portal.config.params['curMenu'] ) ;
			if( !menuId ) {
				return ;
			}
			//LoadingBar.unlock() ;
			$.unblock() ;
			Portal.config.params['curMenu'].id = menuId ;
			Portal.config.params['curMenu'].hasChild = false ;
			getCacheMenu()[menuId] = $.extend({},Portal.config.params['curMenu']) ;
			
			if( !pmenu.id ){//root
				//menuJson.push( cacheMenu[menuId] ) ;
				/*Portal.layout.insertTopMenu( getCacheMenu()[menuId] ) ;
				Portal.layout.navigate( menuId , getCacheMenu()[menuId].url ) ;
				Portal.config.renderMenu( null , menuId ) ;*/
				window.top.location.reload();
			}else{//update
				window.top.location.reload();
			}
			if(callback)callback() ;
			
			function getAncestorMenu(menu){
				if( !menu.pid ) return menu ;
				var pid = menu.pid ;
				while( getCacheMenu()[pid] ){
					var temp = getCacheMenu()[pid] ;
					pid = temp.pid ;
					if( !pid ) return temp ;
				}
				return null ;
			}
		},
		renameMenuAction:function(menu,name,callback){
			$.block() ;
	
			var cMenu = Portal.config.params['curMenu'] ;
	
			menu.title = name ;
			menu.displayOrder = null ;
			menu.hasChild  = null ;
			menu.pluginCode = cMenu.pluginCode ;
		
			/**
			 * 重命名菜单
			 */
			var menuId = Portal.services.saveOrUpdate( menu ) ;
			if( !menuId ) {
				return ;
			}
			
			$.unblock() ;
			
			if(callback)callback() ;
			window.location.reload() ;
		}
	}
	
	/**
	 * 布局配置弹出对话框
	 */
	Portal.config.dialog = {
		show:function(params){
			Portal.config.instance = $.open( params.url , params.Width||300 , params.Height||200,params  ) ;
		},
		menu:function(title,title,callback,menu){
			Portal.config.params['callbackAction'] = callback ;
			//alert(Config.menuConfig);
			Portal.config.dialog.show({
				url:Config.menuConfig,
				Width:300,
				Height:200,
				Title:'门户菜单'
			}) ;
			 
			 menu = menu||{} ;
			 if(!name){
				//如果name不存在，则为新建菜单或下级菜�?
				Portal.config.params['curMenu'] = {
					url:'#' ,
					pid:menu.id,
					hasChild:false,
					target:'current'
				};
			 }else{
				 Portal.config.params['curMenu'] = menu ;
			 }
			 
			 Portal.config.params['title'] = title ;//菜单名称
			 Portal.config.params['pMenu'] = Portal.config.params['curMenu'].id?Portal.config.params['curMenu']:menu ;
			 
			 return true;
		},close:function(){
			//alert(Portal.config.instance);
			//$('.nyroModalClose').click() ;
			Portal.config.instance.close();
		},
		callback:function(menuConfig){
			Portal.config.params['curMenu'].title = menuConfig.title ;
			Portal.config.params['curMenu'].pluginCode = menuConfig.pluginCode||"" ;
			Portal.config.params['callbackAction']( Portal.config.params['pMenu'],menuConfig.title,Portal.config.dialog.close) ;
		}
	}
})();

