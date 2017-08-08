var _arguments = jQuery.dialogAraguments() ;
var wizard = null ;
var flow_image_dir = "images" ;

(function($){
	$.fn.wizard = function(option){
		
		var wizard = this.data("wizard_data");
		if(wizard){
			return wizard;
		}
		
		//format steps
		var prevStepName = null ;
		var prevStep = null ;
		$(option.steps).each(function(index,step){
			if(prevStepName)step.prevStepName = prevStepName ;
			if(prevStep)prevStep.nextStepName = step.name ;
			prevStepName = step.name ;
			prevStep = step ;
		}) ;

		var wizard = new Wizard();
		//option.containerId = this.attr("id");
		wizard.init(option) ;
		this.data("wizard_data",wizard);
		return wizard;
	};


	/*
		构造函数参数说明：
		initObj:{
			containerId:整个页面容器编号
			flow_image_dir：图片文件夹路径
			isNodeNav:最上面的数字能否导航
		}
	
	*/
	
	window.getWizardContext = function(){
		return wizard.getWizardContext() ;
	}
	
	Wizard.prototype.getWizardContext = function(){
		var step = this.getActiveNode();
		var me = this ;
		return {
			getWizard: function(){
				return me ;
			},
			getParams: function(){
				return me.getParams() ;
			},
			addParam:function(key,value){
				me.getParams()[key] = value ;
			},
			getName:function(){
				return step.name ;//当前步骤名称
			},
			getNextStepName:function(){
				return me.nextStepName ;
			},
			getParam:function(key){
				return me.getParams()[key] ;
			}
		} ;
	}
	
	function Wizard() {
		var currentIndex = 0;
		var availableIndex = 0;
		var notice = ""; //向导步聚下方显示的提示信息
		var title = "";  //向导对话框显示的标题
	}
	
	Wizard.prototype.setNotice = function(Notice)
	{
		this.notice = Notice;
	}
	Wizard.prototype.setTitle = function(Title)
	{
		this.title = Title;
	}
	
	/* success  
	 danger,
	 error  
	 info*/
	Wizard.prototype.setMessage = function(message,type)
	{
		if(message){
			$(".wizard-message").html(message).addClass("alert alert-"+type) ; 
		}else{
			$(".wizard-message").empty().removeAttr("class").addClass("wizard-message") ;
		}
	}
	
	Wizard.prototype.block = function(options){
		if(this.useBlock){
			options = options||{} ;
			options.upRender = false ;
			
			var template = "" ;
			template = '<table style="vertical-align:middle;"><tbody><tr><td><div class="loading">' ;
			template += '</div></td><td>&nbsp;</td><td style="vertical-align:middle;"><nobr>' ;
			template += '<span class="ui-block-msg">'+options.message+'</span></nobr></td></tr></tbody></table>' ;
			
			if(options.message)options.message = template ;
			options.overlayCSS = {opacity:'.0',backgroundColor:'#CCC'} ;
			$.block(options);
		}
	}
	
	Wizard.prototype.unblock = function(){
		if(this.useBlock){
			$.unblock();
		}
	}
	
	Wizard.prototype.getParams = function(){
		return this.params;
	};
	
	Wizard.prototype.init = function (initObj) {
		this._options = initObj ;
		this.height = initObj.height || "800";
		this.width = initObj.width || "600";
		this.useBlock = typeof( initObj.useBlock)=='undefined' ? true : initObj.useBlock ;
		
		//节点图标是否导航
		this.useNavigate = typeof( initObj.useNavigate)=='undefined' ? true : initObj.useNavigate;
		
		//图片文件夹路径
		this.flow_image_dir = flow_image_dir ;
	
		//页面缓存（可以扩展）
		this.pageList = [];
		
		this.params = initObj.params||null ;
		
		//初始化流程节点
		if(initObj.steps){
			for(var i = 0;i < initObj.steps.length; i ++){
				this.addNode(initObj.steps[i]);
			}
		}
		
	};
	//添加流程节点对象
	/*
		nodeObj{
			indexId：导航的唯一标识
			text：导航条展示的标题名字
			title：导航标题说明
			url:导航对应的页面的URL
			action:节点事件
			nextStepName:下个节点的编号
			prevStepName：上个节点编号
		}
	*/
	Wizard.prototype.addNode = function (node) {
		if(!this.flowNodeList){//导航标题对象数组
			this.flowNodeList = new Array();
		}
		this.flowNodeList.push(node);
	};
	
	Wizard.prototype.start = function () {
		var steps = this.flowNodeList;
	
		if(steps && steps.length > 0){
			this.active(steps[0].name);
		}	
	}
	
	Wizard.prototype.active = function (name) {
		var step = this.getNode(name) ;
		
		this.currentIndex = step.index;
		this.toPage();
		this.drawFlowBar();	
		this.drawControlBar();
		var stepPage = null;
		var stepPages = $(".wizard-page")[0].children;
		for(i = 0; i < stepPages.length; i++){
			var f = stepPages[i];		
			if(f.id == name + "StepPage")
				f.style.display = "inline";
			else if(f.style.display != "none"){
				f.style.display = "none";
			}
		}	
	}
	
	Wizard.prototype.execEvent = function(eventName , activeStep ,type ){
		
		var toStepName = this.nextStepName ;
		if( toStepName ){
			if(type == "next" || type =="back"){
				toStepName = this.findAvailableNode(toStepName , type == "next").name ;
				this.nextStepName = toStepName ;
			}
		}
	
		if(eventName){
			try{
				toStepName = window[eventName]( this.getWizardContext() ) ;
			}catch(e){
				alert(e.message);
				toStepName = false ;
			}
		}
		
		if( toStepName === false ){
			//do nothing
		}else if(toStepName === true || toStepName ){
			this.block({ message:'跳转中...' }); 
			toStepName = toStepName===true?this.nextStepName:toStepName ;
			
			this.leaveSuccess() ;
			if(this.nextStepName)this.active(toStepName);
		}
		
		if(type=='complete'){
			$(document.body).dialogClose() ;
		}
	
		this.unblock();
	}
	
	
	//下一步
	Wizard.prototype.next = function () {
		var iframe = this.getActiveIframe();
		var node = this.getActiveNode();
		this.currentIframeId = node.name + "StepPage";
	
		this.nextStepName = node.nextStepName ;
	
		this.execEvent(node.onleave , node,"next" ) ;
	};
	
	//查找下一步或上一步
	Wizard.prototype.findAvailableNode = function (name, next) {
		var target = this.getNode(name);
		if(!target.hide)
			return target;
		else{//目标节点被禁用查找再下一步或更上一步
			if(next && target.nextStepName)
				return this.findAvailableNode(target.nextStepName, next);
			if(!next && target.prevStepName)
				return this.findAvailableNode(target.prevStepName, next);
		}
		return {} ;
	};
	
	//上一步
	Wizard.prototype.back = function () {
		var iframe = this.getActiveIframe();
		var node = this.getActiveNode();
		this.currentIframeId = node.name + "StepPage";
	
		this.nextStepName = node.prevStepName ; ;
	
		this.execEvent(node.onleave , node ,"back" ) ;
		
	};
	
	Wizard.prototype.cancel = function () {
		var iframe = this.getActiveIframe();
		var node = this.getActiveNode();
		this.currentIframeId = node.name + "StepPage";
		this.nextStepName = null ;
		this.execEvent(node.oncancel , node ,"cancel" ) ;
	};
	
	//指定到某个页面
	Wizard.prototype.goToPage = function (name) {
		var iframe = this.getActiveIframe();
		var node = this.getActiveNode();
		this.currentIframeId = node.name + "StepPage";
	
		this.nextStepName = name ;
		
		this.block({message:"\u8df3\u8f6c\u4e2d..."});
		
		this.execEvent(node.onleave , node , "goToPage" ) ;
	};
	
	Wizard.prototype.leaveSuccess = function(){
		this.setMessage(null) ;
	}
	
	//完成
	Wizard.prototype.complete = function () {
		var iframe = this.getActiveIframe();
		var node = this.getActiveNode();
		this.currentIframeId = node.name + "StepPage";
		this.nextStepName = null ;
		this.execEvent(node.onleave , node , "complete" ) ;
	};
	
	//获得流程中当前的节点
	Wizard.prototype.getActiveNode = function () {
		var index = this.getCurrentIndex();
		if(!index)
			index = 0;
		return this.flowNodeList[index];
	};
	
	//当前窗口
	Wizard.prototype.getActiveIframe = function () {
		var frames = $(".wizard-page")[0].children||[];
		
		for(i = 0; i < frames.length; i++){
			var f = frames[i];
			if(f.id == this.getActiveNode().name + "StepPage"){
				result = f;
				return f;
			}
		}
		return null;
	};
	
	//切换到指定页面
	Wizard.prototype.toPage = function () {
		var activeNode = this.getActiveNode();
		activeNode.visited = true;
		this.currentIframeId = activeNode.name + "StepPage";
		activeNode.selector.attr("id",this.currentIframeId) ;
		$(".wizard-page").append( activeNode.selector  );
	};
	
	
	//获取当前位置
	Wizard.prototype.getCurrentIndex = function () {
		return this.currentIndex;
	};
	
	//展示控制区的按钮
	Wizard.prototype.drawControlBar = function () {
		
		wizardObj = this;
		$(".wizard-control").empty();
		
		var activeNode = this.getActiveNode();
		//自定义按钮
		$(activeNode.options||[]).each(function(){
			var action = this.action;
			var btn = $("<button class='btn'>"+this.text+"</button>").appendTo(".wizard-control") ;
			if(action) btn.click(function(){
				wizardObj.execEvent(action , activeNode,"custom" ) ;
			}) ;
		}) ;
		
		//上一步按钮
		var lastIndex = activeNode.prevStepName;
		if(lastIndex != undefined && lastIndex != null && lastIndex != ''){
			$("<button id='last' class='btn btn-primary'><i class='icon-chevron-left icon-white'></i>上一步</button>")
				.appendTo(".wizard-control")
				.click(function(){
					wizardObj.back();
				});
		}
		
		//下一步按钮
		var nextIndex = this.getActiveNode().nextStepName;
		var nextStepText = this.getActiveNode().nextStepText||'下一步' ;
		if(nextIndex != undefined && nextIndex != null && nextIndex != ''){
			$("<button id='next' class='btn btn-primary'><i class='icon-chevron-right icon-white'></i>"+nextStepText+"</button>")
				.appendTo(".wizard-control")
				.click(function(){
					wizardObj.next();
					return false;
				});
		}
		
		if(this.getActiveNode().canComplete == 'yes' || nextIndex == undefined){//完成按钮
			$("<button id='complete' class='btn btn-primary'><i class='icon-ok icon-white'></i>完成</button>")
				.appendTo(".wizard-control") 
				.click(function(){
					wizardObj.complete();
					return false;
				});
		}
		
		$("<button id='close' class='btn'><i class='icon-remove'></i>关闭</button>")
			.appendTo(".wizard-control") 
			.click(function(){
				wizardObj.cancel();
				$(document.body).dialogClose() ;
				//window.close();
				return false;
			});
	};
	
	//展示最上面的流程图形
	Wizard.prototype.drawFlowBar = function () {
	
		var headerTitle = this.getActiveNode().title?this.getActiveNode().title:'';
		
		$(".wizard-flow-title").html( this._options.title ) ;
		//$(".wizard-flow-title-sub").html( headerTitle ) ;
		
		//append node
		$(".wizard-flow-items ul").empty() ;
		for(var i = 0; i < this.flowNodeList.length;i ++){
			this.flowNodeList[i].index = i;
			if(i == 0){
				this.flowNodeList[i].visited = true;
			}
			
			if(!this.flowNodeList[i].visited)
				this.flowNodeList[i].visited = false;
			
			if(this.flowNodeList[i].hide)
				continue;	
				
			this.drawNode(this.flowNodeList[i])  ;
		}
	};
	
	//展示最上面的流程图形各个节点
	Wizard.prototype.drawNode = function (flowNode) {
		wizardObj = this;
	
		var src = "" ;
		var currentNode = this.getActiveNode();
	
		var clzName = "" ;
		if(flowNode.index == 0){
			clzName = flowNode.name == currentNode.name?"wizard-first-step-actived":"wizard-first-step";
		}else if(flowNode.index < this.flowNodeList.length - 1){
			clzName = (flowNode.name == currentNode.name)?
					"wizard-step-actived":
					(flowNode.visited?"wizard-step-visited":"wizard-step") ;
		}else{
		   clzName = flowNode.name == currentNode.name?"wizard-last-step-actived":(flowNode.visited?"wizard-last-step-visited":"wizard-last-step") ;
		}
		
		var html = ["<li>"] ;
		html.push("<div class='wizard-step-node "+clzName+"'></div>") ;
		html.push("<div>"+flowNode.title+"</div>") ;
		html.push("</li>") ;
		
		var node = $(html.join("")).appendTo(".wizard-flow-items ul") ;
	
		if(this.useNavigate == true){
			if(this.isNodeNav == true){
				node.find(".wizard-step-node").click(function(){
					wizardObj.goToPage(flowNode.name);
				}) ;
			}else{
				if((flowNode.index != 0 && this.flowNodeList[flowNode.index - 1].visited) || flowNode.visited){
					node.find(".wizard-step-node").click(function(){
						wizardObj.goToPage(flowNode.name);
					}) ;
				}
			}
		}		
	};
	
	Wizard.prototype.hideStep = function (name, force) {
		var steps = this.flowNodeList;
		var node = this.getNode(name);
		if(!force && name == this.currentIndexId){
			alert('不能隐藏当前步骤');
			return false;
		}else{
			if(name == this.currentIndexId){
				var frame = document.getElementById(node.name + "Iframe");
				frame.style.display = true;
			}
		}
		if(!node.nextStepName){
			alert('不能隐藏流程最后一步');
			return false;
		}
		if(!node.prevStepName){
			alert('不能隐藏流程第一步');
			return false;
		}
		node.hide = true;
		this.drawFlowBar();
	};
	
	Wizard.prototype.getNode = function (name) {
		var steps = this.flowNodeList;
		for(var i = 0; i < steps.length; i++){
			var node = steps[i];
			if(node.name == name){
				return node;
			}
		}
		return null;
	};
	
	Wizard.prototype.displayStep = function (name) {
		var steps = this.flowNodeList;
		if(steps){
			for(var i = 0; i < steps.length; i++){
				var node = steps[i];
				if(steps[i].name == name){
					node.hide = false;
					break;
				}
			}
		}
		this.drawFlowBar();
	};
	
	Wizard.prototype.displayNext = function(display){
		this.displayButton('next', display);
	};
	Wizard.prototype.displayLast = function(display){
		this.displayButton('last', display);
	};
	Wizard.prototype.displayClose = function(display){
		this.displayButton('close', display);
	};
	Wizard.prototype.displayComplete = function(display){
		this.displayButton('complete', display);
	};
	Wizard.prototype.displayButton = function(buttonId, display){
		$("#"+buttonId).show() ;	
	};
	Wizard.prototype.hideNext = function(){
		this.hideButton('next');
	};
	Wizard.prototype.hideLast = function(){
		this.hideButton('last');
	};
	Wizard.prototype.hideClose = function(){
		this.hideButton('close');
	};
	Wizard.prototype.hideComplete = function(){
		this.hideButton('complete');
	};
	Wizard.prototype.hideButton = function(buttonId){
		$("#"+buttonId).hide() ;
	};
	Wizard.prototype.deleteNext = function(){
		this.deleteButton('next');
	};
	Wizard.prototype.deleteLast = function(){
		this.deleteButton('last');
	};
	Wizard.prototype.deleteClose = function(){
		this.deleteButton('close');
	};
	Wizard.prototype.deleteComplete = function(){
		this.deleteButton('complete');
	};
	Wizard.prototype.deleteButton = function(buttonId){
		$("#"+buttonId).remove() ;
	};
	Wizard.prototype.addButton = function(button){
		var wizard = this ;
		var action = button.action;
		var btn = $("<button id="+button.id+" class='btn'>"+this.text+"</button>").appendTo(".wizard-control") ;
		if(action) btn.click(function(){
			wizard.execEvent(action , activeNode,"custom" ) ;
		}) ;
	};
	
	/**
	 * 定义声明式向导
	 */
	$.uiwidget.register("wizard",function(selector){

		var pluginPath = $.utils.scriptPath("plugin");
		jQuery.attachFile(window,pluginPath+'wizard/jquery.wizard.template.css' ,"css") ;

		//加载对应的插件
		if( !$.layoutInit ){//layout 
			jQuery.attachFile(window,pluginPath+'layout/jquery.layout.css' ,"css") ;
			jQuery.attachFile(window,pluginPath+'layout/jquery.layout.js' ,"js" , function(){
				selector.each(function(){
					$(this).append("<div class='wizard-container'></div>") ;
					var me = this ;
					var options = $(this).attr("data-options")||"{}";
					eval(" var jsonOptions = "+options) ;
					var wizardParams = $.extend({steps:[]} ,jsonOptions);
					if(wizardParams.init){
						if(typeof wizardParams.init == 'string'){
							window[wizardParams.init]() ;
						}else{
							wizardParams.init() ;
						}
					}
						
					$(".wizard-container" , me).css("height","100%").load(pluginPath+"wizard/wizard.template.html .ui-layout",function(){
						
						$(".ui-layout").layout();
						
						$(me).find("[data-wizard]").hide().each(function(){
							var options = $(this).attr("data-wizard")||"{}";
							eval(" var jsonOptions = "+options) ;
							jsonOptions.selector = $(this) ;
							wizardParams.steps.push(jsonOptions) ;
						}) ;
						wizard = $(document.body).wizard(wizardParams) ;
						wizard.start();
					});
				});
			}) ;
		}else{
			selector.each(function(){
				$(this).append("<div class='wizard-container'></div>") ;
				var me = this ;
				var options = $(this).attr("data-options")||"{}";
				eval(" var jsonOptions = "+options) ;
				var wizardParams = $.extend({steps:[]} ,jsonOptions);
				$(".wizard-container" , me).css("height","100%").load(pluginPath+"wizard/wizard.template.html .ui-layout",function(){
					if(wizardParams.init){
						
						if(typeof wizardParams.init == 'string'){
							window[wizardParams.init]() ;
						}else{
							wizardParams.init() ;
						}
					}
					
					$(".ui-layout").layout();
					
					$(me).find("[data-wizard]").hide().each(function(){
						var options = $(this).attr("data-wizard")||"{}";
						eval(" var jsonOptions = "+options) ;
						jsonOptions.selector = $(this) ;
						wizardParams.steps.push(jsonOptions) ;
					}) ;
					wizard = $(document.body).wizard(wizardParams) ;
					wizard.start();
					
					$(".wizard-container" , me).dialogResize() ;
				});
			});
		}
		
		
		if( !$.growlUI ){//blockui
			jQuery.attachFile(window,pluginPath+'blockui/jquery.blockui.css' ,"css") ;
			jQuery.attachFile(window,pluginPath+'blockui/jquery.blockui.js' ,"js") ;
		}
		
		if( !$.dialog ){//dialog
			jQuery.attachFile(window,pluginPath+'dialog/jquery.dialog.css' ,"css") ;
			jQuery.attachFile(window,pluginPath+'dialog/jquery.dialog.js' ,"js") ;
		}

	}) ;
	
	jQuery.attachFile = function(win, filename, filetype , callback) {
		if (!filename)
			return;
		var head = win.document.getElementsByTagName('head').item(0);
		var fileref = null;
		var fpath = null;
		if (filetype == "css") {
			if (_(win, 'link', filename))
				return;// 判断当前页面是否存在
	
			fileref = win.document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
		} else if (filetype == "js") {

			if (_(win, 'script', filename))
				return;
			
			fileref = win.document.createElement('script');
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("language", "JavaScript");
			fileref.setAttribute("src", filename);
			var done = false;
			fileref.onload = fileref.onreadystatechange = function() {
			    if ( !done && ( !this.readyState ||
			            this.readyState === "loaded" || this.readyState === "complete" ) ) {
			       done = true ;
			       callback && callback() ;
			    }
			};
		}
		
	    head.appendChild(fileref);
	
		function _(win, tag, filename) {
			var scripts = win.document.getElementsByTagName(tag);
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				var _ = script.src || script.href;
				if (_ && _.indexOf("/" + filename) != -1) {
					return _ || '';
				}
			}
			return "";
		}
	}

	
})(jQuery);
