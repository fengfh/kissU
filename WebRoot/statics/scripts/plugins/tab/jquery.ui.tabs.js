/*
 * jQuery UI Tabs @VERSION
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 */
(function($) {

var tabId = 0,
	listId = 0;

$.widget("ui.__tabs", {
	options: {
		add: null,
		ajaxOptions: null,
		cache: false,
		cookie: null, // e.g. { expires: 7, path: '/', domain: 'jquery.com', secure: true }
		collapsible: false,
		disable: null,
		disabled: [],
		enable: null,
		event: 'click',
		fx: null, // e.g. { height: 'toggle', opacity: 'toggle', duration: 200 }
		idPrefix: 'ui-tabs-',
		load: null,
		panelTemplate: '<div></div>',
		remove: null,
		select: null,
		show: null,
		deleteLast:false,
		spinner: '<em>加载中&#8230;</em>',
		tabTemplate: '<li><a href="#{href}" tabId="#{tabId}">#{img}<span>#{label}</span></a></li>',
		closeTabTemplate:'<li><a href="#{href}" tabId="#{tabId}">#{img}<span>#{label}</span><b class="ui-icon ui-icon-close ui-tab-close"></b></a></li>'
	},
	_create: function() {
		var _tabTempalte =  '<li><a href="#{href}" tabId="#{tabId}">#{img}<span>#{label}</span></a></li>' ;
		var self = this ;
		
		if(this.options.closable){
			if( this.options.tabTemplate == _tabTempalte){
				this.options.tabTemplate = this.options.closeTabTemplate ;
			}
		}
		
		if(this.options.tabs){
			//构造html
			var html = [] ;
			
			//html.push("<div class='ttt'>") ;
			
			html.push('<div class="ui-carousel-prev ui-tab-span ui-state-hover"  style="display:none"><div class="ui-carousel-prev-icon"></div></div>') ;
			html.push('<div class="ui-carousel-next ui-tab-span ui-state-hover" style="display:none"><div class="ui-carousel-next-icon"></div></div>') ;
			html.push('<ul>') ;
		
			$(this.options.tabs).each( function(){
				var href = null ;
				var label = this.label ;
				if( this.content ){
					href = '#'+this.content ;
				}if( this.url ){
					if(this.iframe){
						href = '$'+this.url ;
					}else{
						href = this.url ;
					}
				} 
				
				var img = this.img?"<img src='"+this.img+"' class='ui-tab-img' align='absmiddle'></img>":"" ;
				
				var _html = self.options.tabTemplate
							.replace(/#\{href\}/g, href)
							.replace(/#\{label\}/g, label)
							.replace(/#\{img\}/g, img)
							.replace(/#\{tabId\}/g, this.id||"")
				
				html.push(_html) ;
				
				$('#'+this.content).hide() ;
			} ) ;
			
			html.push('</ul>') ;
			
			//html.push('</div>');
			
			//this.element.find("ul").remove();
			
			if(this.element.children(":first").get(0)){
				this.element.children(":first").before(html.join('')) ;
			}else
				this.element.append(html.join('')) ;

			var me = this ;
			$(this.options.tabs).each( function(){
				if(!this.content) return ;
				if( me.element.find('#'+this.content).get(0) )return ;
				me.element.append( $('#'+this.content).show()  ) ;
			} ) ;
		}

		this.element.find('.ui-icon-close').bind('click.tabs', function() {
			var index = $('li',self.element).index($(this).parents("li:first"));
			self.remove(index) ;
			return false ;
		});

		this._tabify(true);
		
		if(this.options.height && $.isFunction(this.options.height)){
			this.options.height = this.options.height() ;
		};
		
		if(this.options.height)this.element.find('.ui-tabs-panel').height(this.options.height) ;
		
		if(  this.options.carousel === false) return ;
		
		//if (!$.browser.webkit  ){
			this.element.carousel() ;//chrome bug， exclude  .find(".ttt").width(300)
			$(window).resize(function(){
				$.execResize("__tabResize",function(){
					self.element.carousel('rebuild') ;
				});
			});
		//}
	},

	_setOption: function(key, value) {
		if (key == 'selected') {
			if (this.options.collapsible && value == this.options.selected) {
				return;
			}
			this.select(value);
		}
		else {
			this.options[key] = value;
			this._tabify();
		}
	},

	_tabId: function(a) {
		if($(a).attr("tabId")){
			return $(a).attr("tabId") ;
		}
			
		return a.title && a.title.replace(/\s/g, '_').replace(/[^A-Za-z0-9\-_:\.]/g, '') ||
			this.options.idPrefix + (++tabId);
	},

	_sanitizeSelector: function(hash) {
		return hash.replace(/:/g, '\\:'); // we need this because an id may contain a ":"
	},

	_cookie: function() {
		var cookie = this.cookie || (this.cookie = this.options.cookie.name || 'ui-tabs-' + (++listId));
		return $.cookie.apply(null, [cookie].concat($.makeArray(arguments)));
	},

	_ui: function(tab, panel) {
		return {
			tab: tab,
			panel: panel,
			index: this.anchors.index(tab)
		};
	},

	_cleanup: function() {
		// restore all former loading tabs labels
		this.lis.filter('.ui-state-processing').removeClass('ui-state-processing')
				.find('span')//.find('span:data(label.tabs)')
				.each(function() {
					var el = $(this);
					el.html(el.data('label.tabs')).removeData('label.tabs');
				});
	},

	_tabify: function(init) {
		this.list = this.element.find('ol,ul').eq(0);
		this.lis = $('li:has(a[href])', this.list);
		this.anchors = this.lis.map(function() { return $('a', this)[0]; });
		this.panels = $([]);

		var self = this, o = this.options;

		var fragmentId = /^#.+/; // Safari 2 reports '#' for an empty hash
		this.anchors.each(function(i, a) {
			var href = $(a).attr('href');

			// For dynamically created HTML that contains a hash as href IE < 8 expands
			// such href to the full page url with hash and then misinterprets tab as ajax.
			// Same consideration applies for an added tab with a fragment identifier
			// since a[href=#fragment-identifier] does unexpectedly not match.
			// Thus normalize href attribute...
			var hrefBase = href.split('#')[0], baseEl;
	
			if (hrefBase && (hrefBase === location.toString().split('#')[0] ||
					(baseEl = $('base')[0]) && hrefBase === baseEl.href)) {
				href = a.hash;
				a.href = href;
			}

			// inline tab
			if (fragmentId.test(href)) {
				self.panels = self.panels.add(self._sanitizeSelector(href));
			}

			// remote tab
			else if (href != '#') { // prevent loading the page itself if href is just "#"
			
					$.data(a, 'href.tabs', href); // required for restore on destroy
	
					// TODO until #3808 is fixed strip fragment identifier from url
					// (IE fails to load from such url)
					$.data(a, 'load.tabs', href.replace(/#.*$/, '')); // mutable data
	
					var id = self._tabId(a);
					a.href = '#' + id;
					var $panel = $('#' + id);
					if (!$panel.length) {
						$panel = $(o.panelTemplate).attr('id', id).addClass('ui-tabs-panel ui-widget-content ui-corner-bottom')
							.insertAfter(self.panels[i - 1] || self.list);
						$panel.data('destroy.tabs', true);
					}
					self.panels = self.panels.add($panel);
				
			}
			// invalid tab href
			else {
				o.disabled.push(i);
			}
		});

		// initialization from scratch
		if (init) {

			// attach necessary classes for styling
			/*this.element.addClass('ui-tabs ui-widget ui-widget-content  ui-corner-all');
			this.list.addClass('nav nav-tabs ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header  ui-corner-all');
			this.lis.addClass('ui-state-default ui-corner-top');
			this.panels.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom');
			*/
			
			this.element.addClass('ui-tabs ui-widget ui-widget-content ui-corner-all');
			this.list.addClass('nav nav-tabs ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');
			this.lis.addClass('ui-state-default ui-corner-top');
			this.panels.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom');

			// Selected tab
			// use "selected" option or try to retrieve:
			// 1. from fragment identifier in url
			// 2. from cookie
			// 3. from selected class attribute on <li>
			if (o.selected === undefined) {
				if (location.hash) {
					this.anchors.each(function(i, a) {
						if (a.hash == location.hash) {
							o.selected = i;
							return false; // break
						}
					});
				}
				if (typeof o.selected != 'number' && o.cookie) {
					o.selected = parseInt(self._cookie(), 10);
				}
				if (typeof o.selected != 'number' && this.lis.filter('.ui-tabs-selected').length) {
					o.selected = this.lis.index(this.lis.filter('.ui-tabs-selected'));
				}
				o.selected = o.selected || (this.lis.length ? 0 : -1);
			}
			else if (o.selected === null) { // usage of null is deprecated, TODO remove in next release
				o.selected = -1;
			}

			// sanity check - default to first tab...
			o.selected = ((o.selected >= 0 && this.anchors[o.selected]) || o.selected < 0) ? o.selected : 0;

			// Take disabling tabs via class attribute from HTML
			// into account and update option properly.
			// A selected tab cannot become disabled.
			o.disabled = $.unique(o.disabled.concat(
				$.map(this.lis.filter('.ui-state-disabled'),
					function(n, i) { return self.lis.index(n); } )
			)).sort();

			if ($.inArray(o.selected, o.disabled) != -1) {
				o.disabled.splice($.inArray(o.selected, o.disabled), 1);
			}

			// highlight selected tab
			this.panels.addClass('ui-tabs-hide').css('display','none');
			this.lis.removeClass('ui-tabs-selected ui-state-active');
			if (o.selected >= 0 && this.anchors.length) { // check for length avoids error when initializing empty list
				this.panels.eq(o.selected).removeClass('ui-tabs-hide').css('display','block');
				this.lis.eq(o.selected).addClass('ui-tabs-selected ui-state-active');
			
				// seems to be expected behavior that the show callback is fired
				self.element.queue("tabs", function() {
					self._trigger('show', null, self._ui(self.anchors[o.selected], self.panels[o.selected]));
				});
				
				this.load(o.selected);
			}

			// clean up to avoid memory leaks in certain versions of IE 6
			$(window).bind('unload', function() {
				self.lis.add(self.anchors).unbind('.tabs');
				self.lis = self.anchors = self.panels = null;
			});

		}
		// update selected after add/remove
		else {
			o.selected = this.lis.index(this.lis.filter('.ui-tabs-selected'));
		}

		// update collapsible
		this.element[o.collapsible ? 'addClass' : 'removeClass']('ui-tabs-collapsible');

		// set or update cookie after init and add/remove respectively
		if (o.cookie) {
			this._cookie(o.selected, o.cookie);
		}

		// disable tabs
		for (var i = 0, li; (li = this.lis[i]); i++) {
			$(li)[$.inArray(i, o.disabled) != -1 &&
				!$(li).hasClass('ui-tabs-selected') ? 'addClass' : 'removeClass']('ui-state-disabled');
		}

		// reset cache if switching from cached to not cached
		if (o.cache === false) {
			this.anchors.removeData('cache.tabs');
		}

		// remove all handlers before, tabify may run on existing tabs after add or option change
		this.lis.add(this.anchors).unbind('.tabs');

		if (o.event != 'mouseover') {
			var addState = function(state, el) {
				if (el.is(':not(.ui-state-disabled)')) {
					el.addClass('ui-state-' + state);
				}
			};
			var removeState = function(state, el) {
				el.removeClass('ui-state-' + state);
			};
			this.lis.bind('mouseover.tabs', function() {
				addState('hover', $(this));
			});
			this.lis.bind('mouseout.tabs', function() {
				removeState('hover', $(this));
			});
			this.anchors.bind('focus.tabs', function() {
				addState('focus', $(this).closest('li'));
			});
			this.anchors.bind('blur.tabs', function() {
				removeState('focus', $(this).closest('li'));
			});
		}

		// set up animations
		var hideFx, showFx;
		if (o.fx) {
			if ($.isArray(o.fx)) {
				hideFx = o.fx[0];
				showFx = o.fx[1];
			}
			else {
				hideFx = showFx = o.fx;
			}
		}

		// Reset certain styles left over from animation
		// and prevent IE's ClearType bug...
		function resetStyle($el, fx) {
			$el.css({ display: '' });
			if (!$.support.opacity && fx.opacity) {
				$el[0].style.removeAttribute('filter');
			}
		}

		// Show a tab...
		var showTab = showFx ?
			function(clicked, $show) {
				$(clicked).closest('li').addClass('ui-tabs-selected ui-state-active');
				$show.hide().removeClass('ui-tabs-hide').css('display','block') // avoid flicker that way
					.animate(showFx, showFx.duration || 'normal', function() {
						resetStyle($show, showFx);
						self._trigger('show', null, self._ui(clicked, $show[0]));
					});
			} :
			function(clicked, $show) {
				$(clicked).closest('li').addClass('ui-tabs-selected ui-state-active');
				$show.removeClass('ui-tabs-hide').css('display','block');
				self._trigger('show', null, self._ui(clicked, $show[0]));
			};

		// Hide a tab, $show is optional...
		var hideTab = hideFx ?
			function(clicked, $hide) {
				$hide.animate(hideFx, hideFx.duration || 'normal', function() {
					self.lis.removeClass('ui-tabs-selected ui-state-active');
					$hide.addClass('ui-tabs-hide').css('display','none');
					resetStyle($hide, hideFx);
					self.element.dequeue("tabs");
				});
			} :
			function(clicked, $hide, $show) {
				self.lis.removeClass('ui-tabs-selected ui-state-active');
				$hide.addClass('ui-tabs-hide').css('display','none');
				self.element.dequeue("tabs");
			};

		// attach tab event handler, unbind to avoid duplicates from former tabifying...
		this.anchors.bind(o.event + '.tabs', function(event) {
			/*if( $(event.srcElement).hasClass("ui-tab-close") ){
				 $(event.srcElement).click();
				return ;
			}*/
			
			var el = this, $li = $(this).closest('li'), $hide = self.panels.filter(':not(.ui-tabs-hide)'),
					$show = $(self._sanitizeSelector(this.hash));
		
			// If tab is already selected and not collapsible or tab disabled or
			// or is already loading or click callback returns false stop here.
			// Check if click handler returns false last so that it is not executed
			// for a disabled or loading tab!
			if (($li.hasClass('ui-tabs-selected') && !o.collapsible) ||
				$li.hasClass('ui-state-disabled') ||
				$li.hasClass('ui-state-processing') ||
				self._trigger('select', null, self._ui(this, $show[0])) === false) {
					this.blur();
					return false;
				}

			o.selected = self.anchors.index(this);

			self.abort();

			// if tab may be closed
			if (o.collapsible) {
				if ($li.hasClass('ui-tabs-selected')) {
					o.selected = -1;

					if (o.cookie) {
						self._cookie(o.selected, o.cookie);
					}

					self.element.queue("tabs", function() {
						hideTab(el, $hide);
					}).dequeue("tabs");
					
					this.blur();
					return false;
				}
				else if (!$hide.length) {
					if (o.cookie) {
						self._cookie(o.selected, o.cookie);
					}
					
					self.element.queue("tabs", function() {
						showTab(el, $show);
					});

					self.load(self.anchors.index(this)); // TODO make passing in node possible, see also http://dev.jqueryui.com/ticket/3171
					
					this.blur();
					return false;
				}
			}

			if (o.cookie) {
				self._cookie(o.selected, o.cookie);
			}

			// show new tab
			
			if ($show.length) {
				if ($hide.length) {
					self.element.queue("tabs", function() {
						hideTab(el, $hide);
					});
				}
				self.element.queue("tabs", function() {
					showTab(el, $show);
				});
				
				self.load(self.anchors.index(this));
			}
			else {
				throw 'jQuery UI Tabs: Mismatching fragment identifier.';
			}

			// Prevent IE from keeping other link focussed when using the back button
			// and remove dotted border from clicked link. This is controlled via CSS
			// in modern browsers; blur() removes focus from address bar in Firefox
			// which can become a usability and annoying problem with tabs('rotate').
			if ($.browser.msie) {
				this.blur();
			}

		});

		// disable click in any case
		this.anchors.bind('click.tabs', function(){return false;});

		if ( this.lis.length == 1 ){ // 如果只存在一个tab,则隐藏最后一个tab的删除按钮
			if(!o.deleteLast)this.lis.parent().find('.ui-tab-close').hide() ;
		}
		
	},

	destroy: function() {
		var o = this.options;

		this.abort();
		
		this.element.unbind('.tabs')
			.removeClass('ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible')
			.removeData('tabs');

		this.list.removeClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');

		this.anchors.each(function() {
			var href = $.data(this, 'href.tabs');
			if (href) {
				this.href = href;
			}
			var $this = $(this).unbind('.tabs');
			$.each(['href', 'load', 'cache'], function(i, prefix) {
				$this.removeData(prefix + '.tabs');
			});
		});

		this.lis.unbind('.tabs').add(this.panels).each(function() {
			if ($.data(this, 'destroy.tabs')) {
				$(this).remove();
			}
			else {
				$(this).removeClass([
					'ui-state-default',
					'ui-corner-top',
					'ui-tabs-selected',
					'ui-state-active',
					'ui-state-hover',
					'ui-state-focus',
					'ui-state-disabled',
					'ui-tabs-panel',
					'ui-widget-content',
					'ui-corner-bottom',
					'ui-tabs-hide'
				].join(' '));
			}
		});

		if (o.cookie) {
			this._cookie(null, o.cookie);
		}

		return this;
	},

	add: function(params) {//url, label,panel, index , img
		var url = params.url , label = params.label ,panel = params.panel ,index = params.index ,img = params.img ;
		if( params.iframe && url ){
			var first = ($.trim(url)).substring(0,1) ;
			if(first != '$') url = '$'+url ; 
		}
		
		if (index === undefined) {
			index = this.anchors.length; // append by default
		}

		var _img = img?"<img src='"+img+"' class='ui-tab-img' align='absmiddle'></img>":"" ;
		
		var self = this, o = this.options,
			$li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label).replace(/#\{img\}/g, _img).replace(/#\{tabId\}/g, (params.id||""))),
			id = (url&&!url.indexOf('#')) ? url.replace('#', '') : this._tabId($('a', $li)[0]);
		
		if( url ){
			$li.find("a").attr("href",url);
			url = params.url = (url&&!url.indexOf('#'))?url:"#"+id ;
		}else{
			url = params.url = (url&&!url.indexOf('#'))?url:"#"+id ;
			$li.find("a").attr("href",url);
		}
		
		$li.addClass('ui-state-default ui-corner-top').data('destroy.tabs', true);

		// try to find an existing element before creating a new one
		var $panel = $('#' + id);
		if (!$panel.length) {
			$panel = $(o.panelTemplate).attr('id', id).data('destroy.tabs', true);
		}
		$panel.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide').css('display','none');
		
		if(this.options.height && $.isFunction(this.options.height)){
			this.options.height = this.options.height() ;
		};
		
		if(this.options.height){
			$panel.height( this.options.height ) ;
		}

		if (index >= this.lis.length) {
			$li.appendTo(this.list);
			//if ($.browser.webkit){
			//	$panel.appendTo($( this.list[0].parentNode) );
			//}else
			$panel.appendTo($( this.list[0].parentNode.parentNode) );//.parentNode
		}else {
			$li.insertBefore(this.lis[index]);
			$panel.insertBefore(this.panels[index]);
		}

		o.disabled = $.map(o.disabled,
			function(n, i) { return n >= index ? ++n : n; });

		this._tabify();

		if (this.anchors.length == 1) { // after tabify
			o.selected = 0;
			$li.addClass('ui-tabs-selected ui-state-active');
			$panel.removeClass('ui-tabs-hide').css('display','block');
			this.element.queue("tabs", function() {
				self._trigger('show', null, self._ui(self.anchors[0], self.panels[0]));
			});
				
			this.load(0);
		}
		
		//删除完成 
		if ( this.lis.length == 2 ){ // 如果只存在一个tab,则隐藏最后一个tab的删除按钮
			this.lis.parent().find('.ui-tab-close').show() ;
		}
		
		$panel.append(panel) ;
		
		
		// callback
		this._trigger('add', null, this._ui(this.anchors[index], this.panels[index]));
		
		self.element.find('.ui-icon-close').unbind("click.tabs").bind('click.tabs', function() {
			var index = $('li',self.element).index($(this).parents("li:first"));
			self.remove(index) ;
			return false ;
		});
		
		self.element.carousel('rebuild') ;

		
		return this;
	},

	remove: function(index) {
		index = this.getIndex(index);
		if( this.options.tabClosing && typeof(this.options.tabClosing)=='string'){
			this.options.tabClosing = eval(this.options.tabClosing) ;
		}
		
		if( this.options.tabClosed && typeof(this.options.tabClosed)=='string'){
			this.options.tabClosed = eval(this.options.tabClosed) ;
		}
	
		//最后一个tab不能删除
		var rb = this._trigger('tabClosing', null, this._ui(this.lis.eq(index).find('a')[0], this.panels.eq(index))) ;
		if(!rb) return ;
		
		var o = this.options, $li = this.lis.eq(index).remove(),
			$panel = this.panels.eq(index).remove();
		
		// If selected tab was removed focus tab to the right or
		// in case the last tab was removed the tab to the left.
		if ($li.hasClass('ui-tabs-selected') && this.anchors.length > 1) {
			this.select(index + (index + 1 < this.anchors.length ? 1 : -1));
		}

		o.disabled = $.map($.grep(o.disabled, function(n, i) { return n != index; }),
			function(n, i) { return n >= index ? --n : n; });

		this._tabify();
		
		//删除完成 
		if ( this.lis.length == 1 ){ // 如果只存在一个tab,则隐藏最后一个tab的删除按钮
			if(!o.deleteLast)this.lis.parent().find('.ui-tab-close').hide() ;
		}
		
		//this.element.carousel('rebuild') ;

		// callback
		this._trigger('remove', null, this._ui($li.find('a')[0], $panel[0]));
		this._trigger('tabClosed', null, this._ui($li.find('a')[0], $panel[0]));
		return this;
	},

	enable: function(index) {
		index = this.getIndex(index);
		var o = this.options;
		if ($.inArray(index, o.disabled) == -1) {
			return;
		}

		this.lis.eq(index).removeClass('ui-state-disabled');
		o.disabled = $.grep(o.disabled, function(n, i) { return n != index; });

		// callback
		this._trigger('enable', null, this._ui(this.anchors[index], this.panels[index]));
		return this;
	},

	disable: function(index) {
		index = this.getIndex(index);
		var self = this, o = this.options;
		//if (index != o.selected) { // cannot disable already selected tab
			this.lis.eq(index).addClass('ui-state-disabled');

			o.disabled.push(index);
			o.disabled.sort();
			
			if(index == o.selected){
				var _i = 0 ;
				if(index > 0 )_i = index-1  ;
				else _i = index+1 ;
				this.anchors.eq(_i).trigger(this.options.event + '.tabs');
			}

			// callback
			this._trigger('disable', null, this._ui(this.anchors[index], this.panels[index]));
		//}

		return this;
	},
	
	hide: function(index){
		index = this.getIndex(index);
		var self = this, o = this.options;
		if (index != o.selected) { // cannot disable already selected tab
			this.lis.eq(index).hide();
			this.panels.eq(index).hide() ;
			// callback
			this._trigger('hide', null, this._ui(this.anchors[index], this.panels[index]));
		}

		return this;
	},
	show: function(index){
		index = this.getIndex(index);
		var self = this, o = this.options;
		if (index != o.selected) { // cannot disable already selected tab
			this.lis.eq(index).show();
			this.panels.eq(index).show() ;
			// callback
			this._trigger('show', null, this._ui(this.anchors[index], this.panels[index]));
		}
		return this;
	},
	getIndex:function(index){
		var t = index ;
		
		if( !isNaN(index) ){
			index = parseInt(index);
			if(index === null)
				index = -1 ;
		}else if (typeof index == 'string') {
			index = this.anchors.index(this.anchors.filter("[tabId='" + index + "']"));

			if(index >= 0 ){
				//do nothing
			}else {
				index = this.anchors.index(this.anchors.filter("[href$='" + t + "']"));
				if(index === 0) ;else if(!index) index = t ;
			}
		}
		return index ;
	},

	select: function(index) {
		
		index = this.getIndex(index);
		if (index == -1 && this.options.collapsible) {
			index = this.options.selected;
		}

		this.anchors.eq(index).trigger(this.options.event + '.tabs');
		return this;
	},
	active: function(index){
		index = this.getIndex(index);
		this.select( index ) ;
	},

	load: function(index) {
		index = this.getIndex(index);
		var self = this, o = this.options, a = this.anchors.eq(index)[0], url = $.data(a, 'load.tabs');

		$(a.hash).show() ;
		
		this.abort();

		// not remote or from cache
		if (!url || this.element.queue("tabs").length !== 0 && $.data(a, 'cache.tabs')) {
			this.element.dequeue("tabs");
			return;
		}

		// load remote from here on
		this.lis.eq(index).addClass('ui-state-processing');

		if (o.spinner) {
			var span = $('span', a);
			span.data('label.tabs', span.html()).html(o.spinner);
		}
		if(url.indexOf('$')!=-1){//iframe load
			url = url.split('$')[1] ;
			if (o.cache) {
				$.data(a, 'cache.tabs', true); 
			}
			if(this.options.height && $.isFunction(this.options.height)){
				this.options.height = this.options.height() ;
			};
			$(this._sanitizeSelector(a.hash)).html("<iframe frameborder=0 height='"+this.options.height+"' width=100% src='"+url+"'></iframe>");
			this._cleanup();
		}else  this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
			url: url,
			success: function(r, s) {
				$(self._sanitizeSelector(a.hash)).html(r);

				// take care of tab labels
				self._cleanup();

				if (o.cache) {
					$.data(a, 'cache.tabs', true); // if loaded once do not load them again
				}
				// callbacks
				self._trigger('load', null, self._ui(self.anchors[index], self.panels[index]));
				try {
					o.ajaxOptions.success(r, s);
				}
				catch (e) {}
			},
			error: function(xhr, s, e) {
				// take care of tab labels
				self._cleanup();

				// callbacks
				self._trigger('load', null, self._ui(self.anchors[index], self.panels[index]));
				try {
					o.ajaxOptions.error(xhr, s, index, a);
				}
				catch (e) {}
			}
		}));

		// last, so that load event is fired before show...
		self.element.dequeue("tabs");
		
		return this;
	},

	abort: function() {
		// stop possibly running animations
		this.element.queue([]);
		this.panels.stop(false, true);

		// "tabs" queue must not contain more than two elements,
		// which are the callbacks for the latest clicked tab...
		this.element.queue("tabs", this.element.queue("tabs").splice(-2, 2));

		// terminate pending requests from other tabs
		if (this.xhr) {
			this.xhr.abort();
			delete this.xhr;
		}

		// take care of tab labels
		this._cleanup();
		return this;
	},
	
	getPanel: function(index){
		index = this.getIndex(index); 
		return this.panels.eq(index) ;
	},

	url: function(index, url) {
		index = this.getIndex(index);

		this.anchors.eq(index).removeData('cache.tabs').data('load.tabs', url);
		return this;
	},

	length: function() {
		return this.anchors.length;
	}

});

$.extend($.ui.__tabs, {
	version: '@VERSION'
});

/*
 * Tabs Extensions
 */

/*
 * Rotate
 */
$.extend($.ui.__tabs.prototype, {
	rotation: null,
	rotate: function(ms, continuing) {

		var self = this, o = this.options;
		
		var rotate = self._rotate || (self._rotate = function(e) {
			clearTimeout(self.rotation);
			self.rotation = setTimeout(function() {
				var t = o.selected;
				self.select( ++t < self.anchors.length ? t : 0 );
			}, ms);
			
			if (e) {
				e.stopPropagation();
			}
		});
		
		var stop = self._unrotate || (self._unrotate = !continuing ?
			function(e) {
				if (e.clientX) { // in case of a true click
					self.rotate(null);
				}
			} :
			function(e) {
				t = o.selected;
				rotate();
			});

		// start rotation
		if (ms) {
			this.element.bind('tabsshow', rotate);
			this.anchors.bind(o.event + '.tabs', stop);
			rotate();
		}
		// stop rotation
		else {
			clearTimeout(self.rotation);
			this.element.unbind('tabsshow', rotate);
			this.anchors.unbind(o.event + '.tabs', stop);
			delete this._rotate;
			delete this._unrotate;
		}

		return this;
	}
});


	$.uiwidget.register("tab",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this).__tabs(jsonOptions) ;
		});
	}) ;

})(jQuery);

/**
 * jQuery UI Carousel 1.0.2
 * (based on jCarouselLite 1.0.1)
 */
(function($) {

$.widget('ui.carousel', {
	options:{
		auto: null,
        speed: 200,
        easing: null,
        orientation: "horizontal",
        visible: 3,
        start: 0,
        scroll: 1,
        beforeStart: function(visibleBefore, visibleAfter) { },
        afterEnd: function(visibleAfter, visibleBefore) { }
	},
    // Initialize the carousel. Called on startup by jQuery UI.
    _create: function() {
    	
        var o = this.options,
            e = this.element;

        this.orientation = this.options.orientation == 'vertical' ? 'vertical' : 'horizontal';
        this.running = false;
        this.curr = o.start;
        this._detectNavigation();

        e.addClass("ui-carousel" +
                " ui-carousel-" + this.orientation +
                " ui-widget" +
                " ui-widget-content" +
                " ui-corner-all" +
                " ui-helper-clearfix");

        this.slide = $(">ul, .ui-carousel-clip>ul", e)
            .addClass("ui-carousel-slide");
        this.clip = $(".ui-carousel-clip", e);

        // Auto add clip wrapper if missing.
        if (this.clip.size() === 0) {
            this.slide.wrap('<div class="ui-carousel-clip"></div>');
            this.clip = $(".ui-carousel-clip", e);
        }

        // Build internals. This is the same as when rebuild and we want to
        // make sure things are made visible in case they where hidden during
        // load.
        this.rebuild(true);
        
        // Start auto rotation.
        this.autoReset();

    },

    // Rebuild the carousel's internals values.
    // This is useful for displays that may be built dynamically.
    rebuild: function(show) {
    	
        var o = this.options;
        
        // Reset the position back into a safe location.
        // @todo - It's possible that itemLength isn't set.
        if (this.curr >= this.itemLength) {
            this.curr -= this.itemLength;
        }
        else if (this.curr < 0) {
            this.curr += this.itemLength;
        }

        // Make sure buffers are clear before we rebuild them.
        this.slide.children(".ui-carousel-buffer").remove();
        this.offset = 0;
        // Build an updated list of items.

        this.li = this.slide.children().addClass("ui-carousel-item");
		
        // Update our item length.
        this.itemLength = this.li.size() - (2 * this.offset);

        // Now that everything is loaded, make sure things are visible. This
        // should help developers mitigate flashing content on slower DOM loads.
        if (show) {
            this.element.show();
        }
        // Refresh/setup all the item widths.
        this.refresh();

    },

    // Move the carousel backwards one iteration.
    prev: function() {
        return this._go(this.curr - this.options.scroll);
    },

    // Move the carousel forward one iteration.
    next: function() {
        return this._go(this.curr + this.options.scroll);
    },

    // Returns a list of visible items.
    // @param from
    // Starting place to get visible items from. Default to current item.
    visible: function(from) {
        if (from === undefined) {
            from = this.curr;
        }
        return this.slide.children().slice(from, from + this.options.visible);
    },

    // Returns the offset of the first visible carousel item.
    at: function() {
        return this.curr;
    },

    // Bring a carousel item into view.
    view: function(item) {
        var o = this.options,
            curr = this.curr;
        if (item > curr && item <= curr + o.visible) {
            return;
        }
        var s = o.scroll,
            next = 0;
        if (item <= curr) {
            next = curr - (Math.floor((curr - item) / s) * s + s);
        }
        else {
            next = curr + (Math.floor((item - curr) / s) * s - s);
        }
        return this._go(next);
    },

    // Reset the carousel to the initial position.
    reset: function() {
        var o = this.options;
        if (this.curr == o.start) {
            return;
        }
        this.set(o.start);
    },

    // Refresh measurements.
    refresh: function() {
        var o = this.options,
            vert = (this.orientation != "horizontal"),
            sizeCss = vert ? "height" : "width";

        this.animCss = vert ? "top" : "left";

        // reset css attributes before detecting ul measurements
        this.li.css({width: '', height: ''});

        // Store the visible size for the scoll dimension. This is the
        // full li size(including margin) and is used for slider placement.
        this.liSize = vert ? this.li.outerHeight(true) : this.li.outerWidth(true);
		
        // Fix the the width so everything looks correct.
        // this.li.css({height: this.li.height()});//width: this.li.width(), 

        // make width full length of items.
        var me = this ;
        var countWidth = 0 ;
        this.li.parent().children().each( function(){
        	if( sizeCss == 'width' ){
        		countWidth += $(this).outerWidth(true) ;
        		me.liSize = Math.max( me.liSize , $(this).outerWidth(true) ) ;
        	} 
        } ) ;
        
        var visibleWidth = this.li.parent().parent().parent().width() ;//可见宽度
 
        this.slide.css( sizeCss, Math.max( this.liSize * (this.itemLength + 2 * this.offset),visibleWidth));
        /*this.clip.css(sizeCss, visibleWidth ) ;*/
        if( countWidth > visibleWidth ){
        	//do nothing
        }else{
        	this.curr = 0 ;
        }
        
        // Make sure we're in the right location.
        this.set(this.curr);
        this._updateNav();
    },

    autoReset: function() {
        var o = this.options;

        // If we need to, clear the old timer.
        if (typeof this.autoTimer !== 'undefined') {
            clearTimeout(this.autoTimer);
            delete this.autoTimer;
        }

        if (o.auto) {
            // Calculate the rotation delay.
            var delay = o.auto,
                self = this;

            // Start a new interval timer.
            this.autoTimer = setTimeout(function() {
                self.next();
            }, delay);
        }
    },

    auto: function(time) {
        this.options.auto = time;
        this.autoReset();
    },

    // Helper function that animates the carousel to a point on the carousel.
    // @param to
    //   The integer offset of the element. Between 0 and this.itemLength
    _go: function(to) {
        var o = this.options,
            v = o.visible;

        // This is a little redundant now because of the state-disabled stuff but necessary since this
        // can be called indirectly though prev and next using the UI API.
        if (!o.circular) {
            // If non-circular and to points to first or last, we just return.
            if (to > this.itemLength - v) {
                to = this.itemLength - v;
            }
            if (to < 0) {
                to = 0;
            }
        }

        // Make sure we actually want to go somewhere.
        if (!(this.running || to == this.curr)) {
        	
            var prev = this.curr,
                e = this.element,
                l = this.itemLength,
                b = this.offset, // buffer size.
                self = this;
            this.running = true;
           
            this.curr = to; // reset internal pointer.
            to += b;        // adjust to with offset(buffer size).

            o.beforeStart.call(e, this.visible(this.curr), this.visible(to));
            
            var maxLeft = Math.min( this.element.find("ul:first").outerWidth(true) - this.element.width()
            	,this.element.find(".ui-carousel-clip:first").outerWidth(true) - this.element.find(".ui-carousel-clip:first").offset().left
            	,to * this.liSize) ;
            
            this.slide.animate(
                this.animCss == "left" ?
                    { left: - maxLeft  } : //-(maxLeft - parentLeft)
                    { top: -(to * this.liSize) },
                o.speed, o.easing,
                function() {
                    self.running = false;
                    self._updateNav();
                    self.autoReset();
                    o.afterEnd.call(e, self.visible(to), self.visible(prev));
                }
            );
            return true;
        }
        return false;
    },

    // Directly set the location of the carousel instead of animating to a location.
    set: function(p) {
        // Set the internal pointer.
        this.curr = p;
        // make sure the slider is in the correct position.
        var pos = (p + this.offset) * this.liSize ;
       if( this.animCss == "left"){
       	 pos = Math.min( this.element.find("ul:first").outerWidth(true) - this.element.width() ,(p + this.offset) * this.liSize) ;
       }
        
       this.slide.css(this.animCss, -(pos + "px"));
    },

    // Update nav links, enabling/disabling as needed.
    _updateNav: function() {
        var o = this.options;
        if (!o.circular) {
        	var lastLi = this.li.parent().find('li:last') ;
        	if( lastLi.length ){
        		
	                
	            var parentLeft = this.li.parents(".ui-carousel-clip:first").offset().left ;
	            var liFirstLeft = this.li.parent().find('li:first').offset().left  ;
	           
	            //var prev = this.visible(this.curr - 1).length === 0 ;
	            var prev = parentLeft <= (liFirstLeft+5)  ;

	            // If the first element is visible, disable the previous button.
	            _setDisabled(this.nav.prev, prev);
	          
	            var nextWidth = this.li.parent().find('li:last').offset().left + this.li.parent().find('li:last').width() ;
	        	var conWidth  = this.li.parents(".ui-carousel-clip:first").offset().left+ this.li.parents(".ui-carousel-clip:first").width() ;
	        	
	            var next = nextWidth < conWidth ;//this.visible(this.curr + o.visible).length === 0;
	            // If the last element is visible or the carousel is small, disable the next button.
	            _setDisabled(this.nav.next, next);
        	}
        }
        this._detectNavigation('css') ;
    },

    // Automated detection and setup of navigation buttons.
    _detectNavigation: function(css) {
        if(css){
        	this.nav.prev.height(this.nav.next.parent().find('.ui-carousel-clip').height()-2).css(
        		{
        			top:2+"px"
        		}).hide()  ;
        	this.nav.next.height(this.nav.next.parent().find('.ui-carousel-clip').height()-2)
        		.css({top:2+"px"})
        		.hide()  ;
        	
        	if(!this.nav.prev.hasClass('ui-state-disabled')){
        		this.nav.prev.show() ;
        	}
        	
        	if(!this.nav.next.hasClass('ui-state-disabled')){
        		this.nav.next.show() ;
        	}
        }else{
        	var self = this,
            	class_p = " ui-icon-triangle-1-",
            	class_n = " ui-icon-triangle-1-";
	        if (this.orientation == "horizontal") {
	            class_p += "w";
	            class_n += "e";
	        }else {
	            class_p += "n";
	            class_n += "s";
	        }
	
	        this.nav = {};
	
	        this.nav.prev = $(".ui-carousel-prev", this.element)
	            //.addClass("ui-icon" + class_p)
	            .click(function(e) {
	                e.preventDefault();
	                if ($(this).not(".ui-state-disabled").length)
	                    self.prev();
	            }).hide();
	
	        this.nav.next = $(".ui-carousel-next", this.element)
	            //.addClass("ui-icon" + class_n)
	            .click(function(e) {
	                e.preventDefault();
	                if ($(this).not(".ui-state-disabled").length)
	                    self.next();
	            }).hide();
        }
    }
});

//Disable element using the jQuery UI disabled state class.
function _setDisabled(el, state) {
    if (state) {
        $(el).addClass('ui-state-disabled');
    }
    else {
        $(el).removeClass('ui-state-disabled');
    }
};

})(jQuery);

$.tabsInit = function(jqueryObj,json4Options){
	json4Options.tabs = new Array();
	jqueryObj.children().each(function(){
		var tabOption = [];
		var options = $(this).attr("options").replace(/'/g,"\"");
	    var jsonOption = $.json.decode(options);
	    json4Options.tabs.push(jsonOption);
	});
	jqueryObj.tabs(json4Options);
};

$.fn.tabs = function(json_obj){
		var otabsWidget = new tabsWidget();
		otabsWidget.init($(this),json_obj);
		return otabsWidget;
	};
	
	tabsWidget = function(){
		this.$ = null;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			if(json_obj != undefined){
				 this.$.__tabs(json_obj);
			}
		};
		
		this.add = function(json_obj){
			this.$.__tabs('add',json_obj);
		};
		
		this.destroy = function(){
			return this.$.__tabs('destroy');
		};
		
		this.disable = function(json_obj){
			if(json_obj == undefined){
				return this.$.__tabs('disable');
			}
			else{
				return this.$.__tabs('disable',json_obj.index||json_obj.id);
			}
		};
		
		this.enable = function(json_obj){
			if(json_obj == undefined){
				return this.$.__tabs('enable');
			}
			else{
				return this.$.__tabs('enable',json_obj.index||json_obj.id);
			}
		};
		
		this.show = function(json_obj){
			return this.$.__tabs('show',json_obj.index||json_obj.id);
		};
		
		this.hide = function(json_obj){
			return this.$.__tabs('hide',json_obj.index||json_obj.id);
		};
		
		/*this.enable = function(json_obj){
		    return this.$.__tabs('enable');
		};*/
		
		this.select = function(json_obj){
			return this.$.__tabs('select',json_obj.index||json_obj.id);
		};
		
		this.remove = function(json_obj){
			return this.$.__tabs('remove',json_obj.index||json_obj.id);
		};
		
		this.load = function(json_obj){
			return this.$.__tabs('load',json_obj.index||json_obj.id);
		};
		
		this.getSelectedId = function(){
			return this.$.__tabs().find(".ui-tabs-panel:not(.ui-tabs-hide)").attr("id") ;
		}
		
		this.getSelectedIndex = function(){
			return this.$.__tabs("option","selected")  ;
		}
		
		this.active = function(json_obj){
			return this.$.__tabs('active',json_obj.index||json_obj.id);
		};
		
		this.setUrl = function(json_obj){
			return this.$.__tabs('url',json_obj.index||json_obj.id,json_obj.url);
		};
		
		this.rename = function(json_obj){
			json_obj = json_obj||{};
			var index = this.$.__tabs("getIndex",json_obj.index||json_obj.id );
			var label = json_obj.label ;
			this.$.__tabs().find("li a",".ui-tabs-nav").get(index).innerHTML = label ;
			return this.$ ;
		};
		
		this.getLength = function(){
			return this.$.__tabs('length');
		};
	};

