// jQuery Alert Dialogs Plugin
//
// Version 1.0
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 29 December 2008
//
// Visit http://abeautifulsite.net/notebook/87 for more information
//
// Usage:
//		$.messageBox.info(option);
//      jAlert( message, [title, callback] )
//		jConfirm( message, [title, callback] )
//		jPrompt( message, [value, title, callback] )
// 
// History:
//
//		1.00 - Released (29 December 2008)
//
// License:
// 
//		This plugin is licensed under the GNU General Public License: http://www.gnu.org/licenses/gpl.html
//
(function($) {
	var topWin = window ;
	$(function(){
		if( $.getTopWin ){
			topWin = $.getTopWin() ;
			topWin.jQuery = topWin.jQuery||{} ;
			if(!topWin.jQuery.messageBox){
				topWin = window ;
			}
		}
	}) ;
	
	
	$.messageBox = {
		// These properties can be read/written by accessing $.messageBox.propertyName from your scripts at any time
		verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
		horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		overlayOpacity: .01,                // transparency level of overlay
		overlayColor: '#FFF',               // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: '&nbsp;确定&nbsp;',         // text for the OK button
		cancelButton: '&nbsp;取消&nbsp;', // text for the Cancel button
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
	    titles : 
	    {
		    "info": " 提示信息",
		    "warning": "警告信息!",
		    "error": "错误信息!!",
		    "success":"成功信息",
		    "confirm": "确认信息",
		    "prompt": "交互信息"
		}
		,
		// Public methods
		show: function(option){
			topWin.jQuery.messageBox._show(option);
		},
		
		info: function(option){
			option.type = "info";
			topWin.jQuery.messageBox._show(option);
		},
		
		warning: function(option){
			option.type = "warning";
			topWin.jQuery.messageBox._show(option);
		},
		
		error: function(option){
			option.type = "error";
			topWin.jQuery.messageBox._show(option);
		},
		
		success: function(option){
			option.type = "success";
			topWin.jQuery.messageBox._show(option);
		},
		
		confirm: function(option){
			option.type = "confirm";
			topWin.jQuery.messageBox._show(option);
		},
		
		prompt: function(option){
			//_resetTopWin(option) ;
			option.type = "prompt";
			topWin.jQuery.messageBox._show(option);
		},
		// Private methods
		
		_show: function(option) {
			var title = option.title;
			var message = option.message;
			var value = option.value;
			var type = option.type;
			var timeout = option.timeout;
			var okButton = this.okButton;
			var width    = option.width||"300px" ;
			var isie6 =  ($.browser.msie && parseInt($.browser.version) <= 9)  ;
			if(option.okButton != null && option.okButton != '' && option.okButton != undefined){
				if(option.okButton.length > 6){
					alert('按钮的名字不能超过6个字符!');
					return ;
				}
				okButton = option.okButton;
			}
			
			var cancelButton = this.cancelButton;
			if(option.cancelButton != null && option.cancelButton != '' && option.cancelButton != undefined){
				if(option.cancelButton.length > 6){
					alert('按钮的名字不能超过6个字符!');
					return ;
				}
				cancelButton = option.cancelButton;
			}
			
			var callback = function(result) {
				try{
				if( option.callback ) option.callback(result);
				}catch(e){}
			};
			
			if(title == null || title == undefined || title == ''){
				title = this.titles[type];
			}
			
			$.messageBox._hide(true);
			$.messageBox._overlay('show');
			
			$("BODY").append(
			  '<div id="popup_container" class="ui-widget ui-widget-content ui-corner-all">' +
			    '<div id="popup_title" class="modal-header ui-widget-header ui-helper-clearfix"></div>' +
			    '<div id="popup_content_' + type + '">' +
			      '<div id="popup_message"></div>' +
				'</div>' +
			  '</div>');
			
			if( $.messageBox.dialogClass ) $("#popup_container").addClass($.messageBox.dialogClass);
			
			// IE6 Fix
			var pos = isie6 ? 'absolute' : 'fixed'; 
			
			$("#popup_container").css({
				position: 'absolute',
				zIndex: 99999,
				padding: 0,
				margin: 0,
				minWidth:300
			});
		
			isie6 && $("#popup_container").css({
				width:"300px"
			});
			
			$("#popup_title").text(title) ;
			$("#popup_content").addClass(type);
			$("#popup_message").text(message);
			$("#popup_message").html( $("#popup_message").text().replace(/\n/g, '<br />') );
	
			$("#popup_container").css({
				minWidth: $("#popup_container").outerWidth(),
				maxWidth: $("#popup_container").outerWidth()
			});
			
			isie6 && $("#popup_container").css({
				width:$("#popup_container").outerWidth()
			});
			
			//$("#popup_title").css("width",$("#popup_container").width()+"px");
			
			$.messageBox._reposition();
			$.messageBox._maintainPosition(true);
			
			switch( type ) {
				case 'confirm':
					$("#popup_message").after('<div id="popup_panel"><button type="button" class="btn btn-primary" id="popup_ok">' + okButton + '</button> <button class="btn" type="button" id="popup_cancel">' + cancelButton + '</button></div>');
					$("#popup_ok").click( function() {
						$.messageBox._hide();
						if( callback ) callback(true);
					});
					$("#popup_cancel").click( function() {
						$.messageBox._hide();
						if( callback ) callback(false);
					});
					$("#popup_ok").focus();
					$("#popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
				break;
				case 'prompt':
					$("#popup_message").append('<br /><input type="text" size="30" id="popup_prompt" />').after('<div id="popup_panel"><button type="button" class="btn btn-primary" id="popup_ok">' + okButton + '</button> <button type="button" class="btn" id="popup_cancel">' + cancelButton + '</button></div>');
					$("#popup_prompt").width( $("#popup_message").width() );
					$("#popup_ok").click( function() {
						var val = $("#popup_prompt").val();
						$.messageBox._hide();
						if( callback ) callback( val );
					});
					$("#popup_cancel").click( function() {
						$.messageBox._hide();
						if( callback ) callback( null );
					});
					$("#popup_prompt, #popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
					if( value ) $("#popup_prompt").val(value);
					$("#popup_prompt").focus().select();
				break;
				default:
					if( type == 'error' )
						type = 'danger' ;
					$("#popup_container").addClass("alert alert-"+type);
					$("#popup_message").after('<div id="popup_panel"><button type="button" class="btn  btn-'+type+'" id="popup_ok">' + okButton + '</button></div>');
					$("#popup_ok").click( function() {
						$.messageBox._hide();
						callback(true);
					});
					$("#popup_ok").focus().keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) $("#popup_ok").trigger('click');
					});
				break;
			}
			
			if(timeout){
				//window.setTimeout("$.messageBox._hide()", (timeout * 1000));
				window.MessageBoxTimeout = window.setTimeout(function(){
					var btn = $("#popup_container").find(".btn:last");
					var isOk = btn.attr("id") == "popup_ok" ;
					
					$.messageBox._hide() ;
					if(isOk){
						callback() ;
					}
				},timeout*1000) ;
				
				var _tout = timeout ;
				
				function calcTimeout(_tout,interVal  ){
					if( _tout <= 0 ){
						window.clearInterval(interVal) ;
					}
				}
				
				function setText(_tout){
					var btn = $("#popup_container").find(".btn:last");
					var text = btn.text() ;
					text = text.split("(")[0] ;
					btn.html(text+"(<strong>"+_tout+"</strong>)") ; 
				}
			
				var text = $("#popup_container").find(".btn").length <=1 ?okButton:cancelButton ;
				setText(_tout) ;
				_tout-- ;
				
				window.MessageBoxinterVal = window.setInterval(function(){
					setText(_tout) ;
					_tout-- ;
					calcTimeout( _tout,window.MessageBoxinterVal) ;
				},1000) ;
				
				calcTimeout(_tout,window.MessageBoxinterVal) ;
				
				function calcTimeout(_tout,interVal  ){
					if( _tout <= 0 ){
						window.clearInterval(interVal) ;
					}
				}
				
				function setText(_tout){
					var btn = $("#popup_container").find(".btn:last");
					var text = btn.text() ;
					text = text.split("(")[0] ;
					btn.html(text+"(<strong>"+_tout+"</strong>)") ; 
				}
			}
			
			// Make draggable
			if( $.messageBox.draggable ) {
				try {
					$("#popup_container").draggable({ handle: $("#popup_title") });
					$("#popup_title").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
		},
		
		_hide: function(isInit) {
			$("#popup_container").remove();
			$.messageBox._overlay('hide');
			$.messageBox._maintainPosition(false);
			
			if(!isInit &&  window.MessageBoxinterVal ){
				window.clearInterval(window.MessageBoxinterVal) ;
				window.MessageBoxTimeout && window.clearTimeout(window.MessageBoxTimeout) ;
			}
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.messageBox._overlay('hide');
					var lyr1 = ($.browser.msie ) 
					? '<iframe style="z-index:99997;border:none;background:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src=""></iframe>'
					: "";
					
					$("BODY").append(lyr1+'<div id="popup_overlay" class="ui-widget-overlay"></div>');
					$("#popup_overlay").css({
						position: 'absolute',
						zIndex: 99998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height()//,
						//background: $.messageBox.overlayColor,
						//opacity: $.messageBox.overlayOpacity
					});
					
					if ($.browser.msie){
						$('#popup_overlay').prev().css('opacity',0.0).height($('#popup_overlay').height());
					}
							
				break;
				case 'hide':
				     if($.browser.msie){
						$("#popup_overlay").prev().remove();
					 }
					$("#popup_overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			var top = (($(window).height() / 2) - ($("#popup_container").outerHeight() / 2)) + $.messageBox.verticalOffset;
			var left = (($(window).width() / 2) - ($("#popup_container").outerWidth() / 2)) + $.messageBox.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			if( $.browser.msie && parseInt($.browser.version) <= 6 ) top = top + $(window).scrollTop();
			
			$("#popup_container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#popup_overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.messageBox.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', function() {
							$.messageBox._reposition();
						});
					break;
					case false:
						$(window).unbind('resize');
					break;
				}
			}
		}
		
	}
	
	// Shortuct functions
})(jQuery);