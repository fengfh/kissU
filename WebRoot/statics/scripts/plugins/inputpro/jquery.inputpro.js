
/**
 *  加强文本框控件
 *  lixh@bingosoft.net
 */
(function($){

	jQuery.extend(jQuery.fn, {
		bingo_inputImg: function(o) {
			if( typeof o == 'string' ){
				switch(o){
					case 'disable':
					 	disable(this) ;
					 	return ;
					case 'enable':
						enable(this) ;
						return ;
					case 'show':
						show(this) ;
						return ;
					case 'hide':
						hide(this) ;
						return ;
					default:
					  alert(o+"功能目前不支持") ;
					  return ;
				}
				return ;
			}
			
			defaultOptions = {
				type:'class',
				src:'icon-search',
				event:{
				}
			}
			
			var options = o ;//$.extend(defaultOptions,o) ;
			
			jQuery(this).each( function() {
				var input = jQuery(this);
				input.addClass('inputpro-img-input') ;
				var width = input.width();
				if(width<90)width = 90; 
				var height = input.outerHeight(true) ;
				
				var count = 0 ;
				$(options).each( function(){
					var _o = this ;
					//build pro img
					count++ ;
					var html = buildHtml(_o,count) ;
					var eventObj = null ;
					
					/*<span class="inputpro-img input-append">
						<input class="include-span input-span-uneditable"  style="width: 184px; ">
						<span class="add-on btn button-reset">
							<i class="ui-icon ui-icon-triangle-1-s icon-chevron-down"></i>
						</span>
					</span>*/
					
					if( input.parent('.inputpro-img').get(0) ){
						eventObj = input.parent('.inputpro-img').addClass("ui-widget").append(html).find('.iis-'+count) ;
					}else{
						eventObj = input.wrap("<span class='inputpro-img input-append ui-widget'></span>")
					     .addClass('include-span input-span-uneditable')
					     .width(width - 26)
					     .parent('.inputpro-img')
					     .addClass("input-append")
					     .append(html)
					     .find('.iis-'+count) ;

					   input.width(width - eventObj.parent('.inputpro-img').find(".add-on").outerWidth(true) ) ;
					}
					
					if( document.compatMode == "BackCompat" ){
						if($.browser.msie){
							input.parent().find(".btn").css("margin-bottom","0px") ;
							input.css("padding","0px 4px") ;
							input.height( input.parent().find(".btn").outerHeight()  ) ;
						}else{
							input.height( input.parent().find(".btn").outerHeight()  ) ;
						}
					}
					
					if(_o.url && $.open ){
						_o.event = _o.event||{} ;
						_o.event["click"] = function(val,input){
							var params = $.extend({},_o) ;
							params.callback = null ;
							params.value = val ;
							params.target = input ;
							var callback = function(){
								var _callback = _o.callback||function(){} ;
								_callback.call(this,val,input) ;
							}
							$.open( _o.url , _o.width,_o.height,params,callback) ;
						}
					}
					
					if(_o.event){
						for(var o in _o.event){
							eventObj.unbind(o).bind(o, function(){
								if(input.attr('disabled')) return ;//firefox chrome cannot disable span
								_o.event[o](input.val(),input) ;
								return false;
							} ) ;
						}
					}
					
					if(_o.css){
						eventObj.css( _o.css ) ;
					}
				} ) ;
				
				if( input.attr('disabled') ) {
					disable(input) ;
				}
			});
			
			function buildHtml(options,count){
				//build pro img
				var html = '' ;
				var type = options.type ;
				var title= ' title="'+(options.title||'')+'"' ;
				if(type == 'class'){
					html = '<i class=" '+options.src+'"></i>' ;
				}else if(type == 'img'){
					html = '<span '+title+' class="iis-'+count+' inputpro-img-span inputpro-img-span-img"><span><img align="absmiddle" src="'+options.src+'"/></span></span>' ;
				}else if(type == 'text'){
					html = '<i class=""> '+options.src+'</i>' ;
				}
				
				return '<span class="iis-'+count+' add-on btn button-reset">'+html+'</span>' ;
			}
			
			
			function enable(tgt){
				$(tgt).parent()
					.removeClass('ui-state-disabled')
					.find("input,span,img")
					.attr('disabled',false)
					.removeClass('inputpro-img-disabled') ;
			}
			
			function disable(tgt){
				$(tgt).parent()
					.addClass('ui-state-disabled')
					.find("input,span,img")
					.attr('disabled',true)
					.addClass('inputpro-img-disabled') ;
			}
			
			function show(tgt){
				$(tgt).parent().show() ;
			}
			
			function hide(tgt){
				$(tgt).parent().hide() ;
			}
		},
		
		/**
		 * 只能输入数字
		 */
		numberbox:function(options){
			var defaults = {
				min: null,
				max: null,
				precision: 0
			};
			
			options = options || {};
			return this.each(function(){
				var state = $.data(this, 'numberbox');
				if (state){
					$.extend(state.options, options);
				} else {
					$.data(this, 'numberbox', {
						options: $.extend({}, defaults, {
							min: (parseFloat($(this).attr('min')) || undefined),
							max: (parseFloat($(this).attr('max')) || undefined),
							precision: (parseInt($(this).attr('precision')) || undefined)
						}, options)
					});
					
					$(this).css({imeMode:"disabled"});//only ie firefox
				}
				
				bindEvents(this);
			});
			
			function fixValue(target){
				var opts = $.data(target, 'numberbox').options;
				var val = parseFloat($(target).val()).toFixed(opts.precision);
				if (isNaN(val)){
					$(target).val('');
					return;
				}
				
				if (opts.min && val < opts.min){
					$(target).val(opts.min.toFixed(opts.precision));
				} else if (opts.max && val > opts.max){
					$(target).val(opts.max.toFixed(opts.precision));
				} else {
					$(target).val(val);
				}
			}
			
			function bindEvents(target){
				$(target).unbind('.numberbox');
				$(target).bind('keypress.numberbox', function(e){
					if (e.which == 45){	//-
						return true;
					} if (e.which == 46) {	//.
						return true;
					}
					else if ((e.which >= 48 && e.which <= 57 && e.ctrlKey == false && e.shiftKey == false) || e.which == 0 || e.which == 8) {
						return true;
					} else if (e.ctrlKey == true && (e.which == 99 || e.which == 118)) {
						return true;
					} else {
						return false;
					}
				}).bind('paste.numberbox', function(){
					if (window.clipboardData) {
						var s = clipboardData.getData('text');
						if (! /\D/.test(s)) {
							return true;
						} else {
							return false;
						}
					} else {
						return false;
					}
				}).bind('dragenter.numberbox', function(){
					return false;
				}).bind('blur.numberbox', function(){
					fixValue(target);
				});
			}
		},excludeChar: function(options) {
			var defaults = {} ;
			options = $.extend(defaults,options) ;//exclude:''
			var exclude = options.exclude||'<>/' ;
			
			return $(this).each(function(){
				var state = $.data(this, 'inputformat');
				if (state){
					$.extend(state.options, options);
				} else {
					$.data(this, 'inputformat', {
						options: $.extend( {}, defaults, {}, options )
					});
				}
				var tgt = $(this) ;
				
				$(this).bind('keypress' , function(e){
					var realCode = String.fromCharCode( e.which ) ;
					if( exclude.indexOf(realCode)!=-1 )
						return false ;
					else
						return true ;
				} ).bind('paste',function(){
					var reg = new RegExp("[" + exclude + "]", "g");
					if(window.clipboardData){
						var oldVal = tgt.val() ;
						var tempValue = window.clipboardData.getData("Text");
						tgt.val( oldVal+ ( tempValue.replace(reg, "") ) ) ;
						return false ;
					}else{
						return true ;
					}
					
				}).bind('keyup',function(){
					var reg = new RegExp("[" + exclude + "]", "g");
					var tempValue = tgt.val() ;
					if (tempValue == tempValue.replace(reg, "")) {
						return false ;
					} else {
						tgt.val( tempValue.replace(reg, "") ) ;
					}
				})
			});
		}
	}); 
	
	$.inputInit = function(jqueryObj,json4Options){
		for(var i = 0;i < json4Options.length; i ++){
			if(json4Options[i].functionType == 'numberRange'){
				jqueryObj.numberbox(json4Options[i]);
			}
			else if(json4Options[i].functionType == 'excludeChar'){
					jqueryObj.excludeChar(json4Options[i]);
			}
			else{
				var _type = json4Options[i].imgSource;
				if(_type == undefined || _type == '' || _type == null){
					_type = 'class';
				}
				
				var _src = json4Options[i].src;
				if(_src == undefined || _src == '' || _src == null){
					_src = 'icon-search';
				}
				
				var _title = json4Options[i].title;
				if(_title == undefined || _title == '' || _title == null){
					_title = '请选择';
				}
				
				var json4Img = { 
					type:_type,
					src:_src,
					title:_title,
					event:{
						click:window[json4Options[i].click]
					}
				}
				
				jqueryObj.bingo_inputImg(json4Img);
			}
		}
	};
	
	$.fn.input = function(json_obj){
		var oinput = new inputWidget();
		oinput.init($(this),json_obj);
		return oinput;
	};
	
	inputWidget  = function(){
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			this.$.bingo_inputImg(json_obj);
		};
		
		this.enable = function(){
			this.$.bingo_inputImg("enable");
		};
		
		this.disable = function(){
			this.$.bingo_inputImg("disable");
		};
		
	    this.show = function(){
			this.$.bingo_inputImg('show');
		};
		
		this.hide = function(){
			this.$.bingo_inputImg('hide');
		};
		
		this.excludeChar = function(json){
			this.$.excludeChar(json);
		};
		
		this.numberBox = function(json){
			this.$.numberbox(json);
		};
	};
	
	$.uiwidget.register("inputimg",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||'{}' ;//target
			eval(" var jsonOptions = "+options) ;
			$(this).input(jsonOptions) ;
		});
	}) ;

	
	$.uiwidget.register("numberbox",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||'{}' ;//target
			eval(" var jsonOptions = "+options) ;
			$(this).numberbox(jsonOptions) ;
		});
	}) ;
	
	$.uiwidget.register("excludeChar",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||'{}' ;//target
			eval(" var jsonOptions = "+options) ;
			$(this).excludeChar(jsonOptions) ;
		});
	}) ;
})(jQuery);