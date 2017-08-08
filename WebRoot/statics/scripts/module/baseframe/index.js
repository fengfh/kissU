var Index = {
	isRenderTop:false ,
	defaultHome:"~/portal/layouts/default/index.jsp",
	theme:{
		render:function(themes){
		 	//渲染主题
			window.theme = window.theme||"mobile" ;

			var themesHtml = [] ;
			$(themes).each(function(){
				var selected = window.theme == this.code?"context-menu-ifocus b-m-ifocus ui-state-hover":"" ;
				themesHtml.push('<li code="'+this.code+'" class="'+selected+'"><a href="#">'+this.name+'</a></li>') ;
			}) ;
			$("#header-toolbar").hide() ;
			var html = '<div class="btn-group" style="position:absolute;right:10px;top:2px;z-index:100">\
				  <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">\
					<img src="'+Config.contextPath+'/statics/images/icons/menu/shirt.png" style="height:13px;margin-top:-5px;">\
					<span class="caret"></span>\
				  </a>\
				  <ul class="dropdown-menu" style="z-index:90;top:23px;right:20px;padding:3px 0px;margin-left:-60px;width:80px;">'+themesHtml.join("")+'</ul>\
				</div> '	;
			
			var themeSelect = $(html).appendTo(document.body) ;
			
			themeSelect.find(".dropdown-toggle").click(function(){
				themeSelect.find(".dropdown-menu").show() ;
				return false ;
			}) ;
			
			themeSelect.find(".dropdown-menu [code]").click(function(){
				var code = $(this).attr("code") ;
				var url = window.location.pathname+jQuery.query.set("theme", code).toString();
				window.location.href = url ;
				return false ;
			}) ;
		}
	
	},
	shortcut:{
		render:function(shortcuts){
			var container = $("#shortcut_template").attr("container");
			
			shortcuts =  formatShortcut(shortcuts) ;
			
			$(container).html(
				$("#shortcut_template").render( shortcuts )
			) ;
			
			$(shortcuts).each(function(){
				var me = this ;
				if(me.url){
					me.url = $.utils.parseUrl(me.url) ;
					$("[shortcut-id='"+this.menuId+"']").click(function(){
						window.location.href = me.url ;
						return false ;
					}) ;
				}else if( me.description ){
					me.description = $.utils.parseUrl(me.description) ;
					$("[shortcut-id='"+this.menuId+"']").click(function(){
						if( me.description.indexOf("function()")!=-1 ){
							var action = function(){} ;
							eval("action = "+ me.description ) ;
							action() ;
						}
						return false ;
					}) ;
				}
			}) ;
			
			function formatShortcut(shortcuts){
				$(shortcuts).each(function(){
					this.url = jQuery.utils.parseUrl(this.url) ;
					this.menuId = this.menuId||this.id ;
					this.thumbnail = jQuery.utils.parseUrl(this.thumbnail||this.iconMiddle||this.icon) ;
				}) ;
				return shortcuts ;
			}
		} 
	},
    menu: {
    	mapCacheMenu:null,
        _cacheMenu: null,
        mapEvent:{},
        toRenderMenu:null,
        init: function (menus) {
        	
        	var cacheMenu = {} ;
			menus = formatMenu(menus) ;
			Index.menu.mapCacheMenu = cacheMenu;
            Index.menu._cacheMenu = menus;
            Index.menu.render();
            
            $(window).bind("resize.jcarousel",function(){
            	$.execResize('__jcarouselResize',function(){
            		if( Index.isRenderTop ){
	            		if( $.fn.jcarousel ){
	            			var containerWidth = 0 ;
				        	if( Index.menu.menuWidthCallback ){
				        		containerWidth = Index.menu.menuWidthCallback() ;
				        	}else{
				        		containerWidth = Index.menu._menuWidthCallback() ;
				        	}
				        	var container = $("#topmenu_template").attr("container");
			            	$(container).jcarousel("reload");
							$(".jcarousel-container-horizontal").width(containerWidth-10 );
							$(".jcarousel-clip-horizontal").width(containerWidth-10 );
			            }
	            	}
            	}) ;
            }) ;
            
            function formatMenu(menus){
				var _roots = [] ;
				var map = {} ;
				$( menus ).each(function(){
					this.thumbnailSmall = this.thumbnailSmall=='null'?"":this.thumbnailSmall ;
					
					if( !this.pid ){
						_roots.push(this) ;//root
					}else{
						map[this.pid] = map[ this.pid ]||[] ;
						map[this.pid].push( this ) ;
					}
					cacheMenu[this.id] = this ;
				}) ;
				formatChild(_roots,map) ;
				return _roots ;
			}
			
			
			function formatChild(menus,map){
				$(menus).each(function(){
					if(map[this.id]){
						this.childs = map[this.id] ;
						formatChild( this.childs ,map) ;
					}
				}) ;
			};
        },
        addEvent:function(type , func){
        	Index.menu.mapEvent[type] = Index.menu.mapEvent[type]||[] ;
        	Index.menu.mapEvent[type].push(func) ;
        },
        render: function () {/*渲染菜单*/
        	Index.menu.hasTopMenu =  Index.menu.hasTopMenu===false?false:true;
            //自动发现
            if ($("#topmenu_template")[0] && Index.menu.hasTopMenu ) {
                Index.menu._renderTop();
            } else {
                Index.menu._renderLeft();
            }
        },
         _menuWidthCallback:function(){//菜单宽度计算
      		 var containerWidth = $(".navbar-inner").width() - $(".user-info").outerWidth(true) ;
        	if( $(".user-info").css("position") == "absolute" || !$(".user-info").parent().parent().hasClass("navbar-inner") ){
        		containerWidth = $(".navbar-inner").width() ;
        	}
        	return containerWidth;
        
        },
        _findMenu: function (menus, id) {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].id == id) {
                    return menus[i];
                }

                if (menus[i].childs) {
                    var _ = Index.menu._findMenu(menus[i].childs, id);
                    if (_) return _;
                }
            }
            return null;
        },
        _renderTop: function () {
        	Index.menu.toRenderMenu = null ;

        	Index.menu.getReqMenuId = Index.menu.getReqMenuId||function(){return "" ;} ;
        	
        	var initMenuid = Index.menu.getReqMenuId()  ;
        	
            var menus = Index.menu._cacheMenu;
            var container = $("#topmenu_template").attr("container");
           
            
            //$(container).width( containerWidth ) ;
            $(container).html(
				$("#topmenu_template").render(Index.menu._cacheMenu)
			).find("a").click(function (e) {
				Index.menu.toRenderMenu = $(this).attr("toRenderMenu") ;
				
			    $(container).find("li").removeClass("active");
			    $(this).parents("li").addClass("active");
			    var menuid = $(this).attr('menuid');

			    //renderLeftMenu
			    var menu = Index.menu._findMenu(menus, menuid);

			    if (menu && menu.childs && menu.childs.length > 0) {
			        $("#sidebar").show();
			        $(".master-page").removeClass("nosidebar");
			        Index.menu._renderLeft(menu.childs);
			    } else {
			        $("#sidebar").hide();
			        $(".master-page").addClass("nosidebar");
			        Index.layout.init();
			    }

			    //navigation
			    var url = $(this).attr('href');
			    Index.menu._navigate(menuid, url, this);
			    
			    return false;
			});
			
			if(initMenuid){
				var rootMenu = getMenuRoot(initMenuid) ;
				if( !rootMenu ){
					$(container).find("a").first().click();
				}else{
					if( rootMenu.id != initMenuid){
						Index.menu.toRenderMenu = initMenuid ;
					}
					$(container).find("a[menuid='"+rootMenu.id+"']").attr("toRenderMenu",Index.menu.toRenderMenu||"").click();
				}
        	}else{
        		$(container).find("a").first().click();
        	}
        	
        	var containerWidth = 0 ;
        	if( Index.menu.menuWidthCallback ){
        		containerWidth = Index.menu.menuWidthCallback() ;
        	}else{
        		containerWidth = Index.menu._menuWidthCallback() ;
        	}
        	
            if( $.fn.jcarousel ){
            	$(container).jcarousel({});
				$(".jcarousel-container-horizontal").width(containerWidth -10 );
				$(".jcarousel-clip-horizontal").width(containerWidth -10);
            }
            
            Index.isRenderTop = true ;
            
            $(Index.menu.mapEvent['renderTopAfter'] || []).each(function(index,func){
	            	func() ;
	         }) ;
	         
	         function getMenuRoot(id){
	         	var menu = Index.menu.mapCacheMenu[id] ;
	         	if(!menu) return null ;
	   			var pid = menu.pid ;
	   			if( Index.menu.mapCacheMenu[pid] ){
	   				return getMenuRoot(pid) ;
	   			}else{
	   				return Index.menu.mapCacheMenu[id] ;
	   			}
	   		}
        },
        _renderLeft: function (menus) {
            menus = menus || Index.menu._cacheMenu;
            $(".rootmenu-div").empty().html('<ul class="rootmenu jcarousel-skin-tango"></ul>') ;
            window._isInitLeftJcarousel = false ;
            
            var container = $("#leftmenu_template").attr("container");
            $(container).html(
				$("#leftmenu_template").render(menus)
			);

            $(container).find("a").click(function (e) {
            	Index.menu.toRenderMenu = null ;
                $(container).find("li").removeClass("current");
                $(this).parents("li").addClass("current");
                var menuid = $(this).attr('menuid');

                //navigation
                var url = $(this).attr('href');
                Index.menu._navigate(menuid, url, this);
                
                return false;
            });

            setTimeout(function(){
            	Index.layout.init();
            },0) ;
            
            
            $(Index.menu.mapEvent['renderLeftAfter'] || []).each(function(index,func){
            	func() ;
            }) ;
        },
        _navigate: function (id, url, el , childMenu) {
        	if (!(url && url != "#" && url != "javascript:void(0)")) {
				url = "" ;  
			}
			
			Index.menu.setReqMenuId = Index.menu.setReqMenuId||function(){return "" ;} ;
			
			try{
        		if( Index.menu.setReqMenuId( id  , Index.menu.toRenderMenu||'') ){
        			return ;
        		}
        	}catch(e){}
        	
			//currentMenuId targetMenuId
			if( Index.menu.toRenderMenu && Index.menu.toRenderMenu != id ){//调整到子菜单
				$("[menuid='"+Index.menu.toRenderMenu+"']").click() ;
				return ;
			}

            if (url != '#' && url) {
            	var menu = Index.menu._findMenu(Index.menu._cacheMenu, id);
            	if( menu.target == "_blank" || jQuery.query.get("target") == "_blank" ){
            		window.open(  $.utils.parseUrl(url)  ) ;
            	}else{
            		$("#content iframe").attr("src", $.utils.parseUrl(url) );
            	}
                
            }else{//查找子菜单
            	
            	var selfMenu = Index.menu._findMenu(Index.menu._cacheMenu, id);
            	//alert( $.json.encode(selfMenu) ) ;
            	if(selfMenu && selfMenu.childs && selfMenu.childs.length >0  ){
            		var child = selfMenu.childs[0] ;
            		$("[menuid='"+child.id+"']").click() ;
            	}
            	
            	setTimeout(function(){
            		var sideBarHeight = $("#sidebar").height() ;
            		
            		var height = 0 ;
            		$(".rootmenu >li").each(function(){
            			height = height + $(this).outerHeight(true) ;
            		}) ;
            		//alert(sideBarHeight+"      "+height);
            		if( sideBarHeight > height ){
            			$(".jcarousel-prev-vertical,.jcarousel-next-vertical").hide() ;
            			return ;
            		}else{
            			$(".jcarousel-prev-vertical,.jcarousel-next-vertical").show() ;
            		}
            		
            		if( !window._isInitLeftJcarousel ){
            			window._isInitLeftJcarousel = true ;
            			$("#sidebar  .rootmenu").height(sideBarHeight).jcarousel({vertical:true,scroll:2,height:sideBarHeight});
            		}else{
            			$(".rootmenu").height( height+100) ;
            			//$("#sidebar  .rootmenu").jcarousel("reload") ;
            		}

            	},500) ;
            }
        }
    },
    layout: {
        init: function () {
        	
            if (!$('#sidebar').length) return;
            
            // 动态设置右边内容高度
            var contentHei = $(window).height() - $("#header").outerHeight(true) - $("#footer").outerHeight(true) - ($(".content").outerHeight(true) - $(".content").height());
			
            var contentTop = $(".content").css("top");
            if( $(".content").css("top") == "auto" ) contentTop = "0px"
            
			var top = $("#header").outerHeight(true) + parseInt(contentTop.replace("px","")) ;

            /** 
            * Sidebar menus
            * */
            var currentMenu = null;
            var winHei = $(window).height(),
				headHei = $('#header').height(),
				$li = $('#sidebar .rootmenu>li:first'),
                sidebarTitle=$('#sidebar .sidebar-title').height(),
				liHei =   $li.outerHeight(true) ,
				sideHei = $('#sidebar  .rootmenu>li').length * liHei;
			if( liHei > $li.find(">ul").outerHeight(true) ){
				liHei = liHei - $li.find(">ul").outerHeight(true) ;
			}

            var submenuHei = contentHei - sideHei - sidebarTitle;
       
            $('#sidebar  .rootmenu>li').each(function () {
                if ($(this).find('li').length == 0) {
                    $(this).addClass('nosubmenu');
                }
            })
            $('#sidebar  .rootmenu>li:not([class*="current"])>ul').hide();

            $('#sidebar  .rootmenu>li>ul.submenu').each(function () {
                var menuHei = $(this).height();
                if (menuHei > submenuHei) {
                    $(this).height(submenuHei - ($(this).outerHeight(true) - $(this).height()) )
                    // fix ie6 不出现滚动条					
                    $(this).css({ 'overflow-y': 'auto' }).find('ul').css({ 'overflow': 'hidden' });
                }
            });

            var htmlCollapse = $('#menucollapse').html();
            if ($.cookie('isCollapsed') === 'true') {
                $('body').addClass('collapsed');
                $('#menucollapse').addClass('menucollapse-hide');
            }

           
            $("#sidebar").css("top",top+"px").height(contentHei);
            
            
            $("#settings").height(contentHei);
            $(".content").height(contentHei);

            /* 没有子菜单的点击 */
            $('#sidebar  .rootmenu>li[class*="nosubmenu"]>a').unbind("click.nosubmenu").bind("click.nosubmenu", function () {
                //$('#sidebar>ul>li:not([class*="nosubmenu"])>ul').slideUp();
                $(this).parent().addClass('current')
							.siblings().removeClass('current');
                $("#sidebar a").removeClass('active');
                return false;
            });

            /* 有子菜单的点击 */
            $('#sidebar  .rootmenu>li:not([class*="nosubmenu"])>a').unbind("click.nosubmenu").bind("click.nosubmenu", function () {
                e = $(this).parent();
                e.addClass('current').find('ul:first').slideToggle()
					.end().siblings().removeClass('current').find('ul:first').slideUp();

                $("#sidebar a").removeClass('active');
            });

            //子菜单里面的点击显示当前激活的状态			
            $("#sidebar .submenu a").unbind("click.submenu").bind("click.submenu", function () {
                $(this).addClass('active')
							.parent().siblings()
								.find('a').removeClass('active');
                var $secondParent = $(this).parent().parent().parent(),
						$thirdParent = $secondParent.parent(),
						$fourthParent = $thirdParent.parent();
                $secondParent.siblings().removeClass('current');
                $thirdParent.siblings().removeClass('current');
                $fourthParent.siblings().removeClass('current');
                return false;
            });

            $('#menucollapse').unbind("click.menucollapse").bind("click.menucollapse", function () {
                var body = $('body');
                body.toggleClass('collapsed');
                isCollapsed = body.hasClass('collapsed');
                if (isCollapsed) {
                    $(this).addClass('menucollapse-show');
                } else {
                    $(this).removeClass('menucollapse-show');
                }
                $.cookie('isCollapsed', isCollapsed);
                return false;
            });

            //窗口改变后动态计算
            $(window).unbind("resize").bind("resize", function () {
            	$.execResize('__layoutResize',function(){
            		var conHei = $(window).height() - $("#header").outerHeight(true) - $("#footer").outerHeight(true) - ($(".content").outerHeight(true) - $(".content").height());
	                $("#sidebar").height(conHei);
	                $("#settings").height(conHei);
	                $(".content").height(conHei);
            	}) ;
            });
             //$('#sidebar>ul>li:first').find('ul:first').css("display","block");
             //小于ie7版本，样式调整
/*              if($.browser.version<7){
             	$("#sidebar>ul>li>a").css("text-indent","10px");
             }
             //google,ie8
             if($.browser.webkit||$.browser.version==8.0){
           		 $("#sidebar>ul>li>a").css({"height":"25px","ine-height":"25px"});
             }
             //ie7
             if($.browser.version==7.0){
            	$("#sidebar>ul>li>a>span").css("padding-right","4px");
             }
             //ie7
             if($.browser.version==9.0||$.browser.version==7.0){
            	$("#sidebar>ul>li>a").css("line-height","33px");
             } */
        }
    }
}


//修复ie6下的问题
$.browserFix.register("ie", "6", "bootstrap", function (target) {
    var conHei = $(window).height() - $("#header").outerHeight(true) - $("#footer").outerHeight(true) - ($(".content").outerHeight(true) - $(".content").height());
    $(".content>iframe")
			.height(conHei);

    $(".collapsed #sidebar .rootmenu>li").live("mouseover", function () {
        var h = $(this).height();
        $(this).addClass("hover");
        $(this).find(">a").addClass("collapsed_sidebar_hover_a");
        $(this).find(">ul").addClass("collapsed_sidebar_hover_ul").show().css("margin-top", h + "px");
        $(this).height(h).css("margin-bottom", "-3px");
    }).live("mouseout", function () {
        $(this).removeClass("hover");
        $(this).find(">a").removeClass("collapsed_sidebar_hover_a");
        $(this).find(">ul").removeClass("collapsed_sidebar_hover_ul").hide().css("margin-top", "0px");
        $(this).css("margin-bottom", "0px");
    });
});
