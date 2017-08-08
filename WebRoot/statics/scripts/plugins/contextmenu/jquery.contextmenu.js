/// <reference path="../intellisense/jquery-1.2.6-vsdoc-cn.js" />
/* --------------------------------------------------	
参数说明
option: {width:Number, items:Array, onShow:Function, rule:JSON}
成员语法(三种形式)	-- para.items
-> {text:String, icon:String, type:String, alias:String, width:Number, items:Array}		--	菜单组
-> {text:String, icon:String, type:String, alias:String, action:Function }				--	菜单项
-> {type:String}																		--	菜单分隔线
--------------------------------------------------*/
(function($) {
	contextMenu_showGroups = [];
	contextMenu_groups = {};
	
    function returnfalse() { return false; };
    $.fn._contextmenu = function(option) {
    	
    	$(this).bind("contextmenu", returnfalse) ;
    	
    	var rand = '' + new Date().getTime();
        option = $.extend({ alias: "cmroot_" + rand , width: 150 , isClearCache : false }, option);
        var ruleName = null, target = null,
	    mitems = {}, actions = {},
	    
	    itemTpl = '<a href="#" class="contextmenu-a" style="text-decoration:none">\
						<img  class="context-menu-img" src="$[icon]"/>\
						<span class="context-menu-span">$[text]</span>\
						<span class="icon-$[type]-right context-menu-arrow b-m-arrow" style="float:right"></span>\
						<div style="clear:both;"></div>\
					</a>\
				';
				
		itemNoIconTpl = '<a href="#" class="contextmenu-a" style="text-decoration:none">\
						<div  class="context-menu-img" style="visibility:hidden;float:left;width:16px;height:16px;overflow:hidden;">replace</div>\
						<span class="context-menu-span">$[text]</span>\
						<span class="icon-$[type]-right context-menu-arrow b-m-arrow"></span>\
						<div style="clear:both;"></div>\
					</a>\
				';
				
		var gTemplet = $("<ul></ul>").addClass("context-menu dropdown-menu b-m-mpanel").attr("unselectable", "on").css("display", "none");
        var iTemplet = $("<li style='list-style:none'></li>").addClass("b-m-item context-menu-item").attr("unselectable", "on");
        var sTemplet = $('<li class="divider"></li>').addClass("b-m-split") ;
	    
        //创建菜单组
        var buildGroup = function(obj) {
            contextMenu_groups[obj.alias] = this;
            $(this).mouseleave( function(){ 
					//hideMenuPane.call( contextMenu_groups[obj.alias] )  ;
			 }  ) ;//hideMenuPane
            this.gidx = obj.alias;
            this.id = obj.alias;
           
            if (obj.disable) {
                this.disable = obj.disable;
                this.className = "b-m-idisable context-menu-idisable";
            }
            
            $(this).width(obj.width).click(returnfalse).mousedown(returnfalse).appendTo($("body"));
            obj = null;
            return this;
        };
        
        var aliasIndex = 0 ;
        
        var buildItem = function(obj) {
            var T = this;
            aliasIndex++ ;
            obj.alias = obj.alias||('alias_'+aliasIndex) ;
            T.title = obj.text;
            T.idx = obj.alias;
            T.gidx = obj.gidx;
            T.data = obj;
            
            
            if(obj.icon){
            	T.innerHTML = itemTpl.replace(/\$\[([^\]]+)\]/g, function() {
	                return obj[arguments[1]];
	            });
            }else{
            	T.innerHTML = itemNoIconTpl.replace(/\$\[([^\]]+)\]/g, function() {
	                return obj[arguments[1]];
	            });
            }

            if(!obj["icon"]){
            	//$(T).find("img").css({"visibility":"hidden",width:"16px",height:"16px"})//visible:hidden
            }
            
            if (obj.disable) {
                T.disable = obj.disable;
                T.className = "b-m-idisable context-menu-idisable disabled";
            }
            obj.items && (T.group = true);
            obj.action && (actions[obj.alias] = obj.action);
            mitems[obj.alias] = T;
            T = obj = null;
            return this;
        };
        
        //添加菜单项
        var addItems = function(gidx, items) {
            var tmp = null;
            for (var i = 0; i < items.length; i++) {
            	//alert(items[i].text + ":" + items[i].type);
                if (items[i].type == "splitLine") {
                    //菜单分隔线
                    tmp = sTemplet.clone()[0];
                } else {
                    items[i].gidx = gidx;
                    if (items[i].type == "group") {
                        //菜单组
                        buildGroup.apply(gTemplet.clone()[0], [items[i]]);
                        //不明白?????????
                        arguments.callee(items[i].alias, items[i].items);
                        items[i].type = "arrow";
                        tmp = buildItem.apply(iTemplet.clone()[0], [items[i]]);
                    } else {
                        //菜单项
                        items[i].type = "ibody";
                        tmp = buildItem.apply(iTemplet.clone()[0], [items[i]]);
                        $(tmp).click(function(e) {
                            if (!this.disable) {
                                if ($.isFunction(actions[this.idx])) {
                                    actions[this.idx].call(this, target);
                                }
                                hideMenuPane();
                            }
                            return false;
                        });

                    } //Endif
                    $(tmp).bind("contextmenu", returnfalse).hover(overItem, outItem);
                } //Endif
                contextMenu_groups[gidx].appendChild(tmp);
                tmp = items[i] = items[i].items = null;
            } //Endfor
            gidx = items = null;
        };
        
        var overItem = function(e) {
            //如果菜单项不可用          
            if (this.disable)
                return false;
            hideMenuPane.call(contextMenu_groups[this.gidx]);
            //如果是菜单组
            if (this.group) {
                var pos = $(this).offset();
                var width = $(this).outerWidth();
                showMenuGroup.apply(contextMenu_groups[this.idx], [pos, width]);
            }
            this.className = "context-menu-ifocus b-m-ifocus ui-state-hover";
            return false;
        };
        
        //菜单项失去焦点
        var outItem = function(e) {
            //如果菜单项不可用
            if (this.disable )
                return false;
            if (!this.group) {
                //菜单项
               // this.className = "context-menu-item b-m-item";
            } //Endif
            this.className = "context-menu-item b-m-item";
            return false;
        };
        
        //在指定位置显示指定的菜单组
        var showMenuGroup = function(pos, width) {
            var bwidth = $("body").width();
            var bheight = document.documentElement.clientHeight;
            var mwidth = $(this).outerWidth();
            var mheight = $(this).outerHeight();
            pos.left = (pos.left + width + mwidth > bwidth) ? (pos.left - mwidth < 0 ? 0 : pos.left - mwidth) : pos.left + width;
            pos.top = (pos.top + mheight > bheight) ? (pos.top - mheight + (width > 0 ? 25 : 0) < 0 ? 0 : pos.top - mheight + (width > 0 ? 25 : 0)) : pos.top;
            $(this).css(pos).show();
            contextMenu_showGroups.push(this.gidx);
        };
        
        //隐藏菜单组
        var hideMenuPane = function() {
        	
            var alias = null;
            for (var i = contextMenu_showGroups.length - 1; i >= 0; i--) {
                if (contextMenu_showGroups[i] == this.gidx)
                    break;
                alias = contextMenu_showGroups.pop();
                $( contextMenu_groups[alias] ).hide();//.style.display = "none";
                $( mitems[alias] ).addClass("context-menu-item b-m-item") ;
                
                if (option.onHide && $.isFunction(option.onHide)) {
                	if( i === 0){
                		 option.onHide.call(this);
                	}
	            }
            } //Endfor
            //CollectGarbage();
        };
     	
     	//
        //function CollectGarbage(){}
        
        /*------------------------public method begin---------------------*/
        function applyRule(rule) {
            if (ruleName && ruleName == rule.name){
                return false;
            }
            if(rule == "disable"){
	            for (var i in mitems){
	                disable(i, !rule.disable);
	            }
	            for (var i = 0; i < rule.items.length; i++){
	                disable(rule.items[i], rule.disable);
	            }
            }
            else if(rule == "hide"){
            	for (var i in mitems){
	                hide(i, !rule.disable);
	            }
	            for (var i = 0; i < rule.items.length; i++){
	                hide(rule.items[i], rule.disable);
	            }
            }
            
            ruleName = rule.name;
        };
       
        function disable(alias, disabled) {
            var item = mitems[alias];
            item.className = (item.disable = item.lastChild.disabled = disabled) ? "b-m-idisable context-menu-idisable disabled" : "b-m-item context-menu-item";
        };
        
        function hide(alias, isHide) {
            var item = mitems[alias];
            if(isHide){
           	 	item.style.display = 'none';
            }
            else{
            	item.style.display = 'block';
            }
        };
        
        function enableMenuItems(menuItemAliasArray){
        	for(var i = 0;i < menuItemAliasArray.length;i ++){
				disable(menuItemAliasArray[i],false);        	
        	}
        };
        
        function disableMenuItems(menuItemAliasArray){
        	for(var i = 0;i < menuItemAliasArray.length;i ++){
				disable(menuItemAliasArray[i],true);        	
        	}
        };
        
        function showMenuItems(menuItemAliasArray){
        	for(var i = 0;i < menuItemAliasArray.length;i ++){
				hide(menuItemAliasArray[i],false);        	
        	}
        };
        
        function hideMenuItems(menuItemAliasArray){
        	for(var i = 0;i < menuItemAliasArray.length;i ++){
				hide(menuItemAliasArray[i],true);        	
        	}
        };
        
        function disableContextMenu(diabled){
        	option.onContextMenu = function(){ return !diabled; };
        };
        
        /*-----------------------------public method end-------------------------------*/
        
        /** 右键菜单显示 */
        function showMenu(e, menutarget) {
        	hideMenuPane();
            target = menutarget;
            showMenuGroup.call(contextMenu_groups[option.alias], { left: e.pageX, top: e.pageY }, 0);
            $(document).one("mousedown", hideMenuPane);
        };
        
        var show = function(e){
        	$(this).each(function() {
	           var bShowContext = (option.onContextMenu && $.isFunction(option.onContextMenu)) ? option.onContextMenu.call(this, e) : true;
               if (bShowContext) {
                   if (option.onShow && $.isFunction(option.onShow)) {
                        option.onShow.call(this, root);
                   }
                   root.showMenu(e, this);
               }
            });
        };
        
        if(option.isClearCache){
	        //清除掉页面DOM中所有已展示的右键菜单的DIV，该DIV的样式统一为b-m-mpanel。
	        $(".context-menu").remove();
	        
	        //从缓存中移除掉菜单对象（存放在所绑定的对象的JQuery对象上）
	        $(".contextmenu_class").removeData("_self");
	        
	        //清除掉已展示的所有菜单组
	        contextMenu_showGroups = [];
	        
	        //清除掉已经初始化的所有菜单组
	        contextMenu_groups = [];
        }
        
        var $root = $("#" + option.alias) ;
        var root = null;
        
        if(option.renderByHtml){
        	root = buildGroup.apply(option.renderTarget, [option]);
        	root.applyrule = applyRule;
	        root.showMenu = showMenu;
        }else{
	        root = buildGroup.apply(gTemplet.clone()[0], [option]);
	        root.applyrule = applyRule;
	        root.showMenu = showMenu;
	        addItems(option.alias, option.items);
        }
        
      	//初始化绑定事件
      	var me = $(this).each(function() {
	          if(option.eventType){
		            return $(this).bind(option.eventType, function(e) {
		                var bShowContext = (option.onContextMenu && $.isFunction(option.onContextMenu)) ? option.onContextMenu.call(this, e) : true;
		                if (bShowContext) {
		                    if (option.onShow && $.isFunction(option.onShow)) {
		                        option.onShow.call(this, root);
		                    }
		                    root.showMenu(e, this);
		                }
		                return false;
		            });
	          }
      	});
      	
       //设置显示规则
       if (option.rule) {
           applyRule(option.rule);
       }
       
       $(root).find("a").addClass("contextmenu-a") ;
       
       $(root).find("li").hover(function(){
			$(this).addClass("contextmenu-hover") ;
		},function(){
			$(this).removeClass("contextmenu-hover") ;
		}) ;
       
       
       gTemplet = iTemplet = sTemplet = itemTpl = buildGroup = buildItem = null;
       addItems = overItem = outItem = null;
        
       me[0]._cm = {
        	 hide:function(){
        	 	  hideMenuPane() ;
        	 },
        	 show:function(e){
        	 	  show(e);
        	 },
        	 enableMenuItems:function(menuItemAliasArray){
        	 	  enableMenuItems(menuItemAliasArray);
        	 },
        	 disableMenuItems:function(menuItemAliasArray){
        	 	  disableMenuItems(menuItemAliasArray);
        	 },
        	 showMenuItems:function(menuItemAliasArray){
        	 	  showMenuItems(menuItemAliasArray);
        	 },
        	 hideMenuItems:function(menuItemAliasArray){
        	 	  hideMenuItems(menuItemAliasArray);
        	 },
        	 enableMenu:function(){
        	 	disableContextMenu(false);
        	 },
        	 disableMenu:function(){
        	 	disableContextMenu(true);
        	 }
        } ;
        
        //CollectGarbage();
        return me;
    };
    
    $.fn.contextmenu = function(option){
    	  //从缓存(存放在所绑定的对象的JQuery对象上)中获取，如果为空则新创建一个菜单。
   		  var menu = this.data("_self");
   		  if(menu == null){
   			  menu = new contextMenuWidget();
			  menu.init($(this),option);
			  
			  //contextmenu_class是不存在的样式，这里只作为查找依据，方便数据统一的清除。
			  //this.addClass("contextmenu_class");
			  this.data("_self",menu);
   		  }
   		  
		  return menu;
	};
	
	$.fn.bindContextMenu = function(func){
		 $(document).bind("contextmenu",function(e){
        	 	return false;
       	 }) ;
   	 
   	 	$(this).bind("contextmenu",function(e){
   	 		$(this).each(function(){
       	 	 func(e);
       	 	  });
        }) ;
       	
	};
	
	$.uiwidget.register("contextmenu",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||'{}' ;//target
			eval(" var jsonOptions = "+options) ;
			var target = jsonOptions.target ;
			jsonOptions.renderByHtml = true ;
			jsonOptions.renderTarget = $(this) ;
			$(target)._contextmenu(jsonOptions) ;
		});
	}) ;
	
		
	//屏蔽掉原始的右键菜单
	/*
	$(function(){
		$(document).bind("contextmenu",function(e){
	      	 	return false;
	    }) ;
	});
	*/
	contextMenuWidget = function(){
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			return this.$._contextmenu(json_obj);
		},
		this.hide = function(){
			if (this.$[0]._cm) {
	            return this.$.get(0)._cm.hide();
	        }
		},
		this.show = function(e){
			if (this.$[0]._cm) {
	            return this.$.get(0)._cm.show(e);
	        }
		},
		this.destory = function(){
			alert('be not supported now');
		},
		this.enableMenu = function(){
			if (this.$[0]._cm) {
	            return this.$.get(0)._cm.enableMenu();
	        }
		},
		this.disableMenu = function(){
		     if (this.$[0]._cm) {
	            return this.$.get(0)._cm.disableMenu();
	         }
		},
		this.enableMenuItems = function(menuItemAliasArray){
		      if (this.$[0]._cm) {
	            return this.$.get(0)._cm.enableMenuItems(menuItemAliasArray);
	          }
		},
		this.disableMenuItems = function(menuItemAliasArray){
		     if (this.$[0]._cm) {
	            return this.$.get(0)._cm.disableMenuItems(menuItemAliasArray);
	          }
		},
		this.showMenuItems = function(menuItemAliasArray){
		      if (this.$[0]._cm) {
	            return this.$.get(0)._cm.showMenuItems(menuItemAliasArray);
	          }
		},
		this.hideMenuItems = function(menuItemAliasArray){
		     if (this.$[0]._cm) {
	            return this.$.get(0)._cm.hideMenuItems(menuItemAliasArray);
	          }
		}
	};
	
})(jQuery);