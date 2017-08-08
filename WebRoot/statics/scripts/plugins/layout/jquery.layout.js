/**
 * panel - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 */
 
 /**------------------Panel----------------------**/
(function($){
	function removeNode(node){
		node.each(function(){
			$(this).remove();
			if ($.browser.msie){
				this.outerHTML = '';
			}
		});
	}
	
	function setSize(target, param){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		var pheader = panel.find('>div.panel-header');
		var pbody = panel.find('>div.panel-body');
		
		if (param){
			if (param.width) opts.width = param.width;
			if (param.height) opts.height = param.height;
			if (param.left != null) opts.left = param.left;
			if (param.top != null) opts.top = param.top;
		}
		
		if (opts.fit == true){
			var p = panel.parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		panel.css({
			left: opts.left,
			top: opts.top
		});
		panel.css(opts.style);
		panel.addClass(opts.cls);
		pheader.addClass(opts.headerCls);
		pbody.addClass(opts.bodyCls);
		
		if (!isNaN(opts.width)){
			if ($.boxModel == true){
				panel.width(opts.width - (panel.outerWidth() - panel.width()));
				pheader.width(panel.width() - (pheader.outerWidth() - pheader.width()));
				pbody.width(panel.width() - (pbody.outerWidth() - pbody.width()));
			} else {
				panel.width(opts.width);
				pheader.width(panel.width());
				pbody.width(panel.width());
			}
		} else {
			panel.width('auto');
			pbody.width('auto');
		}
		if (!isNaN(opts.height)){
//			var height = opts.height - (panel.outerHeight()-panel.height()) - pheader.outerHeight();
//			if ($.boxModel == true){
//				height -= pbody.outerHeight() - pbody.height();
//			}
//			pbody.height(height);
			
			if ($.boxModel == true){
				panel.height(opts.height - (panel.outerHeight() - panel.height()));
				pbody.height(panel.height() - pheader.outerHeight() - (pbody.outerHeight() - pbody.height()));
			} else {
				panel.height(opts.height);
				pbody.height(panel.height() - pheader.outerHeight());
			}
		} else {
			pbody.height('auto');
		}
		panel.css('height', null);
		
		opts.onResize.apply(target, [opts.width, opts.height]);
		
		panel.find('>div.panel-body>div').triggerHandler('_resize');
	}
	
	function movePanel(target, param){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		if (param){
			if (param.left != null) opts.left = param.left;
			if (param.top != null) opts.top = param.top;
		}
		panel.css({
			left: opts.left,
			top: opts.top
		});
		opts.onMove.apply(target, [opts.left, opts.top]);
	}
	

	function wrapPanel(target){
		var panel = null ;
		if ( $.browser.msie &&  $.browser.version == '6.0') {
			if( $(target).find(".panel-body")[0] ){
				panel = $(target).addClass("panel");
			}
		}
		if( panel == null ){
			$(target).find(".panel-body").removeClass("panel-body") ;
			panel = $(target).addClass('panel-body').css({overflow:'auto'}).wrap('<div class="panel"></div>').parent();
		}
		
		panel.bind('_resize', function(){
			var opts = $.data(target, 'panel').options;
			if (opts.fit == true){
				setSize(target);
			}
			return false;
		});
		
		return panel;
	}
	
	function addHeader(target){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		removeNode(panel.find('>div.panel-header'));
		if (opts.title && !opts.noheader){
			var header = $('<div class="panel-header ui-widget-header"><div class="panel-title">'+opts.title+'</div></div>').prependTo(panel);
			if (opts.iconCls){
				header.find('.panel-title').addClass('panel-with-icon');
				$('<div class="panel-icon"></div>').addClass(opts.iconCls).appendTo(header);
			}
			var tool = $('<div class="panel-tool"></div>').appendTo(header);
			if (opts.closable){
				$('<div class="panel-tool-close"></div>').appendTo(tool).bind('click', onClose);
			}
			if (opts.maximizable){
				$('<div class="panel-tool-max"></div>').appendTo(tool).bind('click', onMax);
			}
			if (opts.minimizable){
				$('<div class="panel-tool-min"></div>').appendTo(tool).bind('click', onMin);
			}
			if (opts.collapsible){
				$('<div class="panel-tool-collapse"></div>').appendTo(tool).bind('click', onToggle);
			}
			if (opts.tools){
				for(var i=opts.tools.length-1; i>=0; i--){
					var t = $('<div></div>').addClass(opts.tools[i].iconCls).appendTo(tool);
					if (opts.tools[i].handler){
						t.bind('click', eval(opts.tools[i].handler));
					}
				}
			}
			tool.find('div').hover(
				function(){$(this).addClass('panel-tool-over');},
				function(){$(this).removeClass('panel-tool-over');}
			);
			panel.find('>div.panel-body').removeClass('panel-body-noheader');
		} else {
			panel.find('>div.panel-body').addClass('panel-body-noheader');
		}
		
		function onToggle(){
			if ($(this).hasClass('panel-tool-expand')){
				expandPanel(target, true);
			} else {
				collapsePanel(target, true);
			}
			return false;
		}
		
		function onMin(){
			minimizePanel(target);
			return false;
		}
		
		function onMax(){
			if ($(this).hasClass('panel-tool-restore')){
				restorePanel(target);
			} else {
				maximizePanel(target);
			}
			return false;
		}
		
		function onClose(){
			closePanel(target);
			return false;
		}
	}
	
	/**
	 * load content from remote site if the href attribute is defined
	 */
	function loadData(target){
		var state = $.data(target, 'panel');
		if (state.options.href && (!state.isLoaded || !state.options.cache)){
			state.isLoaded = false;
			var pbody = state.panel.find('>div.panel-body');
			pbody.html($('<div class="panel-loading"></div>').html(state.options.loadingMessage));
			pbody.load(state.options.href, null, function(){
				if ($.parser){
					$.parser.parse(pbody);
				}
				state.options.onLoad.apply(target, arguments);
				state.isLoaded = true;
			});
		}
	}
	
	function openPanel(target, forceOpen){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		
		if (forceOpen != true){
			if (opts.onBeforeOpen.call(target) == false) return;
		}
		panel.show();
		opts.closed = false;
		opts.onOpen.call(target);
		
		if (opts.maximized == true) maximizePanel(target);
		if (opts.minimized == true) minimizePanel(target);
		if (opts.collapsed == true) collapsePanel(target);
		
		if (!opts.collapsed){
			loadData(target);
		}
	}
	
	function closePanel(target, forceClose){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		
		if (forceClose != true){
			if (opts.onBeforeClose.call(target) == false) return;
		}
		panel.hide();
		opts.closed = true;
		opts.onClose.call(target);
	}
	
	function destroyPanel(target, forceDestroy){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		
		if (forceDestroy != true){
			if (opts.onBeforeDestroy.call(target) == false) return;
		}
		removeNode(panel);
		opts.onDestroy.call(target);
	}
	
	function collapsePanel(target, animate){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		var body = panel.find('>div.panel-body');
		var tool = panel.find('>div.panel-header .panel-tool-collapse');
		
		if (tool.hasClass('panel-tool-expand')) return;
		
		body.stop(true, true);	// stop animation
		if (opts.onBeforeCollapse.call(target) == false) return;
		
		tool.addClass('panel-tool-expand');
		if (animate == true){
			body.slideUp('normal', function(){
				opts.collapsed = true;
				opts.onCollapse.call(target);
			});
		} else {
			body.hide();
			opts.collapsed = true;
			opts.onCollapse.call(target);
		}
	}
	
	function expandPanel(target, animate){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		var body = panel.find('>div.panel-body');
		var tool = panel.find('>div.panel-header .panel-tool-collapse');
		
		if (!tool.hasClass('panel-tool-expand')) return;
		
		body.stop(true, true);	// stop animation
		if (opts.onBeforeExpand.call(target) == false) return;
		
		tool.removeClass('panel-tool-expand');
		if (animate == true){
			body.slideDown('normal', function(){
				opts.collapsed = false;
				opts.onExpand.call(target);
				loadData(target);
			});
		} else {
			body.show();
			opts.collapsed = false;
			opts.onExpand.call(target);
			loadData(target);
		}
	}
	
	function maximizePanel(target){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		var tool = panel.find('>div.panel-header .panel-tool-max');
		
		if (tool.hasClass('panel-tool-restore')) return;
		
		tool.addClass('panel-tool-restore');
		
		$.data(target, 'panel').original = {
			width: opts.width,
			height: opts.height,
			left: opts.left,
			top: opts.top,
			fit: opts.fit
		};
		opts.left = 0;
		opts.top = 0;
		opts.fit = true;
		setSize(target);
		opts.minimized = false;
		opts.maximized = true;
		opts.onMaximize.call(target);
	}
	
	function minimizePanel(target){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		panel.hide();
		opts.minimized = true;
		opts.maximized = false;
		opts.onMinimize.call(target);
	}
	
	function restorePanel(target){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		var tool = panel.find('>div.panel-header .panel-tool-max');
		
		if (!tool.hasClass('panel-tool-restore')) return;
		
		panel.show();
		tool.removeClass('panel-tool-restore');
		var original = $.data(target, 'panel').original;
		opts.width = original.width;
		opts.height = original.height;
		opts.left = original.left;
		opts.top = original.top;
		opts.fit = original.fit;
		setSize(target);
		opts.minimized = false;
		opts.maximized = false;
		opts.onRestore.call(target);
	}
	
	function setBorder(target){
		var opts = $.data(target, 'panel').options;
		var panel = $.data(target, 'panel').panel;
		if (opts.border == true){
			panel.find('>div.panel-header').removeClass('panel-header-noborder');
			panel.find('>div.panel-body').removeClass('panel-body-noborder');
		} else {
			panel.find('>div.panel-header').addClass('panel-header-noborder');
			panel.find('>div.panel-body').addClass('panel-body-noborder');
		}
	}
	
	function setTitle(target, title){
		$.data(target, 'panel').options.title = title;
		$(target).panel('header').find('div.panel-title').html(title);
	}
	
	$(window).unbind('.panel').bind('resize.panel', function(){
		var layout = $('body.layout');
		if (layout.length){
			layout.layout('resize');
		} else {
			$('body>div.panel').triggerHandler('_resize');
		}
	});
	
	$.fn.panel = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'options':
				return $.data(this[0], 'panel').options;
			case 'panel':
				return $.data(this[0], 'panel').panel;
			case 'header':
				return $.data(this[0], 'panel').panel.find('>div.panel-header');
			case 'body':
				return $.data(this[0], 'panel').panel.find('>div.panel-body');
			case 'setTitle':
				return this.each(function(){
					setTitle(this, param);
				});
			case 'open':
				return this.each(function(){
					openPanel(this, param);
				});
			case 'close':
				return this.each(function(){
					closePanel(this, param);
				});
			case 'destroy':
				return this.each(function(){
					destroyPanel(this, param);
				});
			case 'refresh':
				return this.each(function(){
					$.data(this, 'panel').isLoaded = false;
					loadData(this);
				});
			case 'resize':
				return this.each(function(){
					setSize(this, param);
				});
			case 'move':
				return this.each(function(){
					movePanel(this, param);
				});
			case 'maximize':
				return this.each(function(){
					maximizePanel(this);
				});
			case 'minimize':
				return this.each(function(){
					minimizePanel(this);
				});
			case 'restore':
				return this.each(function(){
					restorePanel(this);
				});
			case 'collapse':
				return this.each(function(){
					collapsePanel(this, param);	// param: boolean,indicate animate or not
				});
			case 'expand':
				return this.each(function(){
					expandPanel(this, param);	// param: boolean,indicate animate or not
				});
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'panel');
			var opts;
			if (state){
				opts = $.extend(state.options, options);
			} else {
				var t = $(this);
				opts = $.extend({}, $.fn.panel.defaults, {
					width: (parseInt(t.css('width')) || undefined),
					height: (parseInt(t.css('height')) || undefined),
					left: (parseInt(t.css('left')) || undefined),
					top: (parseInt(t.css('top')) || undefined),
					title: t.attr('title'),
					iconCls: t.attr('icon'),
					cls: t.attr('cls'),
					headerCls: t.attr('headerCls'),
					bodyCls: t.attr('bodyCls'),
					href: t.attr('href'),
					cache: (t.attr('cache') ? t.attr('cache') == 'true' : undefined),
					fit: (t.attr('fit') ? t.attr('fit') == 'true' : undefined),
					border: (t.attr('border') ? t.attr('border') == 'true' : undefined),
					noheader: (t.attr('noheader') ? t.attr('noheader') == 'true' : undefined),
					collapsible: (t.attr('collapsible') ? t.attr('collapsible') == 'true' : undefined),
					minimizable: (t.attr('minimizable') ? t.attr('minimizable') == 'true' : undefined),
					maximizable: (t.attr('maximizable') ? t.attr('maximizable') == 'true' : undefined),
					closable: (t.attr('closable') ? t.attr('closable') == 'true' : undefined),
					collapsed: (t.attr('collapsed') ? t.attr('collapsed') == 'true' : undefined),
					minimized: (t.attr('minimized') ? t.attr('minimized') == 'true' : undefined),
					maximized: (t.attr('maximized') ? t.attr('maximized') == 'true' : undefined),
					closed: (t.attr('closed') ? t.attr('closed') == 'true' : undefined)
				}, options);
				
				t.attr('title', '');
				state = $.data(this, 'panel', {
					options: opts,
					panel: wrapPanel(this),
					isLoaded: false
				});
			}
			
			if (opts.content){
				$(this).html(opts.content);
				if ($.parser){
					$.parser.parse(this);
				}
			}
			addHeader(this);
			setBorder(this);
//			loadData(this);
			
			if (opts.doSize == true){
				state.panel.css('display','block');
				setSize(this);
			}
			if (opts.closed == true){
				state.panel.hide();
			} else {
				openPanel(this);
			}
		});
	};
	
	$.fn.panel.defaults = {
		title: null,
		iconCls: null,
		width: 'auto',
		height: 'auto',
		left: null,
		top: null,
		cls: null,
		headerCls: null,
		bodyCls: null,
		style: {},
		href: null,
		cache: true,
		fit: false,
		border: true,
		doSize: true,	// true to set size and do layout
		noheader: false,
		content: null,	// the body content if specified
		
		collapsible: false,
		minimizable: false,
		maximizable: false,
		closable: false,
		collapsed: false,
		minimized: false,
		maximized: false,
		closed: false,
		
		// custom tools, every tool can contain two properties: iconCls and handler
		// iconCls is a icon CSS class
		// handler is a function, which will be run when tool button is clicked
		tools: [],	
		
		href: null,
		loadingMessage: 'Loading...',
		onLoad: function(){},
		onBeforeOpen: function(){},
		onOpen: function(){},
		onBeforeClose: function(){},
		onClose: function(){},
		onBeforeDestroy: function(){},
		onDestroy: function(){},
		onResize: function(width,height){},
		onMove: function(left,top){},
		onMaximize: function(){},
		onRestore: function(){},
		onMinimize: function(){},
		onBeforeCollapse: function(){},
		onBeforeExpand: function(){},
		onCollapse: function(){},
		onExpand: function(){}
	};
})(jQuery);


 /**------------------resize----------------------**/
(function($){
	$.fn.resizable = function(options){
		function resize(e){
			var resizeData = e.data;
			var options = $.data(resizeData.target, 'resizable').options;
			if (resizeData.dir.indexOf('e') != -1) {
				var width = resizeData.startWidth + e.pageX - resizeData.startX;
				width = Math.min(
							Math.max(width, options.minWidth),
							options.maxWidth
						);
				resizeData.width = width;
			}
			if (resizeData.dir.indexOf('s') != -1) {
				var height = resizeData.startHeight + e.pageY - resizeData.startY;
				height = Math.min(
						Math.max(height, options.minHeight),
						options.maxHeight
				);
				resizeData.height = height;
			}
			if (resizeData.dir.indexOf('w') != -1) {
				resizeData.width = resizeData.startWidth - e.pageX + resizeData.startX;
				if (resizeData.width >= options.minWidth && resizeData.width <= options.maxWidth) {
					resizeData.left = resizeData.startLeft + e.pageX - resizeData.startX;
				}
			}
			if (resizeData.dir.indexOf('n') != -1) {
				resizeData.height = resizeData.startHeight - e.pageY + resizeData.startY;
				if (resizeData.height >= options.minHeight && resizeData.height <= options.maxHeight) {
					resizeData.top = resizeData.startTop + e.pageY - resizeData.startY;
				}
			}
		}
		
		function applySize(e){
			var resizeData = e.data;
			var target = resizeData.target;
			if ($.boxModel == true){
				$(target).css({
					width: resizeData.width - resizeData.deltaWidth,
					height: resizeData.height - resizeData.deltaHeight,
					left: resizeData.left,
					top: resizeData.top
				});
			} else {
				$(target).css({
					width: resizeData.width,
					height: resizeData.height,
					left: resizeData.left,
					top: resizeData.top
				});
			}
		}
		
		function doDown(e){
			$.data(e.data.target, 'resizable').options.onStartResize.call(e.data.target, e);
			return false;
		}
		
		function doMove(e){
			resize(e);
			if ($.data(e.data.target, 'resizable').options.onResize.call(e.data.target, e) != false){
				applySize(e)
			}
			return false;
		}
		
		function doUp(e){
			resize(e, true);
			applySize(e);
			$(document).unbind('.resizable');
			$.data(e.data.target, 'resizable').options.onStopResize.call(e.data.target, e);
			return false;
		}
		
		return this.each(function(){
			var opts = null;
			var state = $.data(this, 'resizable');
			if (state) {
				$(this).unbind('.resizable');
				opts = $.extend(state.options, options || {});
			} else {
				opts = $.extend({}, $.fn.resizable.defaults, options || {});
			}
			
			if (opts.disabled == true) {
				return;
			}
			
			$.data(this, 'resizable', {
				options: opts
			});
			
			var target = this;
			
			// bind mouse event using namespace resizable
			$(this).bind('mousemove.resizable', onMouseMove)
				   .bind('mousedown.resizable', onMouseDown);
			
			function onMouseMove(e) {
				var dir = getDirection(e);
				if (dir == '') {
					$(target).css('cursor', 'default');
				} else {
					$(target).css('cursor', dir + '-resize');
				}
			}
			
			function onMouseDown(e) {
				var dir = getDirection(e);
				if (dir == '') return;
				
				var data = {
					target: this,
					dir: dir,
					startLeft: getCssValue('left'),
					startTop: getCssValue('top'),
					left: getCssValue('left'),
					top: getCssValue('top'),
					startX: e.pageX,
					startY: e.pageY,
					startWidth: $(target).outerWidth(),
					startHeight: $(target).outerHeight(),
					width: $(target).outerWidth(),
					height: $(target).outerHeight(),
					deltaWidth: $(target).outerWidth() - $(target).width(),
					deltaHeight: $(target).outerHeight() - $(target).height()
				};
				$(document).bind('mousedown.resizable', data, doDown);
				$(document).bind('mousemove.resizable', data, doMove);
				$(document).bind('mouseup.resizable', data, doUp);
			}
			
			// get the resize direction
			function getDirection(e) {
				var dir = '';
				var offset = $(target).offset();
				var width = $(target).outerWidth();
				var height = $(target).outerHeight();
				var edge = opts.edge;
				if (e.pageY > offset.top && e.pageY < offset.top + edge) {
					dir += 'n';
				} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
					dir += 's';
				}
				if (e.pageX > offset.left && e.pageX < offset.left + edge) {
					dir += 'w';
				} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
					dir += 'e';
				}
				
				var handles = opts.handles.split(',');
				for(var i=0; i<handles.length; i++) {
					var handle = handles[i].replace(/(^\s*)|(\s*$)/g, '');
					if (handle == 'all' || handle == dir) {
						return dir;
					}
				}
				return '';
			}
			
			function getCssValue(css) {
				var val = parseInt($(target).css(css));
				if (isNaN(val)) {
					return 0;
				} else {
					return val;
				}
			}
			
		});
	};
	
	$.fn.resizable.defaults = {
			disabled:false,
			handles:'n, e, s, w, ne, se, sw, nw, all',
			minWidth: 10,
			minHeight: 10,
			maxWidth: 10000,//$(document).width(),
			maxHeight: 10000,//$(document).height(),
			edge:5,
			onStartResize: function(e){},
			onResize: function(e){},
			onStopResize: function(e){}
	};
	
})(jQuery);

/**------------------layout----------------------**/
(function($){
	var resizing = false;	// indicate if the region panel is resizing
	
	function setSize(container){
		var opts = $.data(container, 'layout').options;
		var panels = $.data(container, 'layout').panels;
		
		var cc = $(container);
		
		if (opts.fit == true){
			var p = cc.parent();
			cc.width(p.width()).height(p.height());
		}
		
		var cpos = {
			top:0,
			left:0,
			width:cc.width(),
			height:cc.height()
		};
		
		// set north panel size
		function setNorthSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: cc.width(),
				height: pp.panel('options').height,
				left: 0,
				top: 0
			});
			cpos.top += pp.panel('options').height;
			cpos.height -= pp.panel('options').height;
		}
		if (isVisible(panels.expandNorth)){
			setNorthSize(panels.expandNorth);
		} else {
			setNorthSize(panels.north);
		}
		
		// set south panel size
		function setSouthSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: cc.width(),
				height: pp.panel('options').height,
				left: 0,
				top: cc.height() - pp.panel('options').height
			});
			cpos.height -= pp.panel('options').height;
		}
		if (isVisible(panels.expandSouth)){
			setSouthSize(panels.expandSouth);
		} else {
			setSouthSize(panels.south);
		}
		
		// set east panel size
		function setEastSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: pp.panel('options').width,
				height: cpos.height,
				left: cc.width() - pp.panel('options').width,
				top: cpos.top
			});
			cpos.width -= pp.panel('options').width;
		}
		if (isVisible(panels.expandEast)){
			setEastSize(panels.expandEast);
		} else {
			setEastSize(panels.east);
		}
		
		// set west panel size
		function setWestSize(pp){
			if (pp.length == 0) return;
			pp.panel('resize', {
				width: pp.panel('options').width,
				height: cpos.height,
				left: 0,
				top: cpos.top
			});
			cpos.left += pp.panel('options').width;
			cpos.width -= pp.panel('options').width;
		}
		if (isVisible(panels.expandWest)){
			setWestSize(panels.expandWest);
		} else {
			setWestSize(panels.west);
		}
		
		panels.center.panel('resize', cpos);
	}
	
	/**
	 * initialize and wrap the layout
	 */
	function init(container){
		var cc = $(container);
		if (cc[0].tagName == 'BODY' || cc[0].tagName == 'DIV'){
			$('html').css({
				height: '100%',
				overflow: 'hidden'
			});
			$('body').css({
				height: '100%',
				overflow: 'hidden',
				border: 'none'
			});
		}
		cc.addClass('layout');
		cc.css({
			margin:0,
			padding:0
		});
		
		
		function createPanel(dir){
			var pp = $('>div[region='+dir+']', container).addClass('layout-body');
			
			var toolCls = null;
			if (dir == 'north'){
				toolCls = 'layout-button-up';
			} else if (dir == 'south'){
				toolCls = 'layout-button-down';
			} else if (dir == 'east'){
				toolCls = 'layout-button-right';
			} else if (dir == 'west'){
				toolCls = 'layout-button-left';
			}
			
			var cls = 'layout-panel layout-panel-' + dir;
			if (pp.attr('split') == 'true'){
				cls += ' layout-split-' + dir;
			}
			pp.panel({
				cls: cls,
				doSize: false,
				border: (pp.attr('border') == 'false' ? false : true),
				tools: [{
					iconCls: toolCls, 
					handler: function(){
						collapsePanel(container, dir);
					}
				}]
			});
			
			if (pp.attr('split') == 'true'){
				var panel = pp.panel('panel');
				
				var handles = '';
				if (dir == 'north') handles = 's';
				if (dir == 'south') handles = 'n';
				if (dir == 'east') handles = 'w';
				if (dir == 'west') handles = 'e';
				
				panel.resizable({
					handles:handles,
					onStartResize: function(e){
						resizing = true;
						
						if (dir == 'north' || dir == 'south'){
							var proxy = $('>div.layout-split-proxy-v', container);
						} else {
							var proxy = $('>div.layout-split-proxy-h', container);
						}
						var top=0,left=0,width=0,height=0;
						var pos = {display: 'block'};
						if (dir == 'north'){
							pos.top = parseInt(panel.css('top')) + panel.outerHeight() - proxy.height();
							pos.left = parseInt(panel.css('left'));
							pos.width = panel.outerWidth();
							pos.height = proxy.height();
						} else if (dir == 'south'){
							pos.top = parseInt(panel.css('top'));
							pos.left = parseInt(panel.css('left'));
							pos.width = panel.outerWidth();
							pos.height = proxy.height();
						} else if (dir == 'east'){
							pos.top = parseInt(panel.css('top')) || 0;
							pos.left = parseInt(panel.css('left')) || 0;
							pos.width = proxy.width();
							pos.height = panel.outerHeight();
						} else if (dir == 'west'){
							pos.top = parseInt(panel.css('top')) || 0;
							pos.left = panel.outerWidth() - proxy.width();
							pos.width = proxy.width();
							pos.height = panel.outerHeight();
						}
						proxy.css(pos);
						
						$('<div class="layout-mask"></div>').css({
							left:0,
							top:0,
							width:cc.width(),
							height:cc.height()
						}).appendTo(cc);
					},
					onResize: function(e){
						if (dir == 'north' || dir == 'south'){
							var proxy = $('>div.layout-split-proxy-v', container);
							proxy.css('top', e.pageY - $(container).offset().top - proxy.height()/2);
						} else {
							var proxy = $('>div.layout-split-proxy-h', container);
							proxy.css('left', e.pageX - $(container).offset().left - proxy.width()/2);
						}
						return false;
					},
					onStopResize: function(){
						$('>div.layout-split-proxy-v', container).css('display','none');
						$('>div.layout-split-proxy-h', container).css('display','none');
						var opts = pp.panel('options');
						opts.width = panel.outerWidth();
						opts.height = panel.outerHeight();
						opts.left = panel.css('left');
						opts.top = panel.css('top');
						pp.panel('resize');
						setSize(container);
						resizing = false;
						
						cc.find('>div.layout-mask').remove();
					}
				});
			}
			return pp;
		}
		
		$('<div class="layout-split-proxy-h"></div>').appendTo(cc);
		$('<div class="layout-split-proxy-v"></div>').appendTo(cc);
		
		var panels = {
			center: createPanel('center')
		};
		
		panels.north = createPanel('north');
		panels.south = createPanel('south');
		panels.east = createPanel('east');
		panels.west = createPanel('west');
		
		$(container).bind('_resize', function(){
			var opts = $.data(container, 'layout').options;
			if (opts.fit == true){
				setSize(container);
			}
			return false;
		});
		$(window).resize(function(){
			setSize(container);
		});
		
		return panels;
	}
	
	function collapsePanel(container, region){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		
		function createExpandPanel(dir){
			var icon;
			if (dir == 'east') icon = 'layout-button-left'
				else if (dir == 'west') icon = 'layout-button-right'
					else if (dir == 'north') icon = 'layout-button-down'
						else if (dir == 'south') icon = 'layout-button-up';
			
			var p = $('<div></div>').appendTo(cc).panel({
				cls: 'layout-expand ui-widget-header',
				title: '&nbsp;',
				closed: true,
				doSize: false,
				tools: [{
					iconCls: icon,
					handler:function(){
						expandPanel(container, region);
					}
				}]
			});
			p.panel('panel').hover(
				function(){$(this).addClass('layout-expand-over');},
				function(){$(this).removeClass('layout-expand-over');}
			);
			return p;
		}
		
		if (region == 'east'){
			if (panels.east.panel('options').onBeforeCollapse.call(panels.east) == false) return;
			
			panels.center.panel('resize', {
				width: panels.center.panel('options').width + panels.east.panel('options').width - 28
			});
			panels.east.panel('panel').animate({left:cc.width()}, function(){
				panels.east.panel('close');
				panels.expandEast.panel('open').panel('resize', {
					top: panels.east.panel('options').top,
					left: cc.width() - 28,
					width: 28,
					height: panels.east.panel('options').height
				});
				panels.east.panel('options').onCollapse.call(panels.east);
			});
			if (!panels.expandEast) {
				panels.expandEast = createExpandPanel('east');
				panels.expandEast.panel('panel').click(function(){
					panels.east.panel('open').panel('resize', {left:cc.width()});
					panels.east.panel('panel').animate({
						left: cc.width() - panels.east.panel('options').width
					});
					return false;
				});
			}
		} else if (region == 'west'){
			if (panels.west.panel('options').onBeforeCollapse.call(panels.west) == false) return;
			
			panels.center.panel('resize', {
				width: panels.center.panel('options').width + panels.west.panel('options').width - 28,
				left: 28
			});
			panels.west.panel('panel').animate({left:-panels.west.panel('options').width}, function(){
				panels.west.panel('close');
				panels.expandWest.panel('open').panel('resize', {
					top: panels.west.panel('options').top,
					left: 0,
					width: 28,
					height: panels.west.panel('options').height
				});
				panels.west.panel('options').onCollapse.call(panels.west);
			});
			if (!panels.expandWest) {
				panels.expandWest = createExpandPanel('west');
				panels.expandWest.panel('panel').click(function(){
					panels.west.panel('open').panel('resize', {left: -panels.west.panel('options').width});
					panels.west.panel('panel').animate({
						left: 0
					});
					return false;
				});
			}
		} else if (region == 'north'){
			if (panels.north.panel('options').onBeforeCollapse.call(panels.north) == false) return;
			
			var hh = cc.height() - 28;
			if (isVisible(panels.expandSouth)){
				hh -= panels.expandSouth.panel('options').height;
			} else if (isVisible(panels.south)){
				hh -= panels.south.panel('options').height;
			}
			panels.center.panel('resize', {top:28, height:hh});
			panels.east.panel('resize', {top:28, height:hh});
			panels.west.panel('resize', {top:28, height:hh});
			if (isVisible(panels.expandEast)) panels.expandEast.panel('resize', {top:28, height:hh});
			if (isVisible(panels.expandWest)) panels.expandWest.panel('resize', {top:28, height:hh});
			
			panels.north.panel('panel').animate({top:-panels.north.panel('options').height}, function(){
				panels.north.panel('close');
				panels.expandNorth.panel('open').panel('resize', {
					top: 0,
					left: 0,
					width: cc.width(),
					height: 28
				});
				panels.north.panel('options').onCollapse.call(panels.north);
			});
			if (!panels.expandNorth) {
				panels.expandNorth = createExpandPanel('north');
				panels.expandNorth.panel('panel').click(function(){
					panels.north.panel('open').panel('resize', {top:-panels.north.panel('options').height});
					panels.north.panel('panel').animate({top:0});
					return false;
				});
			}
		} else if (region == 'south'){
			if (panels.south.panel('options').onBeforeCollapse.call(panels.south) == false) return;
			
			var hh = cc.height() - 28;
			if (isVisible(panels.expandNorth)){
				hh -= panels.expandNorth.panel('options').height;
			} else if (isVisible(panels.north)){
				hh -= panels.north.panel('options').height;
			}
			panels.center.panel('resize', {height:hh});
			panels.east.panel('resize', {height:hh});
			panels.west.panel('resize', {height:hh});
			if (isVisible(panels.expandEast)) panels.expandEast.panel('resize', {height:hh});
			if (isVisible(panels.expandWest)) panels.expandWest.panel('resize', {height:hh});
			
			panels.south.panel('panel').animate({top:cc.height()}, function(){
				panels.south.panel('close');
				panels.expandSouth.panel('open').panel('resize', {
					top: cc.height() - 28,
					left: 0,
					width: cc.width(),
					height: 28
				});
				panels.south.panel('options').onCollapse.call(panels.south);
			});
			if (!panels.expandSouth) {
				panels.expandSouth = createExpandPanel('south');
				panels.expandSouth.panel('panel').click(function(){
					panels.south.panel('open').panel('resize', {top:cc.height()});
					panels.south.panel('panel').animate({top:cc.height()-panels.south.panel('options').height});
					return false;
				});
			}
		}
	}
	
	function expandPanel(container, region){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		if (region == 'east' && panels.expandEast){
			if (panels.east.panel('options').onBeforeExpand.call(panels.east) == false) return;
			
			panels.expandEast.panel('close');
			panels.east.panel('panel').stop(true,true);
			panels.east.panel('open').panel('resize', {left:cc.width()});
			panels.east.panel('panel').animate({
				left: cc.width() - panels.east.panel('options').width
			}, function(){
				setSize(container);
				panels.east.panel('options').onExpand.call(panels.east);
			});
		} else if (region == 'west' && panels.expandWest){
			if (panels.west.panel('options').onBeforeExpand.call(panels.west) == false) return;
			
			panels.expandWest.panel('close');
			panels.west.panel('panel').stop(true,true);
			panels.west.panel('open').panel('resize', {left: -panels.west.panel('options').width});
			panels.west.panel('panel').animate({
				left: 0
			}, function(){
				setSize(container);
				panels.west.panel('options').onExpand.call(panels.west);
			});
		} else if (region == 'north' && panels.expandNorth){
			if (panels.north.panel('options').onBeforeExpand.call(panels.north) == false) return;
			
			panels.expandNorth.panel('close');
			panels.north.panel('panel').stop(true,true);
			panels.north.panel('open').panel('resize', {top:-panels.north.panel('options').height});
			panels.north.panel('panel').animate({top:0}, function(){
				setSize(container);
				panels.north.panel('options').onExpand.call(panels.north);
			});
		} else if (region == 'south' && panels.expandSouth){
			if (panels.south.panel('options').onBeforeExpand.call(panels.south) == false) return;
			
			panels.expandSouth.panel('close');
			panels.south.panel('panel').stop(true,true);
			panels.south.panel('open').panel('resize', {top:cc.height()});
			panels.south.panel('panel').animate({top:cc.height()-panels.south.panel('options').height}, function(){
				setSize(container);
				panels.south.panel('options').onExpand.call(panels.south);
			});
		}
	}
	
	function bindEvents(container){
		var panels = $.data(container, 'layout').panels;
		var cc = $(container);
		
		// bind east panel events
		if (panels.east.length){
			panels.east.panel('panel').bind('mouseover','east',collapsePanel);
		}
		
		// bind west panel events
		if (panels.west.length){
			panels.west.panel('panel').bind('mouseover','west',collapsePanel);
		}
		
		// bind north panel events
		if (panels.north.length){
			panels.north.panel('panel').bind('mouseover','north',collapsePanel);
		}
		
		// bind south panel events
		if (panels.south.length){
			panels.south.panel('panel').bind('mouseover','south',collapsePanel);
		}
		
		panels.center.panel('panel').bind('mouseover','center',collapsePanel);
		
		function collapsePanel(e){
			if (resizing == true) return;
			
			if (e.data != 'east' && isVisible(panels.east) && isVisible(panels.expandEast)){
				panels.east.panel('panel').animate({left:cc.width()}, function(){
					panels.east.panel('close');
				});
			}
			if (e.data != 'west' && isVisible(panels.west) && isVisible(panels.expandWest)){
				panels.west.panel('panel').animate({left:-panels.west.panel('options').width}, function(){
					panels.west.panel('close');
				});
			}
			if (e.data != 'north' && isVisible(panels.north) && isVisible(panels.expandNorth)){
				panels.north.panel('panel').animate({top:-panels.north.panel('options').height}, function(){
					panels.north.panel('close');
				});
			}
			if (e.data != 'south' && isVisible(panels.south) && isVisible(panels.expandSouth)){
				panels.south.panel('panel').animate({top:cc.height()}, function(){
					panels.south.panel('close');
				});
			}
			return false;
		}
		
	}
	
	function isVisible(pp){
		if (!pp) return false;
		if (pp.length){
			return pp.panel('panel').is(':visible');
		} else {
			return false;
		}
	}
	
	$.fn._layout = function(options, param){
		if (typeof options == 'string'){
			switch(options){
			case 'panel':
				if($.data(this[0], 'layout') == null){
					$(this).layout();
				}
				return $.data(this[0], 'layout').panels[param];
			case 'collapse':
				return this.each(function(){
					collapsePanel(this, param);
				});
			case 'expand':
				return this.each(function(){
					expandPanel(this, param);
				});
			}
		}
		
		return this.each(function(){
			var state = $.data(this, 'layout');
			if (!state){
				var opts = $.extend({}, {
					fit: $(this).attr('fit') == 'true'
				});
				$.data(this, 'layout', {
					options: opts,
					panels: init(this)
				});
				
				bindEvents(this);
			}
			setSize(this);
		});
		
	};
	
	$.fn.layout = function(){
		var olayoutWidget = new layoutWidget();
		olayoutWidget.init($(this));
		return olayoutWidget;
	};
	
	layoutWidget = function(){
		this.$ = null;
		
		this.init = function(jqueryObj){
			this.$ = jqueryObj;
		    jqueryObj._layout();
		},
		
		this.getPanel = function(region){
			return this.$._layout('panel',region);
		},
		this.collapse = function(region){
		     this.$._layout('collapse',region);
		},
		this.expand = function(region){
		     this.$._layout('expand',region);
		}
	};
	
	$.layoutInit = function(jqueryObj,json4Options){
		 jqueryObj._layout()
	};
	
	
	$.uiwidget.register("layout",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this)._layout(jsonOptions) ;
		});
	}) ;
	
})(jQuery);
