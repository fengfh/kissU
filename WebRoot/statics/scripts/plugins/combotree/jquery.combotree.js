/**
 * 
 * lixh@bingosoft.net
 * 
 * Dependencies:
 * 	 jquery.tree.js
 * 
 */
(function($){
	var index = 0;
	function setSize(target){
		var opts = $.data(target, 'combotree').options;
		var combo = $.data(target, 'combotree').combotree;
		var content = $.data(target, 'combotree').content;
		if (!isNaN(opts.width) && ( !combo.find('input.combotree-text').attr("html-render") )){
			var width = opts.width - 26   ;
			combo.find('input.combotree-text').width(width);
		}
		
		if( document.compatMode == "BackCompat" ){
			var input = combo.find('input.combotree-text') ;
			if($.browser.msie){
				combo.find(".btn").css("margin-bottom","0px") ;
				input.css("padding","0px 4px") ;
				input.height( combo.find(".btn").outerHeight()  ) ;
			}else{
				input.height( combo.find(".btn").outerHeight()  ) ;
			}
		}
	
		opts.treeWidth = combo.width() ;// opts.treeWidth||opts.width ;auto
		if (opts.treeWidth){
			content.width(opts.treeWidth);
		} else {
			content.width($.boxModel==true ? combo.outerWidth()-(content.outerWidth()-content.width()) : combo.outerWidth());
		}
		if (opts.treeHeight){
			content.height(opts.treeHeight);
		}
		
		var isShowCheck = opts.showCheck ;
		var __appendText =  '<span  class="clear-content" title="清空" style="cursor:pointer;">【清空】</span>' ;

		var __tree = content.find('>ul').tree({//tree为容器ID
			method : 'post',
			asyn : true, //异步
			rootId  : 'root',
			rootText : '请选择'+__appendText,
			url:opts.url,
			CommandName : opts.CommandName ,
			showCheck:opts.showCheck,
			params :  opts.params,
			cascadeCheck:opts.cascadeCheck||false,
			nodeFormat:function(node){
				var vals = combo.find('input.combotree-value').val() ;
				
				//node.checkstate = 1 ;
				return node ;
			},
			onNodeClick:function(id, text, record,node){
				if(!isShowCheck ){
					if(id == "root"){
						id = "" ;
						text = "" ;
					}
					
					var oldValue = combo.find('input.combotree-value').val();
					combo.find('input.combotree-value').val( id);
					combo.find('input.combotree-text').val( text).attr("title",text );
					content.hide().css({top:"0px",left:"0px"});
					$(target).find("option").remove();
					$("<option selected></option").attr("value", id).appendTo(target).append( text) ;
					
					(!($.browser.msie && /msie 6\.0/i.test(navigator.userAgent)))&&$(target).val( id) ;
					
					opts.onSelect.call(target, record);
					if (oldValue !=  id){
						opts.onChange.call(target, id, oldValue);
					}
	
					if($.validation)$.validation.loadValidation($(target));
					if($(target).change)$(target).change();
					return false;
				}
				
			},
			onChecked  :function(id, text,checked, record){
				var checks = __tree.getSelectNodes()  ;
				var ids = [] ;
				var texts = [] ;
				$(checks).each(function(){
					ids.push(this.id) ;
					texts.push(this.text) ;
				}) ;

				var oldValue = combo.find('input.combotree-value').val();
				combo.find('input.combotree-value').val( ids.join(",") );
				combo.find('input.combotree-text').val( texts.join(",") ).attr("title",texts.join(","));
				//content.hide().css({top:"0px",left:"0px"});
				
	      	   
	      	    $(target).find("option").remove();
	      	   
	      	    $( checks ).each(function(){
	      	   		$("<option selected></option").attr("value",this.id).appendTo(target).append( this.text) ;
	      	    }) ;
	        },loadAfter:function(){
	        	content.find(".close-content").bind("click",function(){
					content.hide().css({top:"0px",left:"0px"});
				});
				
				content.find(".clear-content").bind("click",function(){
					combo.find('input.combotree-value').val("");
					combo.find('input.combotree-text').val("").attr("title","");
					__tree.checkAll(0) ;
				});
				
				content.find("[nodeid='root']").attr("title","");

				setDefaultValue(target) ;
				
	        }
		}) ;
		return __tree ;
		
		function setDefaultValue(target){
			var dv = $(target).attr($.uiwidget.defaultValue) ;
			//设置默认值
			if( dv ){
				$(target).comboTree().setValue({id:dv}) ;
			}
		}
	}
	
	var isIE6 = function(){
		return true ;
		if (jQuery.browser.msie) {
		   return parseInt(jQuery.browser.version)<=6 ;
		}
		return false ;
	}
	
	function init(target,options){
		$(target).hide();
		
		var span,input,arrow ,iframe, content,inputValue ;
		if( $(target).next().hasClass("combotree") ){
			span = $(target).next() ;
			input = span.addClass("ui-widget").find(".include-span").addClass("combotree-text").attr("html-render",true) ;
			arrow = span.find(".add-on") ;
			inputValue  = span.find("input.combotree-value") ;
			if(!inputValue.length){
				input.before('<input type="hidden" class="combotree-value"/>') ;
				inputValue  = span.find("input.combotree-value") ;
			}
		}else{
			span = $('<span class="combotree input-append ui-widget"></span>').insertAfter(target);
			inputValue = $('<input type="hidden" class="combotree-value"/>').appendTo(span);
			input = $('<input class="combotree-text include-span input-span-uneditable" readonly="true"/>').appendTo(span);
			arrow = $('<span class="add-on btn button-reset"><i class="icon-chevron-down ui-icon ui-icon-triangle-1-s"></i></span>').appendTo(span);
		}
		/*index++ ;
		var widgetId = $(target).attr("id")||$(target).attr("name")||"combotree_id_"+index ;
		input.attr("id",widgetId+"_display") ;
		span.find("input.combotree-value").attr("id",widgetId+"_value") ;*/
		
		//create proxy
		if( $(target)[0].className ){
			var prxoy = $("<input type='hidden' style='position:absolute;left:-200px;'>").insertAfter(target).addClass( $(target)[0].className ) ;
			options.width = Math.max( prxoy.width(), $(target).width() );
			prxoy.remove() ;
		}
			
		content = $('<div class="ui-helper-reset ui-widget-content ui-corner-all combotree-content"><ul></ul></div>').appendTo(document.body).css({top:"0px",left:"0px"}).hide();//.appendTo(span);
		$(target).data("content",content) ;
		
		if ($.fn.bgiframe) {
			content.bgiframe();
		}
		
		$(target).data("validate_target",$(target).next('.combotree')) ;
		
		var name = $(target).attr('name');
		if (name){
			span.attr('name', name);
			$(target).removeAttr('name');
		}

		/**
		 * show tree panel
		 * 该方法与ui.select.multi.js有冲突
		 */
		function show(){
			var pos = {
				my : "left top",
				at : "left bottom",
				of : input ,
				collision : "flip",
				offset:"0 0"
			};
			
			content.css({ top : 0, left : 0 }).hide() ;
			var fixWidth = document.compatMode == "BackCompat" && $.browser.msie ?0:2 ;
			content.width($(input).parent().width()-fixWidth).show().position(pos) ;
			
			var isOver = false ;
			var clickBtn = false;
			$(document).unbind('.combotree').bind('click.combotree', function(e){
				if(!isOver && !clickBtn){
					contentHide();
				}
			}) ;
			
			content.mouseenter(function(){
				isOver = true ;
			});
			
			content.mouseleave(function(){
				contentHide() ;
			});
			
			function contentHide() {
				isOver = false ;
				clickBtn = false ;
				content.hide().css({top:"0px",left:"0px"}) ;
			} ;
		}
		
		span.click(function(){
			show();
			return false;
		});
		
		var scrollElement = options.scrollElement ;
		$(scrollElement).length && $(scrollElement).scroll(function(){
			if( content.is(':visible') ){
				content.hide().css({left:"0px",top:"0px"});
			}
		})
		
		$(".scroll-element").scroll(function(){
			if( content.is(':visible') ){
				content.hide().css({left:"0px",top:"0px"});
			}
		}) ;
		
		arrow.click(function(){
			if( content.is(':visible') ){
				content.hide().css({left:"0px",top:"0px"});
			}else{
				show();
			}
			return false ;
		}) ;

		return {
			combotree: span,
			content: content
		}
	}
	
	/**
	 * set the value.
	 * node: object, must at lease contains two properties: id and text.
	 */
	function setValue(target, node){
		var opts = $.data(target, 'combotree').options;
		var combo = $.data(target, 'combotree').combotree;
		var content = $.data(target, 'combotree').content;
		
		var oldValue = combo.find('input.combotree-value').val() ;
		
		
		var id = node.id ;
		var _ids = ((id||"")+"").split(",");
		var texts = [] ;
		$(_ids).each(function(){
			var _id   = this+"" ;
			var array = _id.split(":") ;
			_id = array[0] ;
			var _text = array.length >1 ?array[1]:'' ;
			
			var _node = content.find('>ul').tree().checkNode(_id ,true) ;
			if( !(_node||_text) ) return ;
			_node = _node||{node:{}} ;
			_text = _node.text||_node.node.text||_text ;
			texts.push( _text ) ;
			
			if(_id && _text){
				$(target).empty().append("<option value='"+_id+"'  selected='selected'>"+_text+"</option>") ;
				$(target).val(node.id) ;
			}
			
		}) ;
		
		combo.find('input.combotree-value').val(id);
		combo.find('input.combotree-text').val(texts.join(","));
		
		if (oldValue != id){
			opts.onChange.call(target, id, oldValue);
		}
	}
	
	function getValue(target){
		var combo = $.data(target, 'combotree').combotree;
		var value = combo.find('input.combotree-value').val();
		var text  = combo.find('input.combotree-text').val();
		return {value:value,text:text,id:value} ;
	}
	
	/**
	 * reload the tree panel
	 
	function reload(target, url){
		var opts = $.data(target, 'combotree').options;
		var content = $.data(target, 'combotree').content;
		if (url){
			opts.url = url;
		}
		content.find('>ul').__tree({url:opts.url}).__tree('reload');
	}*/
	
	function destroy(target){
		$(target).data("content").remove();
		$(target).next(".combotree").remove() ;
		$(target).data("options",$(target).data("combotree").options) ;
		$(target).data("combotree",null) ;
		$(target).data("iframe",null);
		$(target).data("content",null);
		/*
		$(target).data("combotree",null);
		$(target).data("content",null);*/
	}
	
	$.fn.__combotree = function(options, param){
		if (typeof options == 'string'){
			switch(options){
				case 'setValue':
					return this.each(function(){
						setValue(this, param);
					});
				case 'reload':
					return this.each(function(){
						reload(this, param);
					});
				case 'destroy':
					return this.each(function(){
						destroy(this);
					});
				case 'getValue':
					var target = null ;
					var val = this.each(function(){
						target = this ;
					});
					
					return getValue(target,param)
			}
		}
		
		options = options || {};
		
		return this.each(function(){

			var state = $.data(this, 'combotree');
			if (state){
				$.extend(state.options, options);
			} else {
				
				var r = init(this,options);
				state = $.data(this, 'combotree', {
					options: $.extend({}, $.fn.__combotree.defaults, {
						width: (parseInt($(this).css('width')) || 'auto'),
						treeWidth: $(this).attr('treeWidth'),
						treeHeight: ($(this).attr('treeHeight') || 200),
						url: $(this).attr('url')
					},$(this).data("options"), options),
					combotree: r.combotree,
					content: r.content
				});
			}
			
			setSize(this);
		});
	};
	
	$.fn.__combotree.defaults = {
		width:'auto',
		treeWidth:null,
		treeHeight:200,
		url:null,
		onSelect:function(node){},
		onChange:function(newValue,oldValue){}
	};
	


	$.comboTreeInit = function(jqueryObj,json4Options){
		jqueryObj.__combotree(json4Options);
	};
	
	$.fn.comboTree = function(json_obj){
		var ocombotreeWidget = new combotreeWidget();
		ocombotreeWidget.init($(this),json_obj);
		return ocombotreeWidget;
	};
	
	combotreeWidget = function(){
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			this.options = json_obj ;
			if(json_obj != undefined){
				 this.$.__combotree(json_obj);
			}
			return this.$ ;
		};
		
		this.setValue = function(json_obj){
			this.$.__combotree('setValue',json_obj);
		};
		
		this.getValue = function(){
			return this.$.__combotree('getValue');
		};
		
		this.reload = function(options){
			this.$.__combotree('destroy') ;
			this.options = $.extend(this.options,options) ;
			return this.init(this.$,this.options) ;
			
			//this.$.__combotree('reload',options) ;
		};
	};
	
	$.uiwidget.register("combotree",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$.comboTreeInit($(this),jsonOptions) ;
		});
	}) ;
	/*
	$.browserFix.register("ie",6,"combotree",function(el){
		$(el).find(".combotree-content .tree .tree-node").live("mouseenter",function(){
			$(this).addClass("tree-hover") ;
		}).live("mouseleave",function(){
			$(this).removeClass("tree-hover") ;
			
		}) ;
	}) ;*/
			
})(jQuery);