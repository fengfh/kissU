(function(){
	Index.menu.getReqMenuId = Portal.services.getHashMenu ;
	
	Index.menu.setReqMenuId = Portal.services.setHashMenu ;

	//获取菜单数据
	var menus =Portal.services.getMenus();
	
	$(menus).each(function(index,menu){
		$.extend(this,{'name':menu.title})
	}) ;
	
	//快捷菜单获取
	var shortCuts = Portal.services.getShortcut() ;
	
	//get Config
	var _portal = Portal.services.getBaseInfo();
	
	var themes = [
		{code:"mobile",name:"广州移动"},
		{code:"szmobile",name:"深圳移动"},
		{code:"bsmobile",name:"移动（旧风格）"},
		//{code:"gdmobile",name:"广东移动"},
		{code:"government",name:"政府"},
		{code:"metro",name:"地铁"}
	] ;
	
	//渲染
	$.pageLoad.register("before",function(){
		if (canChangeTheme) {
			Index.theme.render(themes) ;
		}
		
		Index.menu.init(menus) ;
		
		Index.shortcut.render(shortCuts) ;
		
		if( _portal ){
			$(".copyright").html(_portal.footer) ;
		
			//window.title = _portal.title ;
			//title
			// _portal.title
		}
	});
	
})() ;
