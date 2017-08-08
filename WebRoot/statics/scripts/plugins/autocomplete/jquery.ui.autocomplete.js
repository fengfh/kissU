/*
 * jQuery UI Autocomplete
 * 
 * @VERSION
 * 
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about) Dual licensed
 * under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * 
 * http://docs.jquery.com/UI/Autocomplete
 * 
 * Depends: jquery.ui.core.js jquery.ui.widget.js jquery.ui.js
 */
(function($) {
	$.widget("ui.autocomplete", {
		options : {
			minLength : 1,
			delay : 300,
			split : ',,',
			event : 'blur'
		},
		_create : function() {
			var self = this, doc = this.element[0].ownerDocument;
			this.element.attr("autocomplete",
					"off")
					// TODO verify these actually work as intended
					.attr({
								role : "textbox",
								"aria-autocomplete" : "list",
								"aria-haspopup" : "true"
							}).bind("keydown.autocomplete", function(event) {
								var keyCode = $.ui.keyCode;
								switch (event.keyCode) {
									case keyCode.PAGE_UP :
										self._move("previousPage", event);
										break;
									case keyCode.PAGE_DOWN :
										self._move("nextPage", event);
										break;
									case keyCode.UP :
										self._move("previous", event);
										// prevent moving cursor to beginning of
										// text field in some browsers
										event.preventDefault();
										break;
									case keyCode.DOWN :
										self._move("next", event);
										// prevent moving cursor to end of text
										// field in some browsers
										event.preventDefault();
										break;
									case keyCode.ENTER :
										// when menu is open or has focus
										if (self.menu.active) {
											event.preventDefault();
										}
										// passthrough - ENTER and TAB both
										// select the current element
									case keyCode.TAB :
										if (!self.menu.active) {
											return;
										}
										self.menu.select();
										break;
									case keyCode.ESCAPE :
										self.element.val(self.term);
										self.close(event);
										break;
									case keyCode.SHIFT :
									case keyCode.CONTROL :
									case 18 :
										// ignore metakeys (shift, ctrl, alt)
										break;
									default :
										// keypress is triggered before the
										// input value is changed
										clearTimeout(self.searching);
										self.searching = setTimeout(function() {
													self.search(null, event);
												}, self.options.delay);
										break;
								}
							}).bind("focus.autocomplete", function() {
								if( self.element.next().hasClass("combobox") ){
									self.element.next().find(".btn").click() ;
								}
								
								self.previous = self.element.val();
								var input = self.element ;
								if( self.options && ( self.options.focusDrop === false));
								else input.autocomplete("search", '');
								
							}).bind("blur.autocomplete", function(event) {
								if ( self.options.disabled ) {
									return;
								}

								clearTimeout( self.searching );
								// clicks on the menu (or a button to trigger a search) will cause a blur event
								self.closing = setTimeout(function() {
									
									   self.close( event );
									 
										//if ( self.previous !== self.element.val() ) {
											//self._trigger( "select", event, { item: self.selectedItem } );
										//}
								}, 150 );
								
							});
			this._initSource();
			this.response = function() {
				return self._response.apply(self, arguments);
			};
			
			var height = self.options.height||200 ;
			
			var menuHeight = "max-height:"+height+"px;";
			if ($.browser.msie) {
		        	menuHeight = "height:"+height+"px;";
		    }
		    
			this.menu = $("<ul class='dropdown-menu' style='margin:0px;"+menuHeight+";overflow-y:auto;overflow-x:hidden;'></ul>")
							.addClass("ui-autocomplete")
							.appendTo("body", doc).menu({
						focus : function(event, ui) {
							var item = ui.item.data("item.autocomplete");
							if (false !== self._trigger("focus", null, {
										item : item
									})) {
								// use value to match what will end up in the
								// input
								self.element.val(item.value);
							}
							//return false ;
						},
						selected : function(event, ui) {
							var item = ui.item.data("item.autocomplete");
							if (false !== self._trigger("select", event, {
										item : item
								})) {
								self.element.val(item.value);
							}
							
							self.close(event);
							self.previous = self.element.val();
							
							// only trigger when focus was lost (click on menu)
							if (self.element[0] !== doc.activeElement) {
								//self.element.focus();
							}
							var target = $(self.element).parent().prev("select") ;
							if($.validation)$.validation.loadValidation(target);
							if(target.change)target.change() ;
							
							//return false ;
						},
						blur : function(event, ui) {
							
							if (self.menu.element.is(":visible")) {
								self.element.val(self.term);
							}
							
							return false ;
						}
					}).zIndex(this.element.zIndex() + 1)
					// workaround for jQuery bug #5781
					// http://dev.jquery.com/ticket/5781
					.css({
							top : 0,
							left : 0
					}).hide().data("menu");
			if ($.fn.bgiframe) {
				this.menu.element.bgiframe();
			}
			
			var me = this ;
			$(document.body).click(function(e){
				var os = me.menu.element.offset() ;
				var w  = me.menu.element.width() ;
				var h  = me.menu.element.height() ;
				
				if( e.pageX < os.left || e.pageX > os.left+w || e.pageY < os.top - 50 || e.pageY > os.top + h +50  ){
					me.menu.element.hide() ;
				}
			}) ;
			
			// 如果数据源为cookie，则需要将数据保存到cookie中
			if (this.options.source == 'cookie') {

				var cookieEvent = this.options.event;

				this.element.bind(cookieEvent + ".autocomplete", function() {
							var key = 'autocomplete_'
									+ ($(this).attr('id') || $(this)
											.attr('name'));
							var val = $.cookie(key);
							var _cval = self.options.split
									+ $.trim($(this).val())
									+ self.options.split;
							if ((val || '').indexOf(_cval) != -1)
								return;// 已经存在
							val = (val || '') + _cval;
							$.cookie(key, val);

							self._formatCookie();
						});
			}
			
			this.menu.element.mouseleave(function(){
				if (self.menu.element.is(":visible")) {
					self.close();
				}
			}) ;
			
			var scrollElement = this.options.scrollElement ;
			
			$(scrollElement).length && $(scrollElement).scroll(function(){
				me.menu.element.css({ top : 0, left : 0 }).hide();
			})
		},

		destroy : function() {
			this.element
					.removeClass("ui-autocomplete-input ui-widget ui-widget-content")
					.removeAttr("autocomplete").removeAttr("role")
					.removeAttr("aria-autocomplete")
					.removeAttr("aria-haspopup");
			this.menu.element.remove();
			$.Widget.prototype.destroy.call(this);
		},

		_setOption : function(key) {
			$.Widget.prototype._setOption.apply(this, arguments);
			if (key === "source") {
				this._initSource();
			}
		},
		_formatCookie : function() {// 格式化cookie数据为数组
			var key = 'autocomplete_'
					+ (this.element.attr('id') || this.element.attr('name'));
			var val = $.cookie(key);// 获取cookie中的值

			var array = (val || '').split(this.options.split
					+ this.options.split);

			var length = array.length;

			if (array[0])
				array[0] = array[0].substring(2, array[0].length);
			if (array[length - 1])
				array[length - 1] = array[length - 1].substring(0, array[length
								- 1].length
								- 2);

			this.source = function(request, response) {
				// escape regex characters
				var matcher = new RegExp($.ui.autocomplete
								.escapeRegex(request.term), "i");
				response($.grep(array, function(value) {
							var _value = value.label || value.value || value;
							if ($.pyCompare(request.term, value)) {
								return _value;
							}
							return matcher.test(_value);
						}));
			};
		},

		/**
		 * 初始化数据源，可以从
		 */
		_initSource : function() {
			var array, url;
			if ($.isArray(this.options.source)
					|| this.options.source == 'cookie') {

				array = this.options.source;
				if (this.options.source == 'cookie') {
					this._formatCookie();
				} else {
					this.source = function(request, response) {
						// escape regex characters
						var matcher = new RegExp($.ui.autocomplete
										.escapeRegex(request.term), "i");
						response($.grep(array, function(value) {
									var _value = value.label || value.value
											|| value;
									if ($.pyCompare(request.term, value)) {
										return _value;
									}
									return matcher.test(_value);
								}));
					};
				}

			} else if (typeof this.options.source === "string") {
				var _opts = this.options ;
				this.source = function(request, resp) {
						var service_param = {};
					    
						 service_param = $.extend({}, _opts.params);
						 service_param.CommandName = _opts.CommandName;
						 service_param[_opts.variableName||"message"] = request.term;
					  	 
					  	 var url = _opts.url||(window.dataServiceUrl||"~/dataservice");
					  	 service_param['format'] = 'false' ;
					  	 $.dataservice(_opts.CommandName ,service_param , function(response){//json
		                    	resp($.map(response, function(item) {
		                    		var text = item.TEXT||item.text ;
		                    		var value = item.VALUE||item.value||item.ID||item.id ;
									return $.extend({
										   id: value,
										   label: text,
										   value: text
									}, item );
								}));
		                    },{url:url}   ) ;
				};
			} else {
				this.source = this.options.source;
			}

		},

		search : function(value, event) {
			value = value != null ? value : this.element.val();
			if (value.length < this.options.minLength) {
				return this.close(event);
			}

			clearTimeout(this.closing);
			if (this._trigger("search") === false) {
				return;
			}

			return this._search(value);
		},

		_search : function(value) {
			this.term = this.element.addClass("ui-autocomplete-loading")
					// always save the actual value, not the one passed as an
					// argument
					.val();

			this.source({
						term : value
					}, this.response);
		},

		_response : function(content, type) {
			if (content.length) {
				content = this._normalize(content);
				this._suggest(content, type);
				this._trigger("open");
			} else {
				this.close();
			}
			this.element.removeClass("ui-autocomplete-loading");
		},

		close : function(event) {
			clearTimeout(this.closing);

			var active = this.menu.active ;//.data("item.autocomplete")) ;
								

			if (this.menu.element.is(":visible")) {
				this._trigger("close", event);
				this.menu.element.hide();
				this.menu.deactivate();
			}
		
			if (this.previous !== this.element.val()) {
				if( active && active.length ){
					this._trigger("change", event , {item: active.data("item.autocomplete")  });
				}else{
					this._trigger("change", event , {item:null});
				}
			}
		},

		_normalize : function(items) {
			// assume all items have the right format when the first item is
			// complete
			if (items.length && items[0].label && items[0].value) {
				return items;
			}
			return $.map(items, function(item) {
						if (typeof item === "string") {
							return {
								label : item,
								value : item
							};
						}
						return $.extend({
									label : item.label || item.value,
									value : item.value || item.label
								}, item);
					});
		},

		_suggest : function(items, type) {
			var index =  this.menu.element.zIndex()||this.element.zIndex()  ;
			if(index && index <900) index = 900+index ;

			var ul = this.menu.element.empty()
					.zIndex(index + 1), menuWidth, textWidth;
			this._renderMenu(ul, items);
			// TODO refresh should check if the active item is still in the dom,
			// removing the need for a manual deactivate
			this.menu.deactivate();
			this.menu.refresh();

			var pos = {
				my : "left top",
				at : "left bottom",
				of : this.element,
				collision : "flip"
			};
			if ('combobox' == type) {
				pos.offset = '0 0';
			}

			this.menu.element.show().position(pos);

			textWidth = this.element.width();
			/*if ('combobox' == type) {
				//this.menu.element.width(Math.max(
				//		this.menu.element.width() + 14, textWidth));
				var fixWidth = 0;// $.browser.msie?2:-3 ;
				ul.width( this.element.parent().width() + fixWidth ) ;
			}else{
				ul.width(textWidth);
			}*/
			
			ul.width('combobox' == type?textWidth-2:textWidth);//Math.max(menuWidth, textWidth)
			var fixWidth = document.compatMode == "BackCompat" && $.browser.msie ?0:2 ;
			if ('combobox' == type) {
				this.menu.element.width(Math.max(
						this.element.parent().width()-fixWidth , textWidth));
			}
		},

		_renderMenu : function(ul, items) {
			var self = this;
			$.each(items, function(index, item) {
				self._renderItem(ul, item);
			});
			
			$(ul).find("li").hover(function(){
				$(this).addClass("autocomplete-active-item") ;
			},function(){
				$(this).removeClass("autocomplete-active-item") ;
			}) ;
		},

		_renderItem : function(ul, item) {
			return $("<li></li>").attr({title:item.value}).data("item.autocomplete", item).append("<a href='#'>"
					+ item.label + "</a>").appendTo(ul);
		},

		_move : function(direction, event) {
			if (!this.menu.element.is(":visible")) {
				this.search(null, event);
				return;
			}
			if (this.menu.first() && /^previous/.test(direction)
					|| this.menu.last() && /^next/.test(direction)) {
				this.element.val(this.term);
				this.menu.deactivate();
				return;
			}
			this.menu[direction]();
		},

		widget : function() {
			return this.menu.element;
		},

		getValue : function() {
			return {
				id:this.element.val(),
				value : this.element.val(),
				text : this.element.val()
			};
		}
	});
	
	$.extend($.ui.autocomplete, {
				escapeRegex : function(value) {
					return value.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,
							"\\$1");
				}
			});

}(jQuery));

(function($) {

	$.widget("ui.menu", {
		_create : function() {
			var self = this;
			this.element.addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
			.attr({
								role : "menu",
								"aria-activedescendant" : "ui-active-menuitem"
							}) .click(function(e) {
								// temporary
								e.preventDefault();
								self.select();
							});
			this.refresh();
		},

		refresh : function() {
			var self = this;

			// don't refresh list items that are already adapted
			var items = this.element.children("li:not(.ui-menu-item):has(a)")
					.addClass("ui-menu-item")
					.attr("role", "menuitem");

			/*items.children("a").addClass("ui-corner-all").attr("tabindex", -1)
					.mouseenter(function() {
								self.activate($(this).parent());
							}).mouseleave(function() {
								self.deactivate();
							});*/
			items.children("a").attr("tabindex", -1).parents("li")
					.mouseenter(function() {
						self.activate($(this));
					}).mouseleave(function() {
						self.deactivate();
					}) ;
		},

		activate : function(item) {
			this.deactivate();
			if (this.hasScroll()) {
				var offset = item.offset().top - this.element.offset().top, scroll = this.element
						.attr("scrollTop"), elementHeight = this.element
						.height();
				if (offset < 0) {
					this.element.attr("scrollTop", scroll + offset);
				} else if (offset > elementHeight) {
					this.element.attr("scrollTop", scroll + offset
									- elementHeight + item.height());
				}
			}
			this.active = item.eq(0).addClass("ui-state-hover ui-state-hover-autocomplete")
					.attr("id", "ui-active-menuitem").end();//.children("a")
			this._trigger("focus", null, {
				item : item
			});
		},

		deactivate : function() {
			if (!this.active) {
				return;
			}

			this.active.removeClass("ui-state-hover ui-state-hover-autocomplete")
					.removeAttr("id");//.children("a")
			this._trigger("blur");
			this.active = null;
		},

		next : function() {
			this.move("next", "li:first");
		},

		previous : function() {
			this.move("prev", "li:last");
		},

		first : function() {
			return this.active && !this.active.prev().length;
		},

		last : function() {
			return this.active && !this.active.next().length;
		},

		move : function(direction, edge) {
			if (!this.active) {
				this.activate(this.element.children(edge));
				return;
			}
			var next = this.active[direction]();
			if (next.length) {
				this.activate(next);
			} else {
				this.activate(this.element.children(edge));
			}
		},

		// TODO merge with previousPage
		nextPage : function() {
			if (this.hasScroll()) {
				// TODO merge with no-scroll-else
				if (!this.active || this.last()) {
					this.activate(this.element.children(":first"));
					return;
				}
				var base = this.active.offset().top, height = this.element
						.height(), result = this.element.children("li").filter(
						function() {
							var close = $(this).offset().top - base - height
									+ $(this).height();
							// TODO improve approximation
							return close < 10 && close > -10;
						});

				// TODO try to catch this earlier when scrollTop indicates the
				// last page anyway
				if (!result.length) {
					result = this.element.children(":last");
				}
				this.activate(result);
			} else {
				this.activate(this.element.children(!this.active || this.last()
						? ":first"
						: ":last"));
			}
		},

		// TODO merge with nextPage
		previousPage : function() {
			if (this.hasScroll()) {
				// TODO merge with no-scroll-else
				if (!this.active || this.first()) {
					this.activate(this.element.children(":last"));
					return;
				}

				var base = this.active.offset().top, height = this.element
						.height();
				result = this.element.children("li").filter(function() {
					var close = $(this).offset().top - base + height
							- $(this).height();
					// TODO improve approximation
					return close < 10 && close > -10;
				});

				// TODO try to catch this earlier when scrollTop indicates the
				// last page anyway
				if (!result.length) {
					result = this.element.children(":first");
				}
				this.activate(result);
			} else {
				this.activate(this.element.children(!this.active
						|| this.first() ? ":last" : ":first"));
			}
		},

		hasScroll : function() {
			return this.element.height() < this.element.attr("scrollHeight");
		},

		select : function() {
			//alert(this.active);
			this._trigger("selected", null, {
				item : this.active
			});
		}
	});

	$.widget("ui.combobox", {
		_create : function() {
			//reset
			if( this.element.attr($.uiwidget.defaultValue) ){
				this.element.val( this.element.attr($.uiwidget.defaultValue) ) ;
			}
			
			var self = this;
			var select = this.element.hide();
			
			var options = {
					source : function(request, response) {
						 var _opts = self.options ;
						 if(_opts.CommandName){
						 	 var service_param = {};
							 service_param = $.extend({}, _opts.params);
							 service_param.CommandName = _opts.CommandName;
							 service_param[_opts.variableName||"message"] = request.term;
						  	 var url = _opts.url||(window.dataServiceUrl||"~/dataservice");
						  	 service_param['format'] = 'false' ;
						  	 
						  	 $.dataservice(_opts.CommandName,service_param,function(resp){//json
						  	 		select.empty() ;
			                    	response($.map(resp, function(item) {
			                    		var text = item.TEXT||item.text ;
			                    		var value = item.VALUE||item.value||item.ID||item.id ;
			                    		if(!select.find("[value="+value+"]")[0]){
			                    			select.append("<option value='"+value+"'>"+text+"</option>") ;
			                    		}
										return $.extend({
										   id: value,
										   label: text,
										   value: text
									   }, item );
									}),'combobox');
			                    },{url:url} ) ;
						 }else{
							var matcher = new RegExp(request.term, "i");
							response(select.children("option").map(function() {
								var text = $(this).text()||'&nbsp;';
								// 拼音首字母解析
								if (!request.term || matcher.test(text)
										|| $.pyCompare(request.term, text)){
											var label ;
											if(!$.trim(text) || text == '&nbsp;'){
												label = "<div style='height:20'>&nbsp;</div> " ;
												text = "" ;
											}else label = text.replace(
														new RegExp("(?![^&;]+;)(?!<[^<>]*)("
														+ request.term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi,"\\$1")
														+ ")(?![^<>]*>)(?![^&;]+;)","gi"),"<strong>$1</strong>") ;
										
											
									return {
										id    : $(this).val(),
										label : label,
										value : text
									};
								}
									
							}), 'combobox');
						 }
					},
					delay : 0,
					select : function(e, ui) {
						if (!ui.item) {
							$(this).val("");
							return false;
						}

						self.element.val(ui.item.id);
						self._trigger("selected", null, {
							item : select.find("[value='"+ ui.item.id + "']")
						});

					},
					minLength : 0
				} ;
			this.options.source = options.source ;
			this.options = $.extend(options,this.options) ;
			
			//create proxy
			var width = $(select).width() ;
			if( $(select)[0].className ){
				var prxoy = $("<input type='hidden' style='position:absolute;left:-200px;'>").insertAfter(select).addClass( $(select)[0].className ) ;
				width = Math.max( prxoy.width(), $(select).width() );
				prxoy.remove() ;
			}

			var input = null ;
			if(select.next().hasClass("combobox")){
				input = select.next().addClass("ui-widget").find("input").autocomplete(this.options);
			}else{
				input = $('<input class="include-span input-span-uneditable" type="text">').insertAfter(select)
					.wrap('<span class="combobox input-append ui-widget"></span>')
					.autocomplete(this.options);
				$('<span class="add-on btn button-reset"><i class="ui-icon ui-icon-triangle-1-s icon-chevron-down"></i></span>').insertAfter(input) ;
				input.width( width-26 ) ;
			}
			
			
			if( document.compatMode == "BackCompat" ){
				if($.browser.msie){
					select.next().find(".btn").css("margin-bottom","0px") ;
					input.css("padding","0px 4px") ;
					input.height( select.next().find(".btn").outerHeight()  ) ;
				}else{
					input.height( select.next().find(".btn").outerHeight()  ) ;
				}
			}
			
			//for validate
			if($.validation){
				$(select).data('validate_target',input.parent('.combobox'));
			}
			
			if( this.options.editable === false ) input.attr('readOnly',true); ;

			// 渲染默认值
			if ($(select).find('option:selected').val()) {
				input.val($(select).find('option:selected').text());
			}

			/*var _span = $("<span>&nbsp;</span>") ;
			
			_span.insertAfter(input)
					.removeClass("ui-corner-all")
					.addClass("ui-icon ui-icon-triangle-1-s");*/
					
			if( this.element.attr("disabled") || this.options.disabled ){
				this.disable() ;
			}else{
				this.enable() ;
			}
		},
		getValue : function() {
			// 获取输入框的值
			var inputVal = this.element.next().find('input').val();
			// 获取下拉框的值
			var selectVal = this.element.val() ;
			//alert( $(this.element).find('option[selected]').val()+"       "+selectVal ) ;
			var text = this.element.find('option[value='+selectVal+']').text();
			var label = inputVal;
			var value = $.trim(inputVal) == $.trim(text) ? selectVal: inputVal;
			//alert(selectVal+"       "+inputVal+"   "+text+"     "+label) ;	
			return {
				value : value,
				text : label
			};
		},
		setValue:function(value){
			var label = this.element.find('option[value='+value+']').text();
			this.element.next().find('input').val(label) ;
			this.element.val(value);
		},
		disable:function(){
			var input = this.element.next().find('input') ;
			input.attr("disabled",true);
			input.next(".btn").unbind("click").addClass("ui-state-disabled") ;
		},enable:function(){
			var input = this.element.next().find('input') ;
			input.attr("disabled",false);
			input.next(".btn").removeClass("ui-state-disabled").bind("click",function(){
				if (input.autocomplete("widget").is(":visible")) {
					input.autocomplete("close");
					return;
				}
				input.autocomplete("search", "");
				return false ;
			}) ;
		},
		reload:function(options){
			var input = this.element.next().find('input') ;
			this.options = $.extend(this.options,options) ;
			input.autocomplete("destroy");
			input.val('') ;
			input.autocomplete(this.options);
		}
	});
	
	///////////////////////////////
	
	//拼音比较处理
	jQuery.pyCompare = function(py, zy) {
	
		var _szm = (makePy(zy)||[""])[0].toLowerCase();
		
		if (py == _szm  || _szm.indexOf(py) != -1)
			return true;
		else
			return false;
	
		
		// 参数,中文字符串
		// 返回值:拼音首字母串数组
		function makePy(str) {
			if (typeof(str) != "string")
				throw new Error(-1, "函数makePy需要字符串类型参数!");
			var arrResult = new Array(); // 保存中间结果的数组
			for (var i = 0, len = str.length; i < len; i++) {
				// 获得unicode码
				var ch = str.charAt(i);
				// 检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理
				arrResult.push(checkCh(ch));
			}
			// 处理arrResult,返回所有可能的拼音首字母串数组
			return mkRslt(arrResult);
		}
		function checkCh(ch) {
			var strChineseFirstPY = "YDYQSXMWZSSXJBYMGCCZQPSSQBYCDSCDQLDYLYBSSJGYZZJJFKCCLZDHWDWZJLJPFYYNWJJTMYHZWZHFLZPPQHGSCYYYNJQYXXGJHHSDSJNKKTMOMLCRXYPSNQSECCQZGGLLYJLMYZZSECYKYYHQWJSSGGYXYZYJWWKDJHYCHMYXJTLXJYQBYXZLDWRDJRWYSRLDZJPCBZJJBRCFTLECZSTZFXXZHTRQHYBDLYCZSSYMMRFMYQZPWWJJYFCRWFDFZQPYDDWYXKYJAWJFFXYPSFTZYHHYZYSWCJYXSCLCXXWZZXNBGNNXBXLZSZSBSGPYSYZDHMDZBQBZCWDZZYYTZHBTSYYBZGNTNXQYWQSKBPHHLXGYBFMJEBJHHGQTJCYSXSTKZHLYCKGLYSMZXYALMELDCCXGZYRJXSDLTYZCQKCNNJWHJTZZCQLJSTSTBNXBTYXCEQXGKWJYFLZQLYHYXSPSFXLMPBYSXXXYDJCZYLLLSJXFHJXPJBTFFYABYXBHZZBJYZLWLCZGGBTSSMDTJZXPTHYQTGLJSCQFZKJZJQNLZWLSLHDZBWJNCJZYZSQQYCQYRZCJJWYBRTWPYFTWEXCSKDZCTBZHYZZYYJXZCFFZZMJYXXSDZZOTTBZLQWFCKSZSXFYRLNYJMBDTHJXSQQCCSBXYYTSYFBXDZTGBCNSLCYZZPSAZYZZSCJCSHZQYDXLBPJLLMQXTYDZXSQJTZPXLCGLQTZWJBHCTSYJSFXYEJJTLBGXSXJMYJQQPFZASYJNTYDJXKJCDJSZCBARTDCLYJQMWNQNCLLLKBYBZZSYHQQLTWLCCXTXLLZNTYLNEWYZYXCZXXGRKRMTCNDNJTSYYSSDQDGHSDBJGHRWRQLYBGLXHLGTGXBQJDZPYJSJYJCTMRNYMGRZJCZGJMZMGXMPRYXKJNYMSGMZJYMKMFXMLDTGFBHCJHKYLPFMDXLQJJSMTQGZSJLQDLDGJYCALCMZCSDJLLNXDJFFFFJCZFMZFFPFKHKGDPSXKTACJDHHZDDCRRCFQYJKQCCWJDXHWJLYLLZGCFCQDSMLZPBJJPLSBCJGGDCKKDEZSQCCKJGCGKDJTJDLZYCXKLQSCGJCLTFPCQCZGWPJDQYZJJBYJHSJDZWGFSJGZKQCCZLLPSPKJGQJHZZLJPLGJGJJTHJJYJZCZMLZLYQBGJWMLJKXZDZNJQSYZMLJLLJKYWXMKJLHSKJGBMCLYYMKXJQLBMLLKMDXXKWYXYSLMLPSJQQJQXYXFJTJDXMXXLLCXQBSYJBGWYMBGGBCYXPJYGPEPFGDJGBHBNSQJYZJKJKHXQFGQZKFHYGKHDKLLSDJQXPQYKYBNQSXQNSZSWHBSXWHXWBZZXDMNSJBSBKBBZKLYLXGWXDRWYQZMYWSJQLCJXXJXKJEQXSCYETLZHLYYYSDZPAQYZCMTLSHTZCFYZYXYLJSDCJQAGYSLCQLYYYSHMRQQKLDXZSCSSSYDYCJYSFSJBFRSSZQSBXXPXJYSDRCKGJLGDKZJZBDKTCSYQPYHSTCLDJDHMXMCGXYZHJDDTMHLTXZXYLYMOHYJCLTYFBQQXPFBDFHHTKSQHZYYWCNXXCRWHOWGYJLEGWDQCWGFJYCSNTMYTOLBYGWQWESJPWNMLRYDZSZTXYQPZGCWXHNGPYXSHMYQJXZTDPPBFYHZHTJYFDZWKGKZBLDNTSXHQEEGZZYLZMMZYJZGXZXKHKSTXNXXWYLYAPSTHXDWHZYMPXAGKYDXBHNHXKDPJNMYHYLPMGOCSLNZHKXXLPZZLBMLSFBHHGYGYYGGBHSCYAQTYWLXTZQCEZYDQDQMMHTKLLSZHLSJZWFYHQSWSCWLQAZYNYTLSXTHAZNKZZSZZLAXXZWWCTGQQTDDYZTCCHYQZFLXPSLZYGPZSZNGLNDQTBDLXGTCTAJDKYWNSYZLJHHZZCWNYYZYWMHYCHHYXHJKZWSXHZYXLYSKQYSPSLYZWMYPPKBYGLKZHTYXAXQSYSHXASMCHKDSCRSWJPWXSGZJLWWSCHSJHSQNHCSEGNDAQTBAALZZMSSTDQJCJKTSCJAXPLGGXHHGXXZCXPDMMHLDGTYBYSJMXHMRCPXXJZCKZXSHMLQXXTTHXWZFKHCCZDYTCJYXQHLXDHYPJQXYLSYYDZOZJNYXQEZYSQYAYXWYPDGXDDXSPPYZNDLTWRHXYDXZZJHTCXMCZLHPYYYYMHZLLHNXMYLLLMDCPPXHMXDKYCYRDLTXJCHHZZXZLCCLYLNZSHZJZZLNNRLWHYQSNJHXYNTTTKYJPYCHHYEGKCTTWLGQRLGGTGTYGYHPYHYLQYQGCWYQKPYYYTTTTLHYHLLTYTTSPLKYZXGZWGPYDSSZZDQXSKCQNMJJZZBXYQMJRTFFBTKHZKBXLJJKDXJTLBWFZPPTKQTZTGPDGNTPJYFALQMKGXBDCLZFHZCLLLLADPMXDJHLCCLGYHDZFGYDDGCYYFGYDXKSSEBDHYKDKDKHNAXXYBPBYYHXZQGAFFQYJXDMLJCSQZLLPCHBSXGJYNDYBYQSPZWJLZKSDDTACTBXZDYZYPJZQSJNKKTKNJDJGYYPGTLFYQKASDNTCYHBLWDZHBBYDWJRYGKZYHEYYFJMSDTYFZJJHGCXPLXHLDWXXJKYTCYKSSSMTWCTTQZLPBSZDZWZXGZAGYKTYWXLHLSPBCLLOQMMZSSLCMBJCSZZKYDCZJGQQDSMCYTZQQLWZQZXSSFPTTFQMDDZDSHDTDWFHTDYZJYQJQKYPBDJYYXTLJHDRQXXXHAYDHRJLKLYTWHLLRLLRCXYLBWSRSZZSYMKZZHHKYHXKSMDSYDYCJPBZBSQLFCXXXNXKXWYWSDZYQOGGQMMYHCDZTTFJYYBGSTTTYBYKJDHKYXBELHTYPJQNFXFDYKZHQKZBYJTZBXHFDXKDASWTAWAJLDYJSFHBLDNNTNQJTJNCHXFJSRFWHZFMDRYJYJWZPDJKZYJYMPCYZNYNXFBYTFYFWYGDBNZZZDNYTXZEMMQBSQEHXFZMBMFLZZSRXYMJGSXWZJSPRYDJSJGXHJJGLJJYNZZJXHGXKYMLPYYYCXYTWQZSWHWLYRJLPXSLSXMFSWWKLCTNXNYNPSJSZHDZEPTXMYYWXYYSYWLXJQZQXZDCLEEELMCPJPCLWBXSQHFWWTFFJTNQJHJQDXHWLBYZNFJLALKYYJLDXHHYCSTYYWNRJYXYWTRMDRQHWQCMFJDYZMHMYYXJWMYZQZXTLMRSPWWCHAQBXYGZYPXYYRRCLMPYMGKSJSZYSRMYJSNXTPLNBAPPYPYLXYYZKYNLDZYJZCZNNLMZHHARQMPGWQTZMXXMLLHGDZXYHXKYXYCJMFFYYHJFSBSSQLXXNDYCANNMTCJCYPRRNYTYQNYYMBMSXNDLYLYSLJRLXYSXQMLLYZLZJJJKYZZCSFBZXXMSTBJGNXYZHLXNMCWSCYZYFZLXBRNNNYLBNRTGZQYSATSWRYHYJZMZDHZGZDWYBSSCSKXSYHYTXXGCQGXZZSHYXJSCRHMKKBXCZJYJYMKQHZJFNBHMQHYSNJNZYBKNQMCLGQHWLZNZSWXKHLJHYYBQLBFCDSXDLDSPFZPSKJYZWZXZDDXJSMMEGJSCSSMGCLXXKYYYLNYPWWWGYDKZJGGGZGGSYCKNJWNJPCXBJJTQTJWDSSPJXZXNZXUMELPXFSXTLLXCLJXJJLJZXCTPSWXLYDHLYQRWHSYCSQYYBYAYWJJJQFWQCQQCJQGXALDBZZYJGKGXPLTZYFXJLTPADKYQHPMATLCPDCKBMTXYBHKLENXDLEEGQDYMSAWHZMLJTWYGXLYQZLJEEYYBQQFFNLYXRDSCTGJGXYYNKLLYQKCCTLHJLQMKKZGCYYGLLLJDZGYDHZWXPYSJBZKDZGYZZHYWYFQYTYZSZYEZZLYMHJJHTSMQWYZLKYYWZCSRKQYTLTDXWCTYJKLWSQZWBDCQYNCJSRSZJLKCDCDTLZZZACQQZZDDXYPLXZBQJYLZLLLQDDZQJYJYJZYXNYYYNYJXKXDAZWYRDLJYYYRJLXLLDYXJCYWYWNQCCLDDNYYYNYCKCZHXXCCLGZQJGKWPPCQQJYSBZZXYJSQPXJPZBSBDSFNSFPZXHDWZTDWPPTFLZZBZDMYYPQJRSDZSQZSQXBDGCPZSWDWCSQZGMDHZXMWWFYBPDGPHTMJTHZSMMBGZMBZJCFZWFZBBZMQCFMBDMCJXLGPNJBBXGYHYYJGPTZGZMQBQTCGYXJXLWZKYDPDYMGCFTPFXYZTZXDZXTGKMTYBBCLBJASKYTSSQYYMSZXFJEWLXLLSZBQJJJAKLYLXLYCCTSXMCWFKKKBSXLLLLJYXTYLTJYYTDPJHNHNNKBYQNFQYYZBYYESSESSGDYHFHWTCJBSDZZTFDMXHCNJZYMQWSRYJDZJQPDQBBSTJGGFBKJBXTGQHNGWJXJGDLLTHZHHYYYYYYSXWTYYYCCBDBPYPZYCCZYJPZYWCBDLFWZCWJDXXHYHLHWZZXJTCZLCDPXUJCZZZLYXJJTXPHFXWPYWXZPTDZZBDZCYHJHMLXBQXSBYLRDTGJRRCTTTHYTCZWMXFYTWWZCWJWXJYWCSKYBZSCCTZQNHXNWXXKHKFHTSWOCCJYBCMPZZYKBNNZPBZHHZDLSYDDYTYFJPXYNGFXBYQXCBHXCPSXTYZDMKYSNXSXLHKMZXLYHDHKWHXXSSKQYHHCJYXGLHZXCSNHEKDTGZXQYPKDHEXTYKCNYMYYYPKQYYYKXZLTHJQTBYQHXBMYHSQCKWWYLLHCYYLNNEQXQWMCFBDCCMLJGGXDQKTLXKGNQCDGZJWYJJLYHHQTTTNWCHMXCXWHWSZJYDJCCDBQCDGDNYXZTHCQRXCBHZTQCBXWGQWYYBXHMBYMYQTYEXMQKYAQYRGYZSLFYKKQHYSSQYSHJGJCNXKZYCXSBXYXHYYLSTYCXQTHYSMGSCPMMGCCCCCMTZTASMGQZJHKLOSQYLSWTMXSYQKDZLJQQYPLSYCZTCQQPBBQJZCLPKHQZYYXXDTDDTSJCXFFLLCHQXMJLWCJCXTSPYCXNDTJSHJWXDQQJSKXYAMYLSJHMLALYKXCYYDMNMDQMXMCZNNCYBZKKYFLMCHCMLHXRCJJHSYLNMTJZGZGYWJXSRXCWJGJQHQZDQJDCJJZKJKGDZQGJJYJYLXZXXCDQHHHEYTMHLFSBDJSYYSHFYSTCZQLPBDRFRZTZYKYWHSZYQKWDQZRKMSYNBCRXQBJYFAZPZZEDZCJYWBCJWHYJBQSZYWRYSZPTDKZPFPBNZTKLQYHBBZPNPPTYZZYBQNYDCPJMMCYCQMCYFZZDCMNLFPBPLNGQJTBTTNJZPZBBZNJKLJQYLNBZQHKSJZNGGQSZZKYXSHPZSNBCGZKDDZQANZHJKDRTLZLSWJLJZLYWTJNDJZJHXYAYNCBGTZCSSQMNJPJYTYSWXZFKWJQTKHTZPLBHSNJZSYZBWZZZZLSYLSBJHDWWQPSLMMFBJDWAQYZTCJTBNNWZXQXCDSLQGDSDPDZHJTQQPSWLYYJZLGYXYZLCTCBJTKTYCZJTQKBSJLGMGZDMCSGPYNJZYQYYKNXRPWSZXMTNCSZZYXYBYHYZAXYWQCJTLLCKJJTJHGDXDXYQYZZBYWDLWQCGLZGJGQRQZCZSSBCRPCSKYDZNXJSQGXSSJMYDNSTZTPBDLTKZWXQWQTZEXNQCZGWEZKSSBYBRTSSSLCCGBPSZQSZLCCGLLLZXHZQTHCZMQGYZQZNMCOCSZJMMZSQPJYGQLJYJPPLDXRGZYXCCSXHSHGTZNLZWZKJCXTCFCJXLBMQBCZZWPQDNHXLJCTHYZLGYLNLSZZPCXDSCQQHJQKSXZPBAJYEMSMJTZDXLCJYRYYNWJBNGZZTMJXLTBSLYRZPYLSSCNXPHLLHYLLQQZQLXYMRSYCXZLMMCZLTZSDWTJJLLNZGGQXPFSKYGYGHBFZPDKMWGHCXMSGDXJMCJZDYCABXJDLNBCDQYGSKYDQTXDJJYXMSZQAZDZFSLQXYJSJZYLBTXXWXQQZBJZUFBBLYLWDSLJHXJYZJWTDJCZFQZQZZDZSXZZQLZCDZFJHYSPYMPQZMLPPLFFXJJNZZYLSJEYQZFPFZKSYWJJJHRDJZZXTXXGLGHYDXCSKYSWMMZCWYBAZBJKSHFHJCXMHFQHYXXYZFTSJYZFXYXPZLCHMZMBXHZZSXYFYMNCWDABAZLXKTCSHHXKXJJZJSTHYGXSXYYHHHJWXKZXSSBZZWHHHCWTZZZPJXSNXQQJGZYZYWLLCWXZFXXYXYHXMKYYSWSQMNLNAYCYSPMJKHWCQHYLAJJMZXHMMCNZHBHXCLXTJPLTXYJHDYYLTTXFSZHYXXSJBJYAYRSMXYPLCKDUYHLXRLNLLSTYZYYQYGYHHSCCSMZCTZQXKYQFPYYRPFFLKQUNTSZLLZMWWTCQQYZWTLLMLMPWMBZSSTZRBPDDTLQJJBXZCSRZQQYGWCSXFWZLXCCRSZDZMCYGGDZQSGTJSWLJMYMMZYHFBJDGYXCCPSHXNZCSBSJYJGJMPPWAFFYFNXHYZXZYLREMZGZCYZSSZDLLJCSQFNXZKPTXZGXJJGFMYYYSNBTYLBNLHPFZDCYFBMGQRRSSSZXYSGTZRNYDZZCDGPJAFJFZKNZBLCZSZPSGCYCJSZLMLRSZBZZLDLSLLYSXSQZQLYXZLSKKBRXBRBZCYCXZZZEEYFGKLZLYYHGZSGZLFJHGTGWKRAAJYZKZQTSSHJJXDCYZUYJLZYRZDQQHGJZXSSZBYKJPBFRTJXLLFQWJHYLQTYMBLPZDXTZYGBDHZZRBGXHWNJTJXLKSCFSMWLSDQYSJTXKZSCFWJLBXFTZLLJZLLQBLSQMQQCGCZFPBPHZCZJLPYYGGDTGWDCFCZQYYYQYSSCLXZSKLZZZGFFCQNWGLHQYZJJCZLQZZYJPJZZBPDCCMHJGXDQDGDLZQMFGPSYTSDYFWWDJZJYSXYYCZCYHZWPBYKXRYLYBHKJKSFXTZJMMCKHLLTNYYMSYXYZPYJQYCSYCWMTJJKQYRHLLQXPSGTLYYCLJSCPXJYZFNMLRGJJTYZBXYZMSJYJHHFZQMSYXRSZCWTLRTQZSSTKXGQKGSPTGCZNJSJCQCXHMXGGZTQYDJKZDLBZSXJLHYQGGGTHQSZPYHJHHGYYGKGGCWJZZYLCZLXQSFTGZSLLLMLJSKCTBLLZZSZMMNYTPZSXQHJCJYQXYZXZQZCPSHKZZYSXCDFGMWQRLLQXRFZTLYSTCTMJCXJJXHJNXTNRZTZFQYHQGLLGCXSZSJDJLJCYDSJTLNYXHSZXCGJZYQPYLFHDJSBPCCZHJJJQZJQDYBSSLLCMYTTMQTBHJQNNYGKYRQYQMZGCJKPDCGMYZHQLLSLLCLMHOLZGDYYFZSLJCQZLYLZQJESHNYLLJXGJXLYSYYYXNBZLJSSZCQQCJYLLZLTJYLLZLLBNYLGQCHXYYXOXCXQKYJXXXYKLXSXXYQXCYKQXQCSGYXXYQXYGYTQOHXHXPYXXXULCYEYCHZZCBWQBBWJQZSCSZSSLZYLKDESJZWMYMCYTSDSXXSCJPQQSQYLYYZYCMDJDZYWCBTJSYDJKCYDDJLBDJJSODZYSYXQQYXDHHGQQYQHDYXWGMMMAJDYBBBPPBCMUUPLJZSMTXERXJMHQNUTPJDCBSSMSSSTKJTSSMMTRCPLZSZMLQDSDMJMQPNQDXCFYNBFSDQXYXHYAYKQYDDLQYYYSSZBYDSLNTFQTZQPZMCHDHCZCWFDXTMYQSPHQYYXSRGJCWTJTZZQMGWJJTJHTQJBBHWZPXXHYQFXXQYWYYHYSCDYDHHQMNMTMWCPBSZPPZZGLMZFOLLCFWHMMSJZTTDHZZYFFYTZZGZYSKYJXQYJZQBHMBZZLYGHGFMSHPZFZSNCLPBQSNJXZSLXXFPMTYJYGBXLLDLXPZJYZJYHHZCYWHJYLSJEXFSZZYWXKZJLUYDTMLYMQJPWXYHXSKTQJEZRPXXZHHMHWQPWQLYJJQJJZSZCPHJLCHHNXJLQWZJHBMZYXBDHHYPZLHLHLGFWLCHYYTLHJXCJMSCPXSTKPNHQXSRTYXXTESYJCTLSSLSTDLLLWWYHDHRJZSFGXTSYCZYNYHTDHWJSLHTZDQDJZXXQHGYLTZPHCSQFCLNJTCLZPFSTPDYNYLGMJLLYCQHYSSHCHYLHQYQTMZYPBYWRFQYKQSYSLZDQJMPXYYSSRHZJNYWTQDFZBWWTWWRXCWHGYHXMKMYYYQMSMZHNGCEPMLQQMTCWCTMMPXJPJJHFXYYZSXZHTYBMSTSYJTTQQQYYLHYNPYQZLCYZHZWSMYLKFJXLWGXYPJYTYSYXYMZCKTTWLKSMZSYLMPWLZWXWQZSSAQSYXYRHSSNTSRAPXCPWCMGDXHXZDZYFJHGZTTSBJHGYZSZYSMYCLLLXBTYXHBBZJKSSDMALXHYCFYGMQYPJYCQXJLLLJGSLZGQLYCJCCZOTYXMTMTTLLWTGPXYMZMKLPSZZZXHKQYSXCTYJZYHXSHYXZKXLZWPSQPYHJWPJPWXQQYLXSDHMRSLZZYZWTTCYXYSZZSHBSCCSTPLWSSCJCHNLCGCHSSPHYLHFHHXJSXYLLNYLSZDHZXYLSXLWZYKCLDYAXZCMDDYSPJTQJZLNWQPSSSWCTSTSZLBLNXSMNYYMJQBQHRZWTYYDCHQLXKPZWBGQYBKFCMZWPZLLYYLSZYDWHXPSBCMLJBSCGBHXLQHYRLJXYSWXWXZSLDFHLSLYNJLZYFLYJYCDRJLFSYZFSLLCQYQFGJYHYXZLYLMSTDJCYHBZLLNWLXXYGYYHSMGDHXXHHLZZJZXCZZZCYQZFNGWPYLCPKPYYPMCLQKDGXZGGWQBDXZZKZFBXXLZXJTPJPTTBYTSZZDWSLCHZHSLTYXHQLHYXXXYYZYSWTXZKHLXZXZPYHGCHKCFSYHUTJRLXFJXPTZTWHPLYXFCRHXSHXKYXXYHZQDXQWULHYHMJTBFLKHTXCWHJFWJCFPQRYQXCYYYQYGRPYWSGSUNGWCHKZDXYFLXXHJJBYZWTSXXNCYJJYMSWZJQRMHXZWFQSYLZJZGBHYNSLBGTTCSYBYXXWXYHXYYXNSQYXMQYWRGYQLXBBZLJSYLPSYTJZYHYZAWLRORJMKSCZJXXXYXCHDYXRYXXJDTSQFXLYLTSFFYXLMTYJMJUYYYXLTZCSXQZQHZXLYYXZHDNBRXXXJCTYHLBRLMBRLLAXKYLLLJLYXXLYCRYLCJTGJCMTLZLLCYZZPZPCYAWHJJFYBDYYZSMPCKZDQYQPBPCJPDCYZMDPBCYYDYCNNPLMTMLRMFMMGWYZBSJGYGSMZQQQZTXMKQWGXLLPJGZBQCDJJJFPKJKCXBLJMSWMDTQJXLDLPPBXCWRCQFBFQJCZAHZGMYKPHYYHZYKNDKZMBPJYXPXYHLFPNYYGXJDBKXNXHJMZJXSTRSTLDXSKZYSYBZXJLXYSLBZYSLHXJPFXPQNBYLLJQKYGZMCYZZYMCCSLCLHZFWFWYXZMWSXTYNXJHPYYMCYSPMHYSMYDYSHQYZCHMJJMZCAAGCFJBBHPLYZYLXXSDJGXDHKXXTXXNBHRMLYJSLTXMRHNLXQJXYZLLYSWQGDLBJHDCGJYQYCMHWFMJYBMBYJYJWYMDPWHXQLDYGPDFXXBCGJSPCKRSSYZJMSLBZZJFLJJJLGXZGYXYXLSZQYXBEXYXHGCXBPLDYHWETTWWCJMBTXCHXYQXLLXFLYXLLJLSSFWDPZSMYJCLMWYTCZPCHQEKCQBWLCQYDPLQPPQZQFJQDJHYMMCXTXDRMJWRHXCJZYLQXDYYNHYYHRSLSRSYWWZJYMTLTLLGTQCJZYABTCKZCJYCCQLJZQXALMZYHYWLWDXZXQDLLQSHGPJFJLJHJABCQZDJGTKHSSTCYJLPSWZLXZXRWGLDLZRLZXTGSLLLLZLYXXWGDZYGBDPHZPBRLWSXQBPFDWOFMWHLYPCBJCCLDMBZPBZZLCYQXLDOMZBLZWPDWYYGDSTTHCSQSCCRSSSYSLFYBFNTYJSZDFNDPDHDZZMBBLSLCMYFFGTJJQWFTMTPJWFNLBZCMMJTGBDZLQLPYFHYYMJYLSDCHDZJWJCCTLJCLDTLJJCPDDSQDSSZYBNDBJLGGJZXSXNLYCYBJXQYCBYLZCFZPPGKCXZDZFZTJJFJSJXZBNZYJQTTYJYHTYCZHYMDJXTTMPXSPLZCDWSLSHXYPZGTFMLCJTYCBPMGDKWYCYZCDSZZYHFLYCTYGWHKJYYLSJCXGYWJCBLLCSNDDBTZBSCLYZCZZSSQDLLMQYYHFSLQLLXFTYHABXGWNYWYYPLLSDLDLLBJCYXJZMLHLJDXYYQYTDLLLBUGBFDFBBQJZZMDPJHGCLGMJJPGAEHHBWCQXAXHHHZCHXYPHJAXHLPHJPGPZJQCQZGJJZZUZDMQYYBZZPHYHYBWHAZYJHYKFGDPFQSDLZMLJXKXGALXZDAGLMDGXMWZQYXXDXXPFDMMSSYMPFMDMMKXKSYZYSHDZKXSYSMMZZZMSYDNZZCZXFPLSTMZDNMXCKJMZTYYMZMZZMSXHHDCZJEMXXKLJSTLWLSQLYJZLLZJSSDPPMHNLZJCZYHMXXHGZCJMDHXTKGRMXFWMCGMWKDTKSXQMMMFZZYDKMSCLCMPCGMHSPXQPZDSSLCXKYXTWLWJYAHZJGZQMCSNXYYMMPMLKJXMHLMLQMXCTKZMJQYSZJSYSZHSYJZJCDAJZYBSDQJZGWZQQXFKDMSDJLFWEHKZQKJPEYPZYSZCDWYJFFMZZYLTTDZZEFMZLBNPPLPLPEPSZALLTYLKCKQZKGENQLWAGYXYDPXLHSXQQWQCQXQCLHYXXMLYCCWLYMQYSKGCHLCJNSZKPYZKCQZQLJPDMDZHLASXLBYDWQLWDNBQCRYDDZTJYBKBWSZDXDTNPJDTCTQDFXQQMGNXECLTTBKPWSLCTYQLPWYZZKLPYGZCQQPLLKCCYLPQMZCZQCLJSLQZDJXLDDHPZQDLJJXZQDXYZQKZLJCYQDYJPPYPQYKJYRMPCBYMCXKLLZLLFQPYLLLMBSGLCYSSLRSYSQTMXYXZQZFDZUYSYZTFFMZZSMZQHZSSCCMLYXWTPZGXZJGZGSJSGKDDHTQGGZLLBJDZLCBCHYXYZHZFYWXYZYMSDBZZYJGTSMTFXQYXQSTDGSLNXDLRYZZLRYYLXQHTXSRTZNGZXBNQQZFMYKMZJBZYMKBPNLYZPBLMCNQYZZZSJZHJCTZKHYZZJRDYZHNPXGLFZTLKGJTCTSSYLLGZRZBBQZZKLPKLCZYSSUYXBJFPNJZZXCDWXZYJXZZDJJKGGRSRJKMSMZJLSJYWQSKYHQJSXPJZZZLSNSHRNYPZTWCHKLPSRZLZXYJQXQKYSJYCZTLQZYBBYBWZPQDWWYZCYTJCJXCKCWDKKZXSGKDZXWWYYJQYYTCYTDLLXWKCZKKLCCLZCQQDZLQLCSFQCHQHSFSMQZZLNBJJZBSJHTSZDYSJQJPDLZCDCWJKJZZLPYCGMZWDJJBSJQZSYZYHHXJPBJYDSSXDZNCGLQMBTSFSBPDZDLZNFGFJGFSMPXJQLMBLGQCYYXBQKDJJQYRFKZTJDHCZKLBSDZCFJTPLLJGXHYXZCSSZZXSTJYGKGCKGYOQXJPLZPBPGTGYJZGHZQZZLBJLSQFZGKQQJZGYCZBZQTLDXRJXBSXXPZXHYZYCLWDXJJHXMFDZPFZHQHQMQGKSLYHTYCGFRZGNQXCLPDLBZCSCZQLLJBLHBZCYPZZPPDYMZZSGYHCKCPZJGSLJLNSCDSLDLXBMSTLDDFJMKDJDHZLZXLSZQPQPGJLLYBDSZGQLBZLSLKYYHZTTNTJYQTZZPSZQZTLLJTYYLLQLLQYZQLBDZLSLYYZYMDFSZSNHLXZNCZQZPBWSKRFBSYZMTHBLGJPMCZZLSTLXSHTCSYZLZBLFEQHLXFLCJLYLJQCBZLZJHHSSTBRMHXZHJZCLXFNBGXGTQJCZTMSFZKJMSSNXLJKBHSJXNTNLZDNTLMSJXGZJYJCZXYJYJWRWWQNZTNFJSZPZSHZJFYRDJSFSZJZBJFZQZZHZLXFYSBZQLZSGYFTZDCSZXZJBQMSZKJRHYJZCKMJKHCHGTXKXQGLXPXFXTRTYLXJXHDTSJXHJZJXZWZLCQSBTXWXGXTXXHXFTSDKFJHZYJFJXRZSDLLLTQSQQZQWZXSYQTWGWBZCGZLLYZBCLMQQTZHZXZXLJFRMYZFLXYSQXXJKXRMQDZDMMYYBSQBHGZMWFWXGMXLZPYYTGZYCCDXYZXYWGSYJYZNBHPZJSQSYXSXRTFYZGRHZTXSZZTHCBFCLSYXZLZQMZLMPLMXZJXSFLBYZMYQHXJSXRXSQZZZSSLYFRCZJRCRXHHZXQYDYHXSJJHZCXZBTYNSYSXJBQLPXZQPYMLXZKYXLXCJLCYSXXZZLXDLLLJJYHZXGYJWKJRWYHCPSGNRZLFZWFZZNSXGXFLZSXZZZBFCSYJDBRJKRDHHGXJLJJTGXJXXSTJTJXLYXQFCSGSWMSBCTLQZZWLZZKXJMLTMJYHSDDBXGZHDLBMYJFRZFSGCLYJBPMLYSMSXLSZJQQHJZFXGFQFQBPXZGYYQXGZTCQWYLTLGWSGWHRLFSFGZJMGMGBGTJFSYZZGZYZAFLSSPMLPFLCWBJZCLJJMZLPJJLYMQDMYYYFBGYGYZMLYZDXQYXRQQQHSYYYQXYLJTYXFSFSLLGNQCYHYCWFHCCCFXPYLYPLLZYXXXXXKQHHXSHJZCFZSCZJXCPZWHHHHHAPYLQALPQAFYHXDYLUKMZQGGGDDESRNNZLTZGCHYPPYSQJJHCLLJTOLNJPZLJLHYMHEYDYDSQYCDDHGZUNDZCLZYZLLZNTNYZGSLHSLPJJBDGWXPCDUTJCKLKCLWKLLCASSTKZZDNQNTTLYYZSSYSSZZRYLJQKCQDHHCRXRZYDGRGCWCGZQFFFPPJFZYNAKRGYWYQPQXXFKJTSZZXSWZDDFBBXTBGTZKZNPZZPZXZPJSZBMQHKCYXYLDKLJNYPKYGHGDZJXXEAHPNZKZTZCMXCXMMJXNKSZQNMNLWBWWXJKYHCPSTMCSQTZJYXTPCTPDTNNPGLLLZSJLSPBLPLQHDTNJNLYYRSZFFJFQWDPHZDWMRZCCLODAXNSSNYZRESTYJWJYJDBCFXNMWTTBYLWSTSZGYBLJPXGLBOCLHPCBJLTMXZLJYLZXCLTPNCLCKXTPZJSWCYXSFYSZDKNTLBYJCYJLLSTGQCBXRYZXBXKLYLHZLQZLNZCXWJZLJZJNCJHXMNZZGJZZXTZJXYCYYCXXJYYXJJXSSSJSTSSTTPPGQTCSXWZDCSYFPTFBFHFBBLZJCLZZDBXGCXLQPXKFZFLSYLTUWBMQJHSZBMDDBCYSCCLDXYCDDQLYJJWMQLLCSGLJJSYFPYYCCYLTJANTJJPWYCMMGQYYSXDXQMZHSZXPFTWWZQSWQRFKJLZJQQYFBRXJHHFWJJZYQAZMYFRHCYYBYQWLPEXCCZSTYRLTTDMQLYKMBBGMYYJPRKZNPBSXYXBHYZDJDNGHPMFSGMWFZMFQMMBCMZZCJJLCNUXYQLMLRYGQZCYXZLWJGCJCGGMCJNFYZZJHYCPRRCMTZQZXHFQGTJXCCJEAQCRJYHPLQLSZDJRBCQHQDYRHYLYXJSYMHZYDWLDFRYHBPYDTSSCNWBXGLPZMLZZTQSSCPJMXXYCSJYTYCGHYCJWYRXXLFEMWJNMKLLSWTXHYYYNCMMCWJDQDJZGLLJWJRKHPZGGFLCCSCZMCBLTBHBQJXQDSPDJZZGKGLFQYWBZYZJLTSTDHQHCTCBCHFLQMPWDSHYYTQWCNZZJTLBYMBPDYYYXSQKXWYYFLXXNCWCXYPMAELYKKJMZZZBRXYYQJFLJPFHHHYTZZXSGQQMHSPGDZQWBWPJHZJDYSCQWZKTXXSQLZYYMYSDZGRXCKKUJLWPYSYSCSYZLRMLQSYLJXBCXTLWDQZPCYCYKPPPNSXFYZJJRCEMHSZMSXLXGLRWGCSTLRSXBZGBZGZTCPLUJLSLYLYMTXMTZPALZXPXJTJWTCYYZLBLXBZLQMYLXPGHDSLSSDMXMBDZZSXWHAMLCZCPJMCNHJYSNSYGCHSKQMZZQDLLKABLWJXSFMOCDXJRRLYQZKJMYBYQLYHETFJZFRFKSRYXFJTWDSXXSYSQJYSLYXWJHSNLXYYXHBHAWHHJZXWMYLJCSSLKYDZTXBZSYFDXGXZJKHSXXYBSSXDPYNZWRPTQZCZENYGCXQFJYKJBZMLJCMQQXUOXSLYXXLYLLJDZBTYMHPFSTTQQWLHOKYBLZZALZXQLHZWRRQHLSTMYPYXJJXMQSJFNBXYXYJXXYQYLTHYLQYFMLKLJTMLLHSZWKZHLJMLHLJKLJSTLQXYLMBHHLNLZXQJHXCFXXLHYHJJGBYZZKBXSCQDJQDSUJZYYHZHHMGSXCSYMXFEBCQWWRBPYYJQTYZCYQYQQZYHMWFFHGZFRJFCDPXNTQYZPDYKHJLFRZXPPXZDBBGZQSTLGDGYLCQMLCHHMFYWLZYXKJLYPQHSYWMQQGQZMLZJNSQXJQSYJYCBEHSXFSZPXZWFLLBCYYJDYTDTHWZSFJMQQYJLMQXXLLDTTKHHYBFPWTYYSQQWNQWLGWDEBZWCMYGCULKJXTMXMYJSXHYBRWFYMWFRXYQMXYSZTZZTFYKMLDHQDXWYYNLCRYJBLPSXCXYWLSPRRJWXHQYPHTYDNXHHMMYWYTZCSQMTSSCCDALWZTCPQPYJLLQZYJSWXMZZMMYLMXCLMXCZMXMZSQTZPPQQBLPGXQZHFLJJHYTJSRXWZXSCCDLXTYJDCQJXSLQYCLZXLZZXMXQRJMHRHZJBHMFLJLMLCLQNLDXZLLLPYPSYJYSXCQQDCMQJZZXHNPNXZMEKMXHYKYQLXSXTXJYYHWDCWDZHQYYBGYBCYSCFGPSJNZDYZZJZXRZRQJJYMCANYRJTLDPPYZBSTJKXXZYPFDWFGZZRPYMTNGXZQBYXNBUFNQKRJQZMJEGRZGYCLKXZDSKKNSXKCLJSPJYYZLQQJYBZSSQLLLKJXTBKTYLCCDDBLSPPFYLGYDTZJYQGGKQTTFZXBDKTYYHYBBFYTYYBCLPDYTGDHRYRNJSPTCSNYJQHKLLLZSLYDXXWBCJQSPXBPJZJCJDZFFXXBRMLAZHCSNDLBJDSZBLPRZTSWSBXBCLLXXLZDJZSJPYLYXXYFTFFFBHJJXGBYXJPMMMPSSJZJMTLYZJXSWXTYLEDQPJMYGQZJGDJLQJWJQLLSJGJGYGMSCLJJXDTYGJQJQJCJZCJGDZZSXQGSJGGCXHQXSNQLZZBXHSGZXCXYLJXYXYYDFQQJHJFXDHCTXJYRXYSQTJXYEFYYSSYYJXNCYZXFXMSYSZXYYSCHSHXZZZGZZZGFJDLTYLNPZGYJYZYYQZPBXQBDZTZCZYXXYHHSQXSHDHGQHJHGYWSZTMZMLHYXGEBTYLZKQWYTJZRCLEKYSTDBCYKQQSAYXCJXWWGSBHJYZYDHCSJKQCXSWXFLTYNYZPZCCZJQTZWJQDZZZQZLJJXLSBHPYXXPSXSHHEZTXFPTLQYZZXHYTXNCFZYYHXGNXMYWXTZSJPTHHGYMXMXQZXTSBCZYJYXXTYYZYPCQLMMSZMJZZLLZXGXZAAJZYXJMZXWDXZSXZDZXLEYJJZQBHZWZZZQTZPSXZTDSXJJJZNYAZPHXYYSRNQDTHZHYYKYJHDZXZLSWCLYBZYECWCYCRYLCXNHZYDZYDYJDFRJJHTRSQTXYXJRJHOJYNXELXSFSFJZGHPZSXZSZDZCQZBYYKLSGSJHCZSHDGQGXYZGXCHXZJWYQWGYHKSSEQZZNDZFKWYSSTCLZSTSYMCDHJXXYWEYXCZAYDMPXMDSXYBSQMJMZJMTZQLPJYQZCGQHXJHHLXXHLHDLDJQCLDWBSXFZZYYSCHTYTYYBHECXHYKGJPXHHYZJFXHWHBDZFYZBCAPNPGNYDMSXHMMMMAMYNBYJTMPXYYMCTHJBZYFCGTYHWPHFTWZZEZSBZEGPFMTSKFTYCMHFLLHGPZJXZJGZJYXZSBBQSCZZLZCCSTPGXMJSFTCCZJZDJXCYBZLFCJSYZFGSZLYBCWZZBYZDZYPSWYJZXZBDSYUXLZZBZFYGCZXBZHZFTPBGZGEJBSTGKDMFHYZZJHZLLZZGJQZLSFDJSSCBZGPDLFZFZSZYZYZSYGCXSNXXCHCZXTZZLJFZGQSQYXZJQDCCZTQCDXZJYQJQCHXZTDLGSCXZSYQJQTZWLQDQZTQCHQQJZYEZZZPBWKDJFCJPZTYPQYQTTYNLMBDKTJZPQZQZZFPZSBNJLGYJDXJDZZKZGQKXDLPZJTCJDQBXDJQJSTCKNXBXZMSLYJCQMTJQWWCJQNJNLLLHJCWQTBZQYDZCZPZZDZYDDCYZZZCCJTTJFZDPRRTZTJDCQTQZDTJNPLZBCLLCTZSXKJZQZPZLBZRBTJDCXFCZDBCCJJLTQQPLDCGZDBBZJCQDCJWYNLLZYZCCDWLLXWZLXRXNTQQCZXKQLSGDFQTDDGLRLAJJTKUYMKQLLTZYTDYYCZGJWYXDXFRSKSTQTENQMRKQZHHQKDLDAZFKYPBGGPZREBZZYKZZSPEGJXGYKQZZZSLYSYYYZWFQZYLZZLZHWCHKYPQGNPGBLPLRRJYXCCSYYHSFZFYBZYYTGZXYLXCZWXXZJZBLFFLGSKHYJZEYJHLPLLLLCZGXDRZELRHGKLZZYHZLYQSZZJZQLJZFLNBHGWLCZCFJYSPYXZLZLXGCCPZBLLCYBBBBUBBCBPCRNNZCZYRBFSRLDCGQYYQXYGMQZWTZYTYJXYFWTEHZZJYWLCCNTZYJJZDEDPZDZTSYQJHDYMBJNYJZLXTSSTPHNDJXXBYXQTZQDDTJTDYYTGWSCSZQFLSHLGLBCZPHDLYZJYCKWTYTYLBNYTSDSYCCTYSZYYEBHEXHQDTWNYGYCLXTSZYSTQMYGZAZCCSZZDSLZCLZRQXYYELJSBYMXSXZTEMBBLLYYLLYTDQYSHYMRQWKFKBFXNXSBYCHXBWJYHTQBPBSBWDZYLKGZSKYHXQZJXHXJXGNLJKZLYYCDXLFYFGHLJGJYBXQLYBXQPQGZTZPLNCYPXDJYQYDYMRBESJYYHKXXSTMXRCZZYWXYQYBMCLLYZHQYZWQXDBXBZWZMSLPDMYSKFMZKLZCYQYCZLQXFZZYDQZPZYGYJYZMZXDZFYFYTTQTZHGSPCZMLCCYTZXJCYTJMKSLPZHYSNZLLYTPZCTZZCKTXDHXXTQCYFKSMQCCYYAZHTJPCYLZLYJBJXTPNYLJYYNRXSYLMMNXJSMYBCSYSYLZYLXJJQYLDZLPQBFZZBLFNDXQKCZFYWHGQMRDSXYCYTXNQQJZYYPFZXDYZFPRXEJDGYQBXRCNFYYQPGHYJDYZXGRHTKYLNWDZNTSMPKLBTHBPYSZBZTJZSZZJTYYXZPHSSZZBZCZPTQFZMYFLYPYBBJQXZMXXDJMTSYSKKBJZXHJCKLPSMKYJZCXTMLJYXRZZQSLXXQPYZXMKYXXXJCLJPRMYYGADYSKQLSNDHYZKQXZYZTCGHZTLMLWZYBWSYCTBHJHJFCWZTXWYTKZLXQSHLYJZJXTMPLPYCGLTBZZTLZJCYJGDTCLKLPLLQPJMZPAPXYZLKKTKDZCZZBNZDYDYQZJYJGMCTXLTGXSZLMLHBGLKFWNWZHDXUHLFMKYSLGXDTWWFRJEJZTZHYDXYKSHWFZCQSHKTMQQHTZHYMJDJSKHXZJZBZZXYMPAGQMSTPXLSKLZYNWRTSQLSZBPSPSGZWYHTLKSSSWHZZLYYTNXJGMJSZSUFWNLSOZTXGXLSAMMLBWLDSZYLAKQCQCTMYCFJBSLXCLZZCLXXKSBZQCLHJPSQPLSXXCKSLNHPSFQQYTXYJZLQLDXZQJZDYYDJNZPTUZDSKJFSLJHYLZSQZLBTXYDGTQFDBYAZXDZHZJNHHQBYKNXJJQCZMLLJZKSPLDYCLBBLXKLELXJLBQYCXJXGCNLCQPLZLZYJTZLJGYZDZPLTQCSXFDMNYCXGBTJDCZNBGBQYQJWGKFHTNPYQZQGBKPBBYZMTJDYTBLSQMPSXTBNPDXKLEMYYCJYNZCTLDYKZZXDDXHQSHDGMZSJYCCTAYRZLPYLTLKXSLZCGGEXCLFXLKJRTLQJAQZNCMBYDKKCXGLCZJZXJHPTDJJMZQYKQSECQZDSHHADMLZFMMZBGNTJNNLGBYJBRBTMLBYJDZXLCJLPLDLPCQDHLXZLYCBLCXZZJADJLNZMMSSSMYBHBSQKBHRSXXJMXSDZNZPXLGBRHWGGFCXGMSKLLTSJYYCQLTSKYWYYHYWXBXQYWPYWYKQLSQPTNTKHQCWDQKTWPXXHCPTHTWUMSSYHBWCRWXHJMKMZNGWTMLKFGHKJYLSYYCXWHYECLQHKQHTTQKHFZLDXQWYZYYDESBPKYRZPJFYYZJCEQDZZDLATZBBFJLLCXDLMJSSXEGYGSJQXCWBXSSZPDYZCXDNYXPPZYDLYJCZPLTXLSXYZYRXCYYYDYLWWNZSAHJSYQYHGYWWAXTJZDAXYSRLTDPSSYYFNEJDXYZHLXLLLZQZSJNYQYQQXYJGHZGZCYJCHZLYCDSHWSHJZYJXCLLNXZJJYYXNFXMWFPYLCYLLABWDDHWDXJMCXZTZPMLQZHSFHZYNZTLLDYWLSLXHYMMYLMBWWKYXYADTXYLLDJPYBPWUXJMWMLLSAFDLLYFLBHHHBQQLTZJCQJLDJTFFKMMMBYTHYGDCQRDDWRQJXNBYSNWZDBYYTBJHPYBYTTJXAAHGQDQTMYSTQXKBTZPKJLZRBEQQSSMJJBDJOTGTBXPGBKTLHQXJJJCTHXQDWJLWRFWQGWSHCKRYSWGFTGYGBXSDWDWRFHWYTJJXXXJYZYSLPYYYPAYXHYDQKXSHXYXGSKQHYWFDDDPPLCJLQQEEWXKSYYKDYPLTJTHKJLTCYYHHJTTPLTZZCDLTHQKZXQYSTEEYWYYZYXXYYSTTJKLLPZMCYHQGXYHSRMBXPLLNQYDQHXSXXWGDQBSHYLLPJJJTHYJKYPPTHYYKTYEZYENMDSHLCRPQFDGFXZPSFTLJXXJBSWYYSKSFLXLPPLBBBLBSFXFYZBSJSSYLPBBFFFFSSCJDSTZSXZRYYSYFFSYZYZBJTBCTSBSDHRTJJBYTCXYJEYLXCBNEBJDSYXYKGSJZBXBYTFZWGENYHHTHZHHXFWGCSTBGXKLSXYWMTMBYXJSTZSCDYQRCYTWXZFHMYMCXLZNSDJTTTXRYCFYJSBSDYERXJLJXBBDEYNJGHXGCKGSCYMBLXJMSZNSKGXFBNBPTHFJAAFXYXFPXMYPQDTZCXZZPXRSYWZDLYBBKTYQPQJPZYPZJZNJPZJLZZFYSBTTSLMPTZRTDXQSJEHBZYLZDHLJSQMLHTXTJECXSLZZSPKTLZKQQYFSYGYWPCPQFHQHYTQXZKRSGTTSQCZLPTXCDYYZXSQZSLXLZMYCPCQBZYXHBSXLZDLTCDXTYLZJYYZPZYZLTXJSJXHLPMYTXCQRBLZSSFJZZTNJYTXMYJHLHPPLCYXQJQQKZZSCPZKSWALQSBLCCZJSXGWWWYGYKTJBBZTDKHXHKGTGPBKQYSLPXPJCKBMLLXDZSTBKLGGQKQLSBKKTFXRMDKBFTPZFRTBBRFERQGXYJPZSSTLBZTPSZQZSJDHLJQLZBPMSMMSXLQQNHKNBLRDDNXXDHDDJCYYGYLXGZLXSYGMQQGKHBPMXYXLYTQWLWGCPBMQXCYZYDRJBHTDJYHQSHTMJSBYPLWHLZFFNYPMHXXHPLTBQPFBJWQDBYGPNZTPFZJGSDDTQSHZEAWZZYLLTYYBWJKXXGHLFKXDJTMSZSQYNZGGSWQSPHTLSSKMCLZXYSZQZXNCJDQGZDLFNYKLJCJLLZLMZZNHYDSSHTHZZLZZBBHQZWWYCRZHLYQQJBEYFXXXWHSRXWQHWPSLMSSKZTTYGYQQWRSLALHMJTQJSMXQBJJZJXZYZKXBYQXBJXSHZTSFJLXMXZXFGHKZSZGGYLCLSARJYHSLLLMZXELGLXYDJYTLFBHBPNLYZFBBHPTGJKWETZHKJJXZXXGLLJLSTGSHJJYQLQZFKCGNNDJSSZFDBCTWWSEQFHQJBSAQTGYPQLBXBMMYWXGSLZHGLZGQYFLZBYFZJFRYSFMBYZHQGFWZSYFYJJPHZBYYZFFWODGRLMFTWLBZGYCQXCDJYGZYYYYTYTYDWEGAZYHXJLZYYHLRMGRXXZCLHNELJJTJTPWJYBJJBXJJTJTEEKHWSLJPLPSFYZPQQBDLQJJTYYQLYZKDKSQJYYQZLDQTGJQYZJSUCMRYQTHTEJMFCTYHYPKMHYZWJDQFHYYXWSHCTXRLJHQXHCCYYYJLTKTTYTMXGTCJTZAYYOCZLYLBSZYWJYTSJYHBYSHFJLYGJXXTMZYYLTXXYPZLXYJZYZYYPNHMYMDYYLBLHLSYYQQLLNJJYMSOYQBZGDLYXYLCQYXTSZEGXHZGLHWBLJHEYXTWQMAKBPQCGYSHHEGQCMWYYWLJYJHYYZLLJJYLHZYHMGSLJLJXCJJYCLYCJPCPZJZJMMYLCQLNQLJQJSXYJMLSZLJQLYCMMHCFMMFPQQMFYLQMCFFQMMMMHMZNFHHJGTTHHKHSLNCHHYQDXTMMQDCYZYXYQMYQYLTDCYYYZAZZCYMZYDLZFFFMMYCQZWZZMABTBYZTDMNZZGGDFTYPCGQYTTSSFFWFDTZQSSYSTWXJHXYTSXXYLBYQHWWKXHZXWZNNZZJZJJQJCCCHYYXBZXZCYZTLLCQXYNJYCYYCYNZZQYYYEWYCZDCJYCCHYJLBTZYYCQWMPWPYMLGKDLDLGKQQBGYCHJXY";
			// 此处收录了375个多音字,数据来自于
			var oMultiDiff = {
			};
			
			var uni = ch.charCodeAt(0);
			// 如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数
			if (uni > 40869 || uni < 19968)
				return ch; // dealWithOthers(ch);
				// 检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母
			return (oMultiDiff[uni] ? oMultiDiff[uni] : (strChineseFirstPY
					.charAt(uni - 19968)));
		}
		function mkRslt(arr) {
			var arrRslt = [""];
			for (var i = 0, len = arr.length; i < len; i++) {
				var str = arr[i];
				var strlen = str.length;
				if (strlen == 1) {
					for (var k = 0; k < arrRslt.length; k++) {
						arrRslt[k] += str;
					}
				} else {
					var tmpArr = arrRslt.slice(0);
					arrRslt = [];
					for (k = 0; k < strlen; k++) {
						// 复制一个相同的arrRslt
						var tmp = tmpArr.slice(0);
						// 把当前字符str[k]添加到每个元素末尾
						for (var j = 0; j < tmp.length; j++) {
							tmp[j] += str.charAt(k);
						}
						// 把复制并修改后的数组连接到arrRslt上
						arrRslt = arrRslt.concat(tmp);
					}
				}
			}
			return arrRslt;
		}
	}
	/**
	 * source 有三种来源：cookie，remote，array。
	 * data:
	 * source:
	 * @param {} jqueryObj
	 * @param {} json4Options
	 */
	
	$.autoCompleteInit = function(jqueryObj,json4Options){
		 var options = null ;
		 if( json4Options.source == 'array' ){
		 	  json4Options.source = json4Options.data,
		 	  options = json4Options ;
		  }else if( json4Options.source == 'remote' ){
		  	options = {
			 	minLength:json4Options.minLength,
			 	source:function(req, resp){
			 				 var service_param = {};
						    
							 service_param = $.extend({}, json4Options.params);
							 service_param.CommandName = json4Options.CommandName;
			 				 if(json4Options.variableName){
						  	 	 service_param[json4Options.variableName] = req.term;
						  	 }else{
						  	 	service_param["message"] = req.term;
						  	 }
						  	 
						  	 var url = json4Options.url||(window.dataServiceUrl||"~/dataservice");
						  	 service_param['format'] = 'false' ;
						  	 $.dataservice(json4Options.CommandName,service_param,function(response){//json
			                    	resp($.map(response, function(item) {
			                    		var text = item.TEXT||item.text ;
			                    		var value = item.VALUE||item.value||item.ID||item.id ;
										return {
											id: value,
											label: text,
											value: text
										}
									}));
			                    } ,{url:url}  ) ;
			           }
			 } ;
		  	options = $.extend({},json4Options,options) ;
		 }else{
		 	 options = {
			 	  minLength : json4Options.minLength,
			 	  source : json4Options.source||'cookie'
			  } ;
			  options = $.extend({},json4Options,options) ;
		 }
		 jqueryObj.autocomplete(options);
	};
	
	$.fn.autoComplete = function(json_obj){
		var oautoCompleteWidget = new autoCompleteWidget();
		oautoCompleteWidget.init($(this),json_obj);
		return oautoCompleteWidget;
	};
	
	autoCompleteWidget = function(){
		this.$ = null;
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			if(json_obj != undefined){
				$.autoCompleteInit(jquery_obj,json_obj);
			}
		};
	};
	
	$.fn.comboBox = function(json_obj){
		var ocomboBoxWidget = new comboBoxWidget();
		ocomboBoxWidget.init($(this),json_obj);
		return ocomboBoxWidget;
	};
	
	comboBoxWidget = function(){
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			if(json_obj != undefined){
				 this.$.combobox(json_obj);
			}
		};
		
		this.getValue = function(){
			return this.$.combobox('getValue');
		};
		
		this.enable = function(){
			return this.$.combobox('enable');
		};
		
		this.disable = function(){
			return this.$.combobox('disable');
		};
		
		this.setValue = function(g){
			return this.$.combobox('setValue',g);
		};
		
		this.reload = function(o){
			return this.$.combobox('reload',o);
		};
	};
	
	$.uiwidget.register("autocomplete",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this).autoComplete(jsonOptions) ;
		});
	}) ;
	
	$.uiwidget.register("combobox",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this).comboBox(jsonOptions) ;
		});
	}) ;

}(jQuery));
