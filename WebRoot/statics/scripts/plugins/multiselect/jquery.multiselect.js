/*
// jQuery multiSelect
//
// Version 1.0.2 beta
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 10 May 2009
//
// Visit http://abeautifulsite.net/notebook.php?article=62 for more information
//
// Usage: $('#control_id').multiSelect( options, callback )
//
// Options:  selectAll          - whether or not to display the Select All option; true/false, default = true
//           selectAllText      - text to display for selecting/unselecting all options simultaneously
//           noneSelected       - text to display when there are no selected items in the list
//           oneOrMoreSelected  - text to display when there are one or more selected items in the list
//                                (note: you can use % as a placeholder for the number of items selected).
//                                Use * to show a comma separated list of all selected; default = '% selected'
//
//	
*/
if(jQuery) (function($){
	
	var clazz = {
		hover:'multi-hover-flag',//ui-state-hover  multi-hover-flag
		labelHover:'ui-state-hover  multi-hover',
		active:'ui-state-hover',//
		focus:'ui-state-focus multi-focus',
		inputActive:'multi-input-active',
		inputFocus:'multi-input-focus',//input框的focus事件
		checked:'ui-state-active  multi-checked',
		selectAll:'selectAll'//'ui-state-default multi-selectall'
	}
	
	var isIE6 = function(){
		if (jQuery.browser.msie) {
		   return parseInt(jQuery.browser.version)<=6 ;
		}
		return false ;
	}
	var zIndex = 5 ;
	var isFirst = true ;

	jQuery.extend(jQuery.fn, {
		__multiSelect: function(o, callback) {
			if(o == undefined){return;}
			if(typeof o == 'string'){
				if(o == 'getValue'){
					return getValue.call(this) ;
				}else if(o == 'reload'){
					return reload.call(this) ;
				}
			}
		
			// Default options
			if( !o ) var o = {};
			if( o.selectAll == undefined ) o.selectAll = true;
			if( o.selectAllText == undefined ) o.selectAllText = "全 选";
			if( o.noneSelected == undefined ) o.noneSelected = '';
			
			if( o.oneOrMoreSelected == undefined ) o.oneOrMoreSelected ='*' ;// '% selected';
			
			// Initialize each multiSelect
			jQuery(this).each( function() {
				var select = jQuery(this);
				select.attr("multiple","multiple" );
				if( select.attr($.uiwidget.defaultValue) ){
					var values = select.attr($.uiwidget.defaultValue).split(',') ;
					$(values).each( function(){
						var _me = this ;
						try{ select.find("option[value="+_me+"]").attr("selected",true); }catch(e){}
					} ) ;
				}
				
				var width = 0 ;
				var height = 0 ;
				
				if(!width) width = select.width();
				height = Math.max(select.height(),o.height||220) ; 
				select.hide() ;
				
				//create proxy
				if( $(select)[0].className ){
					var prxoy = $("<input type='hidden' style='position:absolute;left:-200px;'>").insertAfter(select).addClass( $(select)[0].className ) ;
					width = Math.max( prxoy.width(), $(select).width() );
					prxoy.remove() ;
				}
				
				if( select.next().hasClass("multi-select")||select.next().hasClass("multiSelect-cont") ){
					select.next()
						.addClass("multiSelect-cont ui-widget")
						.find("input")
						.addClass("multiSelect").parent().find("i").addClass("multiSelect-span") ;
				}else{
					var html = '<span class="multiSelect-cont  input-append ui-widget"><input type="text" readonly="readonly" class="multiSelect include-span input-span-uneditable" value="" title="" style="width:' + (width-26) + 'px;" />';
					html+= '<span  class="add-on btn button-reset"><i class="icon-chevron-down  ui-icon ui-icon-triangle-1-s"></i></span>' ;
					html += '</span>';
					select.after(html);
				}
				
				if( document.compatMode == "BackCompat" ){
					var input = select.next().find('input.multiSelect') ;
					if($.browser.msie){
						select.next().find(".btn").css("margin-bottom","0px") ;
						input.css("padding","0px 4px") ;
						input.height( select.next().find(".btn").outerHeight()  ) ;
					}else{
						input.height( select.next().find(".btn").outerHeight()  ) ;
					}
				}
				
				//options
				var random = new Date().getTime() ;
				var html = '' ;//'<div class=" multiSelectOptions ui-helper-reset ui-widget-content ui-corner-all" style="height:'  + height + ';width:' + width + ';">';
				html += '<ul class="multiSelectOptions dropdown-menu ui-menu  ui-helper-reset ui-widget-content ui-corner-all"  style="height:'  + height + 'px;width:' + width + 'px;position:absolute;">' ;
				if( o.selectAll ) html += '<li class="ui-menu-item"><a href="#"><label class="checkbox  '+clazz.selectAll+'" for="'+random+'$$root'+'"><input type="checkbox" class="selectAll" id="'+random+'$$root'+'">' + o.selectAllText + '</label></a></li>';
				select.find('OPTION').each( function() {
					if( jQuery(this).val() != '' ) {
						var text = $.trim(jQuery(this).text()) ;
						html += '<li class="ui-menu-item"><a href="#"><label  title="'+text+'"  for="'+random+jQuery(this).val()+'" class="checkbox"><input type="checkbox" id="'+random+jQuery(this).val()+'"  value="' + jQuery(this).val() + '"';
						if( jQuery(this).attr('selected') ) html += ' checked="checked"';
						html += ' >' + text + '</label></a></li>';
					}
				});
				html += "</ul>" ;
				//html += '</div>';
				
				var _multiSelectOptions = $(html).appendTo(document.body).css({top:"0px",left:"0px"}).hide() ;
				var _multiSelect =  select.next('span').find('.multiSelect') ;
				
				var maxTop = _multiSelect.offset().top ;
				var maxBottom = $(window).height() -maxTop - _multiSelect.outerHeight() ;
				
				var trueHeight = Math.min( Math.max(maxTop,maxBottom) -2 ,height) ;
				_multiSelectOptions.height(trueHeight) ;

				select.data("validate_target",select.next(".multiSelect-cont")) ;
				_multiSelectOptions.width( _multiSelect.parent().width() - 2) ;
				//target
				if ($.fn.bgiframe) {
					_multiSelectOptions.bgiframe({width:_multiSelect.parent().width(),height: _multiSelectOptions.height() ,forceIframe:o.forceIframe });
				}
				
				var isOver = false ;
				$(document).click(function(e){
					if(!isOver && !clickBtn){
						optionsHide.call(_multiSelect);
					}
				}) ;
				
				_multiSelectOptions.mouseover(function(){
					isOver = true ;
				});
				
				_multiSelect.mouseover( function() {
					jQuery(this).addClass(clazz.hover) ;//('hover');
				}).mouseout( function() {
					jQuery(this).removeClass(clazz.hover);//('hover');
				}).click( function() {
					if( jQuery(this).hasClass(clazz.inputActive) ) {
						optionsHide.call(jQuery(this));
					} else {
						optionsShow.call(jQuery(this));
					}
					return false;
				}).focus( function() {
					jQuery(this).addClass(clazz.inputFocus);
				}).blur( function() {
					jQuery(this).removeClass(clazz.inputFocus);
				});
				
				if( o.selectAll ) {
					var sa = true;
					_multiSelectOptions.find('INPUT:checkbox').not('.selectAll').each( function() {
						if( !jQuery(this).attr('checked') ) sa = false;
					});
					if( sa ) _multiSelectOptions.find('INPUT.selectAll').attr('checked', true).parent().addClass(clazz.checked);
				}
				
				_multiSelectOptions.find('INPUT.selectAll').click( function() {
					if( jQuery(this).attr('checked') ){
						_multiSelectOptions.find('INPUT:checkbox').not('.selectAll').attr('checked', true).parent().addClass(clazz.checked); 
					}else{
						_multiSelectOptions.find('INPUT:checkbox').not('.selectAll').attr('checked', false).parent().removeClass(clazz.checked);
					}
				});
				
				_multiSelectOptions.find('INPUT:checkbox').click( function() {
					var _opts = jQuery(this).parent().parent() ;
					updateSelected.call(_multiSelectOptions,o);
					_opts.find('LABEL').removeClass(clazz.checked).find('INPUT:checked').parent().addClass(clazz.checked);
					_opts.prev('span').find('.multiSelect').focus();
					if( !jQuery(this).attr('checked') ) {
						_opts.find('INPUT:checkbox.selectAll').attr('checked', false).parent().removeClass(clazz.checked);
					}
					
					var _l = _multiSelectOptions.find('INPUT:checkbox').not('.selectAll').length ;
					var _c = _multiSelectOptions.find('INPUT:checkbox:checked').not('.selectAll').length ;
					_multiSelectOptions.find('INPUT.selectAll').attr('checked', _l == _c) ;
				
					if( callback ) callback(jQuery(this));
				});
				
				_multiSelectOptions.each( function() {
					updateSelected.call(_multiSelectOptions,o);
					jQuery(this).find('INPUT:checked').parent().addClass(clazz.checked);
				});
				
				_multiSelectOptions.find('LABEL').mouseover( function() {
					jQuery(this).parent().find('LABEL').removeClass(clazz.labelHover);
					jQuery(this).addClass(clazz.labelHover);
				}).mouseout( function() {
					jQuery(this).parent().find('LABEL').removeClass(clazz.labelHover);
				});
				
				var clickBtn = false ;
				_multiSelect.keydown( function(e) {
					var _mso = _multiSelectOptions ;
					if( _mso.is(':visible') ) {
						if( e.keyCode == 9 ) {// Tab
							jQuery(this).addClass(clazz.focus).trigger('click'); // esc, left, right - hide
							jQuery(this).focus().next(':input').focus();
							return true;
						}
						
						if( e.keyCode == 27 || e.keyCode == 37 || e.keyCode == 39 ) {// ESC, Left, Right
							jQuery(this).addClass(clazz.focus).trigger('click');
						}
						
						if( e.keyCode == 40 ) {// Down
							if( !_mso.find('LABEL').hasClass(clazz.labelHover) ) {
								_mso.find('LABEL:first').addClass(clazz.labelHover);
							} else {
								_mso.find('LABEL.'+clazz.labelHover).removeClass(clazz.labelHover).next('LABEL').addClass(clazz.labelHover);
								if( !_mso.find('LABEL').hasClass(clazz.labelHover) ) {
									_mso.find('LABEL:first').addClass(clazz.labelHover);
								}
							}
							
							adjustViewport(jQuery(this) );
							
							return false;
						}
						// Up
						if( e.keyCode == 38 ) {
							if( !_mso.find('LABEL').hasClass(clazz.labelHover) ) {
								_mso.find('LABEL:first').addClass(clazz.labelHover);
							} else {
								_mso.find('LABEL.'+clazz.labelHover).removeClass(clazz.labelHover).prev('LABEL').addClass(clazz.labelHover);
								if( !_mso.find('LABEL').hasClass(clazz.labelHover) ) {
									_mso.find('LABEL:last').addClass(clazz.labelHover);
								}
							}
							
							adjustViewport(jQuery(this) );
							
							return false;
						}
						// Enter, Space
						if( e.keyCode == 13 || e.keyCode == 32 ) {
							// Select All
							if( _mso.find('LABEL.'+clazz.labelHover+' INPUT:checkbox').hasClass('selectAll') ) {
								if(_mso.find('LABEL.'+clazz.labelHover+' INPUT:checkbox').attr('checked') ) {
									// Uncheck all
									_mso.find('INPUT:checkbox').attr('checked', false).parent().removeClass(clazz.checked);
								} else {
									// Check all
									_mso.find('INPUT:checkbox').attr('checked', true).parent().addClass(clazz.checked);
								}
								updateSelected.call(_mso,o);
								if( callback ) callback(jQuery(this));
								return false;
							}
							// Other checkboxes
							if( _mso.find('LABEL.'+clazz.labelHover+' INPUT:checkbox').attr('checked') ) {
								// Uncheck
								_mso.find('LABEL.'+clazz.labelHover+' INPUT:checkbox').attr('checked', false);
								updateSelected.call(_mso,o);
								_mso.find('LABEL').removeClass(clazz.checked).find('INPUT:checked').parent().addClass(clazz.checked);
								// Select all status can't be checked at this point
								_mso.find('INPUT:checkbox.selectAll').attr('checked', false).parent().removeClass(clazz.checkeds);
								if( callback ) callback(jQuery(this));
							} else {
								// Check
								_mso.find('LABEL.'+clazz.labelHover+' INPUT:checkbox').attr('checked', true);
								updateSelected.call(_mso,o);
								_mso.find('LABEL').removeClass(clazz.checked).find('INPUT:checked').parent().addClass(clazz.checked);
								if( callback ) callback(jQuery(this));
							}
						}
						return false;
					} else {
						// Dropdown is not visible
						if( e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13 || e.keyCode == 32 ) { // down, enter, space - show
							// Show dropdown
							jQuery(this).removeClass(clazz.focus).trigger('click');
							_mso.find('LABEL:first').addClass(clazz.labelHover);
							return false;
						}
						//  Tab key
						if( e.keyCode == 9 ) {
							// Shift focus to next INPUT element on page
							jQuery(this).focus().next(':input').focus();
							return true;
						}
					}
					// Prevent enter key from submitting form
					if( e.keyCode == 13 ) return false;
				});
				
				var offset = _multiSelect.position();
				_multiSelect.parent().find(".add-on")
					.click( function(){
						if( _multiSelectOptions.is(':visible') ){
							optionsHide() ;
						}else{
							_multiSelect.click();
							clickBtn = true ;
						}
						return false ;
					} ) ;
	
					function updateSelected(o) {
						var i = 0, s = '';
						_multiSelectOptions.find('INPUT:checkbox:checked').not('.selectAll').each( function() {
							i++;
						})
						
						if( i == 0 ) {
							select.find("option").attr("selected",false); 
							_multiSelect.val( o.noneSelected );
						} else {
							if( o.oneOrMoreSelected == '*' ) {
								var display = [];
								
								select.find("option").attr("selected",false);
								
								_multiSelectOptions.find('INPUT:checkbox:checked').each( function() {
									if( $(this).parent().text() != o.selectAllText ) 
										display.push(jQuery.trim( $(this).parent().text() )) ;
									select.find("option[value="+this.value+"]").attr("selected","selected");  
								});
								_multiSelect.val( display.join(",") );
								
							} else {
								_multiSelect.val( o.oneOrMoreSelected.replace('%', i) );
							}
						}
						_multiSelect.attr("title",_multiSelect.val());
						if(!isFirst && $.validation){
							$.validation.loadValidation(select);
						}
						if(!isFirst && select.change)select.change();
						isFirst = false ;
					}
					
					function optionsHide() {
						isOver = false ;
						clickBtn = false ;
						_multiSelectOptions.hide().css({top:"0px",left:"0px"}) ;
					} ;
					
					$(document.body).click(function(e){
						var os = _multiSelectOptions.offset() ;
						var w  = _multiSelectOptions.width() ;
						var h  = _multiSelectOptions.height() ;
						if( e.pageX < os.left || e.pageX > os.left+w || e.pageY < os.top - 50 || e.pageY > os.top + h +50  ){
							optionsHide() ;
						}
					}) ;
					
					var scrollElement = o.scrollElement ;
					$(scrollElement).length && $(scrollElement).scroll(function(){
						_multiSelectOptions.css({ top : 0, left : 0 }).hide();
					})
					
					function optionsShow() {
						_multiSelectOptions.css({ top : 0, left : 0 }).hide()
						var me = jQuery(this) ;
						var pos = {
							my : "left top",
							at : "left bottom",
							of : me ,
							collision : "flip",
							offset:"0 0"
						};
						
						var fixWidth = document.compatMode == "BackCompat" && $.browser.msie ?0:2 ;
			
						_multiSelectOptions.width(me.parent().width()-fixWidth).show().position(pos);
						
						var timer = '';
						_multiSelectOptions.hover( function() {
							timer&&clearTimeout(timer);
						}, function() {
							timer = setTimeout(function(){
								optionsHide.call(jQuery(me)); 
								jQuery(me).unbind("hover");
							}, 250);
						});
						return false;
					};
					
					function adjustViewport(el) {

						var i = 0;
						var selectionTop = 0, selectionHeight = 0;
						_multiSelectOptions.find('LABEL').each( function() {
							if( jQuery(this).hasClass(clazz.hover) ) { selectionTop = i; selectionHeight = jQuery(this).outerHeight(); return; }
							i += jQuery(this).outerHeight();
						});
						var divScroll = jQuery(el).parent().find('.multiSelectOptions').scrollTop();
						var divHeight = jQuery(el).parent().find('.multiSelectOptions').height();
						// Adjust the dropdown scroll position
						_multiSelectOptions.scrollTop(selectionTop - ((divHeight / 2) - (selectionHeight / 2)));
					}
			});
			
			function  getValue(){
			 	var retObj = [] ;
				$(this).find('option:selected').each(function(){
					var val = this.value ;
					var text = $.trim($(this).text()) ;
					retObj.push( {value:val,text:text,id:val} ) ;
				}) ;
				return retObj;
			};
			
			function reload(){
				$(this).next('.multiSelect-cont').remove() ;
			}
		}
	}); 
	
	$.multiSelectInit = function(jqueryObj,json4Options){
		var omultiSelect = new multiSelectWidget();
		omultiSelect.init(jqueryObj,json4Options);
		// jqueryObj.__multiSelect(json4Options);
	};
	
	$.fn.multiSelect = function(json_obj){
		var msw = $.data( $(this)[0] ,"msw") ;
		if(msw){
			return msw;
		}
		
		var omultiSelect = new multiSelectWidget();
		omultiSelect.init($(this),json_obj);
		
		$.data( $(this)[0] ,"msw" , omultiSelect );
		return omultiSelect;
	};
	
	
	multiSelectWidget = function(){
		var self = this ;
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			jquery_obj.hide();
			this.$ = jquery_obj;
			json_obj = json_obj||{} ;
			this.options = json_obj ;
			if(json_obj.CommandName || json_obj.url ){
				json_obj.params = json_obj.params||{} ;
				json_obj.params.format = 'false' ;
				$.dataservice( json_obj.CommandName , json_obj.params , function(data){//ID , TEXT
					jquery_obj.empty();
					$(data).each(function(){
						var id 		= this.ID||this.id ;
						var text 	= this.TEXT||this.text ; 
						if( !id || !text ) return ;
						jquery_obj.append("<option value='"+id+"'>"+text+"</option>") ;
					}) ;
					self.render(json_obj) ;
				}  , {url:json_obj.url} ) ;
			}else{
				this.render(json_obj) ;
			}
		};
		
		this.render = function(json_obj){
			if(json_obj != undefined){
				this.$.__multiSelect(json_obj);
			}
		}
		
		this.getValue = function(){
			return this.$.__multiSelect('getValue');
		};
		
		this.reload = function(options){
			this.$.__multiSelect('reload');
			this.options = $.extend(this.options,options||{}) ;
			this.init(this.$,this.options) ;
		}
	};
	
	$.uiwidget.register("multiselect",function(selector){
		selector.each(function(){
			var options = jQuery(this).attr( jQuery.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			jQuery(this).multiSelect(jsonOptions) ;
		});
	}) ;
	
})(jQuery);