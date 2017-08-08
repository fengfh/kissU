/**
 * 
 * author: lixh@bingosoft.net
 * 
 */
(function($) {
	var pluginName = "tree" ;
	
    $.fn.swapClass = function(c1, c2) {
        return this.removeClass(c1).addClass(c2);
    };
    $.fn.switchClass = function(c1, c2) {
        if (this.hasClass(c1)) {
            return this.swapClass(c1, c2);
        }
        else {
            return this.swapClass(c2, c1);
        }
    };
    $.fn.lighttree = function(settings,itemOrItemId,level,asyn) {
    	$(this).bind("contextmenu",function(e){
      	 	return false;
   		 }) ;
    	
    	if(settings.source == 'remote' || settings.source == null){
	    	settings.url = settings.url||(window.dataServiceUrl||"~/dataservice");
    	}
    	
        var dfop =
            {
            	source:'remote',
                method: "POST",
                dataType: "json",
                url: settings.url,
                path: '.' ,
                asyn: true ,//是否异步加载，如果为叶子节点
                //checkIcons: ["checkbox_0.gif", "checkbox_1.gif", "checkbox_2.gif"],
                checkIcons: ["bbit-tree-checkbox0", "bbit-tree-checkbox1", "bbit-tree-checkbox2"],
                showCheck: false, //是否显示选择            
                onCheck: false, //当checkstate状态变化时所触发的事件，但是不会触发因级联选择而引起的变化
                onNodeClick: false,
                cascadeCheck: true, //'UP DOWN true(all) false'
                root:{value:'root',text:'根节点',icon:'bbit-tree-root'},
                data: null,
                clicktoggle: true, //点击节点展开和收缩子节点
                theme: "bbit-tree-arrows", //bbit-tree-lines ,bbit-tree-no-lines,bbit-tree-arrows
                //定义默认图片地址
                icons:{floderOpen:"bbit-tree-folderopen",leaf:"bbit-tree-leaf",floder:"bbit-tree-folder",loading:'bbit-tree-loading'},
                params : {},
                rootId:"root",
                rootText : false,
                isRootExpand:false,
                isTriState:false
            };
        
        //扩展属性 相对root和icons单独进行设置，否则导致属性丢失
        if(settings && settings.root){
        	extendSubProp('root',['value','text','icon']) ;
        }
        
        if(settings && settings.icons){
        	extendSubProp('icons',['floderOpen','leaf','floder','loading']) ;
        }
        
        dfop.dataFormat = settings.dataFormat||function(data){return data;} ;
        dfop.nodeFormat = settings.nodeFormat||function(node){return node} ;
        
        $.extend(dfop, settings);

        //test data
        var count=0;
        
        //定义内部常量
        var _no_check  	= 0 ;
        var _yes_check 	= 1 ;
        var _hasf_check = dfop.isTriState?2:1 ;
        
        var me = $(this);
        var id = me.attr("id");
        if (id == null || id == "") {
            id = "bbtree" + new Date().getTime();
            me.attr("id", id);
        }

        var html = [];
        
        var treeData = dfop.data||( dfop.dataProxy?(dfop.dataProxy.type=='data'?dfop.dataProxy.value:null):null ) ;
        if(treeData == null )
        {
        	if(dfop.source == 'remote'){
        		var jsonStr = loadJsonTreeByURL(dfop.params,dfop.asyn,dfop.showCheck);
        		treeData = getJsonData(jsonStr);
        		$(treeData).each(function(){
        			//this.isExpand = true ;
        		}) ;
        	}
        	
        	if(dfop.rootText != false)
        	{
        		treeData = {
        			id:dfop.rootId,
        			text:dfop.rootText,
        			isExpand:true,
        			showCheck:false,
        			childNodes:treeData
        		};
        		//jsonStr = "{id:'"+ dfop.rootId + "',text:'" + dfop.rootText + "',isExpand:true,showCheck:false,childNodes:[" + jsonStr + "]}";
        	}
        	//treeData = eval('('+ jsonStr +')');
        }

        var treenodes = dfop.data = $.isArray(treeData)?treeData:[treeData] ;
        
        var __= dfop.data||( dfop.dataProxy?(dfop.dataProxy.type=='data'?dfop.dataProxy.value:null):null ) ;
        
        var treenodes = dfop.data = $.isArray(__)?__:[__] ;
        dfop.url =  dfop.url||( dfop.dataProxy?(dfop.dataProxy.type=='url'?dfop.dataProxy.value:null):null ) ;
        
        buildtree(dfop.data, html);
        me.addClass("ui-helper-reset bbit-tree").html(html.join(""));
       
        if(dfop.onLoaded){
          	dfop.onLoaded() ;
        }
        
        InitEvent(me);
        html = null;
        
		if(  dfop.expandLevel  && !dfop.asyn ){
			 setTimeout(function(){
				$(me).tree().expandLevel(null,dfop.expandLevel ) ;
			},0) ;
		}

        //通过AJAX从后台取数据
        function loadJsonTreeByURL(params,async,showCheck)
        {
            var tree = '';		
            
		  	asyn = asyn ? 'true' : 'false';
		  	showCheck = showCheck ? 'true' : 'false';
		  	
		  	params["showCheck"] = showCheck;
		  	params["async"] = async;
		  	
		  	var service_param = {CommandName:dfop.CommandName};
			service_param = $.extend(service_param, params);
			
			$.dataservice(dfop.CommandName,service_param,function (response){tree = response;},{async:false,url:dfop.url}) ;
                 
		  	return tree;
  		}
        
        //扩展子属性
        function extendSubProp(sub,props){
        	$(props).each( function(){
        		if( settings[sub][this] == undefined ) settings[sub][this] = dfop[sub][this] ;
        	} ) ;
        }
       
        //region 
        function buildtree(data, ht) {
            ht.push("<div class='bbit-tree-bwrap'>"); // Wrap ;
            ht.push("<div class='bbit-tree-body'>"); // body ;
            
            //需要替换图片的节点
           /* if( iconPath.indexOf(".") != -1 ){//绝对路径
            	ht.push("<div class='bbit-tree-node-icon' style='background-image:url("+iconPath+")'></div>");
            }else{//样式
            	ht.push("<div class='bbit-tree-node-icon "+iconPath+"'></div>");
            }*/
            
            ht.push("<ul class='bbit-tree-root ", dfop.theme, "'>"); //root
            if (data && data.length > 0) {
                var l = data.length;
                for (var i = 0; i < l; i++) {
                    buildnode(data[i], ht, 0, i, i == l - 1);
                }
                
                setTimeout(function(){
                	if(dfop.loadAfter){
			          	dfop.loadAfter() ;
			         }
                },10) ;
            }else {
                asnyloadc(null, false, function(data) {
            		data = getJsonData(data) ;
                    if ( data && data.length > 0 ) {
                        treenodes = data;
                        dfop.data = data;
                        var l = data.length;
                        for (var i = 0; i < l; i++) {
                            buildnode(data[i], ht, 0, i, i == l - 1);
                        }
                    }
                    setTimeout(function(){
	                	if(dfop.loadAfter){
				          	dfop.loadAfter() ;
				         }
	                },10) ;
                });
            }
            ht.push("</ul>"); // root and;
            ht.push("</div>"); // body end;
            ht.push("</div>"); // Wrap end;
            
        }
        
        //获取树请求以后的对象
        function getJsonData(data){
        
        	var ret = data ;
        	if(typeof data == 'string'){
        		eval( 'ret = '+data ) ;
        	}
        	return dfop.dataFormat(ret) ;
        }
   
        //endregion
        function buildnode(nd, ht, deep, path, isend) {
        	var isRootExpand =  dfop.isRootExpand ;
 
        	var initDeep = isRootExpand?0:1 ;
        	nd = dfop.nodeFormat(nd) ;
            var nid = (nd.id+"");//.replace(/[^\w]/gi, "_");
            ht.push("<li class='bbit-tree-node ui-color-default'>");
            ht.push("<div id='", id, "_", nid, "' nodeid='",nid,"' tpath='", path, "' unselectable='on' title='", nd.text, "'");
            var cs = [];
            cs.push("bbit-tree-node-el");
            //自定义图标
            var _icon = nd.icon ;
            var _refIcon = nd.refIcon ;//open
            var iconPath = null ;
            var isExpandCss = null ;
            if (hasChildren(nd) ) {
            	isExpandCss = nd.isExpand ? "bbit-tree-node-expanded" : "bbit-tree-node-collapsed"
                cs.push(isExpandCss);
                iconPath = !nd.isExpand?(_icon?_icon:dfop.icons.floder):(_icon?_refIcon:dfop.icons.floderOpen) ;
            }else {
                cs.push("bbit-tree-node-leaf");
                iconPath = _icon?_icon:dfop.icons.leaf ;
            }
            
            //deep == 0 表示为根节点
            iconPath = deep == 0 ?(nd.icon||dfop.root.icon):iconPath;
            
            if (nd.classes) { cs.push(nd.classes); }

            ht.push(" class='", cs.join(" "), "'>");
            //span indent
            ht.push("<span class='bbit-tree-node-indent'>");
            
            if (deep == initDeep) {
            	//ht.push("<div class='bbit-tree-blank'></div>");
            }else if (deep >= initDeep+1) {
            	//ht.push("<div class='bbit-tree-blank'></div>");
                for (var j = initDeep; j < deep; j++) {
                    ht.push("<div class='bbit-tree-blank'></div>");
                }
            }
            
            ht.push("</span>");
            cs.length = 0;
      
            if (hasChildren(nd)) {
                if (nd.isExpand) {
                    cs.push(isend ? "bbit-tree-elbow-end-minus" : "bbit-tree-elbow-minus");
                }else {
                    cs.push(isend ? "bbit-tree-elbow-end-plus" : "bbit-tree-elbow-plus");
                }
            }else {
                cs.push(isend ? "bbit-tree-elbow-end" : "bbit-tree-elbow");
            }

            if(  deep>=initDeep ) {
            	ht.push("<div class='bbit-tree-ec-icon bbit-tree-blank ", cs.join(" "), "'></div>");
            }
         
            //需要替换图片的节点
            if( iconPath.indexOf(".") != -1 ){//绝对路径
            	ht.push("<div class='bbit-tree-node-icon' style='background-image:url("+$.utils.parseUrl(iconPath)+")'></div>");
            }else{//样式
            	ht.push("<div class='bbit-tree-node-icon "+iconPath+"'></div>");
            }
            
            //checkbox
            if (isShowCheck(nd)) {
                if (nd.checkstate == null || nd.checkstate == undefined) {
                    nd.checkstate = _no_check;
                }
				var disableClz = (nd.disabled===true||nd.disabled===1)?' ui-state-disabled':'' ;
				
				ht.push("<div  id='", id, "_", nid, "_cb' class='bbit-tree-node-cb",disableClz," ",dfop.checkIcons[nd.checkstate],"'></div>");
              
              }
            
            //a
            ht.push("<a hideFocus class='bbit-tree-node-anchor' tabIndex=1 href='javascript:void(0);'>");
            ht.push("<span unselectable='on'>", nd.text, "</span>");
            ht.push("</a>");
            ht.push("</div>");
            
            //Child
            if ( hasChildren(nd) ) {
                if (nd.isExpand){
                    ht.push("<ul  class='bbit-tree-node-ct'  style='z-index: 0; position: static; visibility: visible; top: auto; left: auto;'>");
                    if (nd.childNodes) {
                        var l = nd.childNodes.length;
                        for (var k = 0; k < l; k++) {
                            nd.childNodes[k].parent = nd;
                            buildnode(nd.childNodes[k], ht, deep + 1, path + "." + k, k == l - 1);
                        }
                    }
                    ht.push("</ul>");
                }else {
                    ht.push("<ul style='display:none;'></ul>");
                }
            }
            ht.push("</li>");
            nd.render = true;
            cs.length = 0 ;
        }
        
        function hasChildren(nd){
        	return nd.hasChildren|| 
        		( false == nd.complete && typeof(nd.hasChildren)=='undefined'  )||
        		(nd.childNodes && nd.childNodes.length>0  )
        }
        
        function isComplete(nd){//是否已经加载完成
        	if( nd.hasChildren && !nd.childNodes ){
        		nd.complete = false ;
        	}else if(typeof(nd.complete) == 'undefined'){
        		nd.complete = true ;
        	}
        	return nd.complete ;
        }
        
        function isLeaf(item){
        	if(typeof(item) == 'string'){//item id
	        		item = getItemById(item) ;
	        }
        	return !( item.complete === false || ( item.childNodes && item.childNodes.length > 0 ) ) ;
        }
        
        function getItem(node) {
        	var nodeid =node.attr("nodeid");

        	var sn =  searchNode(nodeid)||{};
        	
        	return sn.node ;
        	/*
        	//nodeid
        	try{
	            var ap = path.split(".");
	            var t = treenodes;
	            for (var i = 0; i < ap.length; i++) {
	            	t = i==0?t[ap[i]]:t.childNodes[ap[i]];
	            }
	            return t;
        	}catch(e){
        	}*/
        }
        
        function checkAll(state){//treenodes
        	for( var i=0 ;i < treenodes.length ;i++){ //删除数据
        		__search( treenodes[i]) ;
        		check(treenodes[i],state,1) ;
        		
            }
            return null ;
            
            function __search( node ){
            	if ( node.childNodes && node.childNodes.length > 0) {
                 	  for(var j=0 ;j<node.childNodes.length ;j++){
                 	  	    __search( node.childNodes[j]) ;
                 	  		check(node.childNodes[j],state,1) ;
                 	  }
                }
            }
        }
        
        /**
         * 复选框选择事件
         * item ：数据项
         * state：鼠标点击节点状态
         * type: 0-遍历父节点  1-遍历子节点
         */
        function check(item, state, type) {
			if(item.showCheck === false) return ;
			
			var nid = item.id;//.replace(/[^\w]/gi, "_");
            var et = $("#" + id + "_" + nid + "_cb");
            if (et.length == 1 && et.hasClass('ui-state-disabled')) {
                return ;
            }

            var pstate = item.checkstate;
            if (type == 1) {
                item.checkstate = state;
            } else {// 上溯
                var cs = item.childNodes;
                var l = cs.length;
                var ch = true;
                for (var i = 0; i < l; i++) {
                    if ((state == _yes_check && cs[i].checkstate != _yes_check) || state == _no_check && cs[i].checkstate != _no_check) {
                        ch = false;
                        break;
                    }
                }
                item.checkstate = ch?state:_hasf_check ;
            }
            
            if(pstate != item.checkstate){
            	if( dfop.onChecking ){
		        	if( dfop.onChecking( item.id , item.text ,!(pstate==1?true:false),item  ) === false ) {
		        		item.checkstate = pstate ;//还原状态
		        		return ;
		        	};
	        	}
            }
            
            //change show
            if (item.render && pstate != item.checkstate) {
            	// 如果向上遍历 && 当前鼠标点击节点没有选中 && 当前取消选择父节点,则父节点仍然保持选中状态
            	if( ( !dfop.isTriState ) && type == 0 && state == _no_check &&  item.checkstate == _no_check ){
            		item.checkstate = _hasf_check;
            	}
            	
                if (et.length == 1) {
                	et.removeClass().addClass("bbit-tree-node-cb "+dfop.checkIcons[item.checkstate]) ;
                }
            }

			if( pstate != item.checkstate ){
	        	if( dfop.onChecked ){
		        	dfop.onChecked( item.id , item.text ,(item.checkstate==1?true:false),item  )
	        	}
            }
        }
        //遍历子节点
        function cascade(fn, item, args) {
            if (fn(item, args, 1) != false) {
                if (item.childNodes != null && item.childNodes.length > 0) {
                    var cs = item.childNodes;
                    for (var i = 0, len = cs.length; i < len; i++) {
                        cascade(fn, cs[i], args);
                    }
                }
            }
        }
        //冒泡的祖先
        function bubble(fn, item, args) {
            var p = item.parent;
            while (p) {
                if (fn(p, args, 0) === false) {
                    break;
                }
                p = p.parent;
            }
        }
        
        function setNodeIcon(nd,flag){
        	var _icon = nd.icon ;
            var _refIcon = nd.refIcon ;//open
            var iconPath = null ;
            
            if( $(this).hasClass("bbit-tree-node-expanded") ){
            	iconPath = _icon?_icon:dfop.icons.floderOpen ;
            }else if( $(this).hasClass("bbit-tree-node-collapsed") ){
            	iconPath = _icon?_refIcon:dfop.icons.floder ;
            }
            if(iconPath && !$(this).hasClass('ui-state-highlight')){
            	$(this).find('.bbit-tree-node-icon').removeClass().addClass('bbit-tree-node-icon '+iconPath) ;
            }
        }
        //add Param: level and asyn isRoot(first load)
        function _expandNode(e , et ,item ,path , level , asyn,isRoot){
        	var ul = $(this).next(); //"bbit-tree-node-ct"
        	
        	if( dfop.onExpand ){ //节点展开事件
        		dfop.onExpand( item.id , item, ul.hasClass("bbit-tree-node-ct") , isComplete(item) ) ;
        	}

            if (ul.hasClass("bbit-tree-node-ct")) {
                ul.show();
            }else {
                var deep = path.split(".").length;
                if ( isComplete(item) ) {//表示字节点加载完成
                    item.childNodes != null && asnybuild(item.childNodes, deep, path, ul, item);
                }else {
                    $(this).addClass("ui-state-highlight");
                    $(this).find('.bbit-tree-node-icon').removeClass().addClass('bbit-tree-node-icon '+dfop.icons.loading);
                    asnyloadc(item, true, function(data) {
                    	data = getJsonData(data) ;
                        item.complete = true;
                        item.childNodes = data;
                        asnybuild(data, deep, path, ul, item);
                        //if level>=0 展开该节点
                        if( (level>=1 && level<100) || isRoot ) expandAll(item , asyn ,level ) ;
                    });
                }
            }
            
            $(this).swapClass("bbit-tree-node-collapsed", "bbit-tree-node-expanded");

            if ($(et).hasClass("bbit-tree-elbow-plus")) {
                $(et).swapClass("bbit-tree-elbow-plus", "bbit-tree-elbow-minus");
            }else if ($(et).hasClass("bbit-tree-elbow-end-plus")){
                $(et).swapClass("bbit-tree-elbow-end-plus", "bbit-tree-elbow-end-minus");
            }
            //图标转换
            setNodeIcon.call(this,item,1) ;
            
        }
        
        function _collNode(e,et,item){
        	var me = this ;
        	if(!et){
        		if(typeof(item) == 'string'){//item id
	        		item = getItemById(item) ;
	        	}
	            var nid = item.id;//.replace(/[^\w]/gi, "_");
	            var div = $("#" + id + "_" + nid + " div.bbit-tree-ec-icon");
	            et = div ;
	            me = div.parent() ;
        	}
        	
	        $(me).next().hide();
                	
            $(me).swapClass("bbit-tree-node-expanded", "bbit-tree-node-collapsed");
            if ($(et).hasClass("bbit-tree-elbow-minus")) {
                $(et).swapClass("bbit-tree-elbow-minus", "bbit-tree-elbow-plus");
            }else if ($(et).hasClass("bbit-tree-elbow-end-minus")){
                $(et).swapClass("bbit-tree-elbow-end-minus", "bbit-tree-elbow-end-plus");
            }
            //图标转换
            setNodeIcon.call(me,item,2) ;
        }
        
        /**
         * 节点单击事件
         */
        function nodeClick(e) {
            var path = $(this).attr("tpath");
            var et = e.target || e.srcElement;
            
            var item = getItem( $(this) );
            
            if (et.tagName == "DIV") {
            	if( $(et).hasClass("bbit-tree-node-icon")  ){
            		et = $(et).prev(); 
            	}
                // +号需要展开 "bbit-tree-node-expanded" : "bbit-tree-node-collapsed"
                if ($(et).hasClass("bbit-tree-elbow-plus") || $(et).hasClass("bbit-tree-elbow-end-plus")) {
                	_expandNode.call( this ,e, et , item,path ) ;
                }else if ($(et).hasClass("bbit-tree-elbow-minus") || $(et).hasClass("bbit-tree-elbow-end-minus")) {  //- 号需要收缩                    
                	_collNode.call(this , e , et , item) ;
              }else if ($(et).hasClass("bbit-tree-node-cb") && !$(et).hasClass('ui-state-disabled')) // 点击了Checkbox
                {
                    var s = item.checkstate != _yes_check ? _yes_check : _no_check;
                    var r = true;
                    
                    if (r != false) {
                        if (dfop.cascadeCheck) {
						
                        	var self = false ;
                        	if( 'DOWN' == dfop.cascadeCheck || dfop.cascadeCheck === true ){
                        		self = true ;
                        		//向下遍历
                            	cascade(check, item, s);
                        	}
                        	
                        	if(!self)check(item, s, 1);//选中自己
                        	
                        	if( 'UP' == dfop.cascadeCheck || dfop.cascadeCheck === true ){
                        		//向上溯
                            	bubble(check, item, s);
                        	}
                        	
                        }else {
                            check(item, s, 1);
                        }
                    }
                    
                    if (dfop.onCheck) {
                    	var _a = typeof(dfop.onCheck) == 'string'?eval(dfop.onCheck):dfop.onCheck ;
                    	r = _a.call(et,item.id,item.text,!(item.checkstate==1?true:false),item,et);
                    }
                }
            }else if(et.tagName == 'SPAN'){
                if (dfop.citem){
                    var nid = dfop.citem.id;//.replace(/[^\w]/gi, "_");
                    $("#" + id + "_" + nid).removeClass("bbit-tree-selected ui-state-active active");
                }
                dfop.citem = item;
                $(this).addClass("bbit-tree-selected ui-state-active active");

                if (dfop.onNodeClick){
                    if (!item.expand){
                        item.expand = function() { expandnode.call(item); };
                    }
                    var _a = typeof( dfop.onNodeClick ) == 'string'?eval(dfop.onNodeClick):dfop.onNodeClick ;
	                _a.call(this, item.id , item.text , item , this);
                }
           }
        }
        
        /**
         * 双击事件,打开合并菜单
         */
        function nodeDblClick(e){
        	var path = $(this).attr("tpath");
            var et = e.target || e.srcElement;
            var item = getItem( $(this) ) ;
            if(et.tagName == 'SPAN'){
            	//获取指定的对象
            	et = $(this).find('.bbit-tree-node-icon').prev() ;
                if ($(et).hasClass("bbit-tree-elbow-plus") || $(et).hasClass("bbit-tree-elbow-end-plus")) {
                    var ul = $(this).next(); //"bbit-tree-node-ct"
                    if (ul.hasClass("bbit-tree-node-ct")) {
                        ul.show();
                    }else {
                        var deep = path.split(".").length;
                        if (isComplete(item)) {
                            item.childNodes != null && asnybuild(item.childNodes, deep, path, ul, item);
                        }else {
                            $(this).addClass("ui-state-highlight");
                            asnyloadc(item, true, function(data) {
                            	data = getJsonData(data) ;
                                item.complete = true;
                                item.childNodes = data;
                                asnybuild(data, deep, path, ul, item);
                            });
                        }
                    }
                    
                    $(this).swapClass("bbit-tree-node-collapsed", "bbit-tree-node-expanded");
                    if ($(et).hasClass("bbit-tree-elbow-plus")) {
                        $(et).swapClass("bbit-tree-elbow-plus", "bbit-tree-elbow-minus");
                    }else {
                        $(et).swapClass("bbit-tree-elbow-end-plus", "bbit-tree-elbow-end-minus");
                    }
                    setNodeIcon.call(this,item,1) ;
                }else if ($(et).hasClass("bbit-tree-elbow-minus") || $(et).hasClass("bbit-tree-elbow-end-minus") ) {  //- 号需要收缩                    
                	$(this).next().hide();
                	
                    $(this).swapClass("bbit-tree-node-expanded", "bbit-tree-node-collapsed");
                    if ($(et).hasClass("bbit-tree-elbow-minus")) {
                        $(et).swapClass("bbit-tree-elbow-minus", "bbit-tree-elbow-plus");
                    }else {
                        $(et).swapClass("bbit-tree-elbow-end-minus", "bbit-tree-elbow-end-plus");
                    }
                    setNodeIcon.call(this,item,1) ;
                }
           }
        }
        
        function asnybuild(nodes, deep, path, ul, pnode,dyn) {
        	if( nodes && nodes.length > 0){
        		var l = nodes.length;
	            if (l > 0) {
	                var ht = [];
	                var ids = [] ;
	                
	                //获取原来有多少个节点
	                var base =  ul.children('li').length  ;
	                
	                for (var i = 0; i < l; i++) {
	                	ids.push('#'+id+"_"+nodes[i].id) ;
	                    nodes[i].parent = pnode;
	                    buildnode(nodes[i], ht, deep, path + "." + (base+i), i == l - 1);
	                }
	                
	                if(dyn){
	                	ul.append(ht.join(""));
	                	$(ids.join(',')).each(bindevent);
	                }else{
	                	ul.html(ht.join(""));
	                	InitEvent(ul);
	                }
	                //if(dfop.onLoaded) dfop.onLoaded() ;
	                ht = null;
	            }
	            ul.addClass("bbit-tree-node-ct").css({ "z-index": 0, position: "static", visibility: "visible", top: "auto", left: "auto", display: "" });
	       		ul.prev().find('.bbit-tree-node-icon').removeClass().addClass("bbit-tree-node-icon "+ (pnode.icon||dfop.icons.floderOpen) ) ;//
	       		//如果原来是叶子节点，需要修改
	       		ul.prev().find('.bbit-tree-ec-icon').removeClass().addClass('bbit-tree-ec-icon bbit-tree-elbow-minus') ;
	       }else{//没有节点
        		//替换样式
        		var et = ul.prev().find('.bbit-tree-ec-icon') ;
        		if( et.hasClass("bbit-tree-elbow-end-minus") ){
        			et.removeClass().addClass('bbit-tree-ec-icon bbit-tree-elbow-end') ;
        		}else{
        			et.removeClass().addClass('bbit-tree-ec-icon bbit-tree-elbow') ;
        		}
        		//替换图片,设置为叶子节点的图片
        		ul.prev().find('.bbit-tree-node-icon').removeClass().addClass('bbit-tree-node-icon '+( pnode.icon||dfop.icons.leaf )) ;
        	}   
        	ul.prev().removeClass("ui-state-highlight");
        }
        
        function asnyloadc(pnode, isAsync, callback) {
            if ( dfop.url ) {
            	//构造调用参数
                var param = builparam(pnode);
                if(param != null){
	                dfop.params["parentId"] = param.parentId;
	                dfop.params["checkState"] = param.checkState;
                }
                
                var service_param = $.extend({CommandName:dfop.CommandName}, dfop.params);
				
				if(dfop.params["childSqlId"]){
					service_param["sqlId"] = dfop.params["childSqlId"];
				}
                
				$.dataservice(dfop.CommandName,service_param, callback ,{async:false,url:dfop.url}) ;
            }
        }
        
        //构造参数
        function builparam(node) {
        	var param = dfop.dataProxy?dfop.dataProxy.params:{} ;
        	if (node && node != null){
        		$.extend(param, {
        			parentId:encodeURIComponent(node.id),
        			checkState:node.checkstate
        		});
        	}
            return param;
        }
        
        //绑定事件到节点
        function bindevent() {
            $(this).hover(function() {
                $(this).addClass("bbit-tree-node-over ui-state-hover");
            }, function() {
                $(this).removeClass("bbit-tree-node-over ui-state-hover");
            }).click(nodeClick).dblclick(nodeDblClick)
             .find("div.bbit-tree-ec-icon").each(function(e) {
                 if (!$(this).hasClass("bbit-tree-elbow")) {
                     $(this).hover(function() {
                         $(this).parent().addClass("bbit-tree-ec-over");
                     }, function() {
                         $(this).parent().removeClass("bbit-tree-ec-over");
                     });
                 }
             }) ;
             
             if(dfop.contextMenu){//如果存在右键菜单
            	 $(this).bind('contextmenu', function(e){
            		 _contextMenu.call(this,e) ;
            	 });
             }
        }
        
        function _contextMenu(e){
        	var nid = $(this).attr('nodeid') ;
       	    var item = getItemById(nid) ;
       	    var options = dfop.contextMenu(item) ;
       	    if(options["items"].length == 0) return;
        	options.eventType = 'contextmenu' ;
        	$(this).contextmenu(options) ;
        	$(this).contextmenu(options).show(e) ;
        }
        
        //初始化事件
        function InitEvent(parent) {
            var nodes = $("li.bbit-tree-node>div", parent);
            nodes.each(bindevent);
        }
         
        function expandAll(_item , asyn ,level , isRoot){//展开所有节点
        	if(!_item){
        		$( treenodes ).each(function(index,item){
        			expandAll(item,asyn ,level , isRoot) ;
        		});
        		return ;
        	}
        	
        	if( level === 0 ) return ;
        	level = parseInt(level||10000) ;
        	
        	if(typeof(_item) == 'string'){//item id
        		_item = getItemById(_item) ;
        	}
        	var item = _item||this;
        	if(!_item){
        		//alert(item.id)
        	}
        	
            var nid = item.id;//.replace(/[^\w]/gi, "_");
            var div = $("#" + id + "_" + nid + " div.bbit-tree-ec-icon");
            
            if (div.length > 0) {
            	var path = div.parent().attr("tpath");
            	//非叶子节点
            	if( !isLeaf(item) )
            		_expandNode.call( div.parent(), null,div,item,path,level,asyn,isRoot) ;
	        }
	        level-- ;
            
        	//展开所有节点
        	$(item.childNodes).each(function(){
        		var _ = this ;
	            var nid = _.id;//.replace(/[^\w]/gi, "_");
	            var div = $("#" + id + "_" + nid + " div.bbit-tree-ec-icon");
	            if( !asyn &&  _.complete === false && level > 100 ) return ; 
	            expandAll( _ , asyn , level ) ;
        	}) ;
        }
        
        function expandnode(_item) {
            var item = _item||this;
            var nid = item.id;//.replace(/[^\w]/gi, "_");
            var div = $("#" + id + "_" + nid + " div.bbit-tree-ec-icon");
            if (div.length > 0) {
                div.click();
            }
        }
        
        function getItemById(itemId){//获取item通过ID
        	var nid = itemId;//.replace(/[^\w-]/gi, "_");
            var node = $("#" + id + "_" + nid);
            if (node.length > 0) {
                var path = node.attr("tpath");
                var item = getItem(node);
                return item ;
            }
            return null;
        }
        
        function refresh(itemId) {
            var nid = itemId;//.replace(/[^\w-]/gi, "_");
            var node = $("#" + id + "_" + nid);
            if (node.length > 0) {
                node.addClass("ui-state-highlight");
                var isend = node.hasClass("bbit-tree-elbow-end") || node.hasClass("bbit-tree-elbow-end-plus") || node.hasClass("bbit-tree-elbow-end-minus");
                var path = node.attr("tpath");
                var deep = path.split(".").length;
                var item = getItem(node);
                if (item) {
                    asnyloadc(item, true, function(data) {
                    	data = getJsonData(data) ;
                        item.complete = true;
                        item.childNodes = data;
                        item.isExpand = true;
                        if (data && data.length > 0) {
                            item.hasChildren = true;
                        }else {
                            item.hasChildren = false;
                        }
                        var ht = [];
                        buildnode(item, ht, deep - 1, path, isend);
                        ht.shift();
                        ht.pop();
                        var li = node.parent();
                        li.html(ht.join(""));
                        ht = null;
                        InitEvent(li);
                        bindevent.call(li.find(">div"));
                        //if(dfop.onLoaded) dfop.onLoaded() ;
                    });
                }
            }else {
                alert("该节点还没有生成");
            }
        }
        
        function isShowCheck(nd){
        	if( typeof nd.showCheck == 'undefined' )
        		nd.showCheck = true ;
        	return dfop.showCheck && nd.showCheck ;
        }
        var count = 0;
        
        /**
         * 获取节点items选中值
         */
        function getck(items, c, fn) {
            for (var i = 0, l = items.length; i < l; i++) {
                ( isShowCheck(items[i]) &&  items[i].checkstate == _yes_check ) && c.push(fn(items[i]));
                if (items[i].childNodes != null && items[i].childNodes.length > 0) {
                    getck(items[i].childNodes, c, fn);
                }
            }
        }
        function getCkAndHalfCk(items, c, fn) {
            for (var i = 0, l = items.length; i < l; i++) {
                (isShowCheck(items[i]) && (items[i].checkstate == _yes_check || items[i].checkstate == _hasf_check)) && c.push(fn(items[i]));
                if (items[i].childNodes != null && items[i].childNodes.length > 0) {
                    getCkAndHalfCk(items[i].childNodes, c, fn);
                }
            }
        }
        
        function itemClone(item){
        	if(!item) return null ;
        	var it = {} ;
        	it 				= $.extend(it,item) ;
        	it.childNodes 	= undefined ;
        	it.parent 		= undefined ;
        	it.render 		= undefined ;
        	it.complete 	= undefined ;
        	it.showCheck 	= undefined;
        	it.hasChildren	= undefined ;
        	it.isExpand		= undefined ;
        	return it ;
        }
        
         function disabled(item,bool){
        	if(dfop.onDisabling){
        		if( dfop.onDisabling(item,bool) === false ) return ;
        	}
        	item = typeof(item) == 'string'?getItemById(item) : item ;
        	var nid = item.id;//.replace(/[^\w]/gi, "_");
            var div = $("#" + id + "_" + nid + " div.bbit-tree-node-cb");
            if(false === bool){
            	div.removeClass('ui-state-disabled') ;
            }else{
            	if(!div.hasClass('ui-state-disabled'))div.addClass('ui-state-disabled') ;
            }
            if(dfop.onDisabled){
            	dfop.onDisabled(item,bool)
        	}
        }
        
        function searchNode(item){//节点搜索
        	var _id = typeof(item)=='string'?item:item.id ;
    
        	for( var i=0 ;i < treenodes.length ;i++){ //删除数据
        		var s = __search(_id , treenodes[i] , treenodes , i , null) ;
            	if( s ) return s;
            }
            return null ;
            
            function __search(id , node , treenodes , index , pnode){
            	if( id == node.id ){
            		return {id:id,node:node,array:treenodes,index:index,pnode:pnode} ;
            	}
            	if ( node.childNodes != null && node.childNodes.length > 0) {
                 	  for(var j=0 ;j<node.childNodes.length ;j++){
                 	  	var s = __search( id , node.childNodes[j],node.childNodes,j,node) ;
                 	  	if(s){
                 	  		return s;
                 	  	}
                 	  }
                }
                return false ;
            }
        }
        
        me[0].t = {
            getSelectedNodes: function(gethalfchecknode) {
                var s = [];
                if (gethalfchecknode) {
                    getCkAndHalfCk(treenodes, s, function(item) { return itemClone(item); });
                }else {
                    getck(treenodes, s, function(item) { return itemClone(item); });
                }
                return s;
            },getSelectedValues: function(gethalfchecknode) {
                var s = [];
                if(gethalfchecknode){
                	getCkAndHalfCk(treenodes, s, function(item) { return item.value||item.id ; });
                }else{
                	getck(treenodes, s, function(item) { return item.value||item.id; });
                }
                return s;
            },
            getCurrentItem: function() {
                return itemClone( dfop.citem );
            },
            refresh: function(itemOrItemId) {
                var id;
                if (typeof (itemOrItemId) == "string") {
                    id = itemOrItemId;
                }else {
                    id = itemOrItemId.id;
                }
                refresh(id);
            },
            expandAll:function(item,asyn,level){
            	expandAll(item,asyn,level,true) ;
            },
            checkAll:function(state){
            	checkAll(state) ;
            },
            collapse :function(item){
            	_collNode(null,null,item) ;
            },isLeaf:function(item){
            	return isLeaf(item) ;
            },treeOption:function(option,value){
            	if(value==undefined) return dfop[option] ;
            	dfop[option] = value ;
            },deleteNode:function(item){
            	var _id = typeof(item)=='string'?item:item.id ;
            	var sn = searchNode(_id) ;
            	if(dfop.onDeleting) {
            		if( dfop.onDeleting( _id , sn.node )=== false ) return  ;
            	}
            	
	            var nid = _id;//.replace(/[^\w]/gi, "_");
	            $("#" + id + "_" + nid).next("ul").remove();
	            $("#" + id + "_" + nid).parent().remove() ; //删除DOM节点
	            
	            if(sn){
	            	//
	            	if( dfop.citem && dfop.citem.id == sn.node.id ) dfop.citem = null ;
	            	
	            	sn.array.splice(sn.index,1) ;
	            	if( (!sn.array||sn.array.length<=0) && sn.pnode){//如果节点不存在，需要将父节点转换
	            		var parentId = sn.pnode.id ;
	            		var nid = parentId;//.replace(/[^\w-]/gi, "_");
	            		var ul = $("#" + id + "_" + nid).next() ;
	            		var et = ul.prev().find('.bbit-tree-ec-icon') ;
		        		if( et.hasClass("bbit-tree-elbow-end-minus") ){
		        			et.removeClass().addClass('bbit-tree-ec-icon bbit-tree-elbow-end') ;
		        		}else{
		        			et.removeClass().addClass('bbit-tree-ec-icon bbit-tree-elbow') ;
		        		}
		        		//替换图片,设置为叶子节点的图片
		        		ul.prev().find('.bbit-tree-node-icon').removeClass().addClass('bbit-tree-node-icon '+(sn.pnode.icon||dfop.icons.leaf )) ;
	            	}
	            }
	            
	            if(dfop.onDeleted) {
            		 dfop.onDeleted( _id , getItemById(_id) )  ;
            	}
            },updateNode:function(item){
            	var _id   = item.id ;
            	if(dfop.onUpdating) {
            		if( dfop.onUpdating(_id, item )=== false ) return  ;
            	}
            	
            	var text = item.text ;
	            var nid = _id;//.replace(/[^\w]/gi, "_");
	            $("#" + id + "_" + nid).find('a span').html(text) ;
	            
	            var sn = searchNode(_id) ;
	            if(sn){
	            	sn.node	= $.extend(sn.node,item);
	            	sn.node.text = text ;
	            	if( dfop.citem && dfop.citem.id == sn.node.id ) dfop.citem = sn.node ;
	            }
	            if(dfop.onUpdated) {
            		 dfop.onUpdated( _id  ,item)  ;
            	}
            },addNode:function(item){
            	var _id = item.id ;
            	if(dfop.onAdding) {
            		if( dfop.onAdding( _id , item )=== false ) return  ;
            	}
	           
	            var parentId = item.parentId ;
	            var text = item.text ;
	            var pnode = getItemById(parentId) ;
	            var nodes = $.isArray(item)?item:[item] ;
	            
	            var nid = parentId;//.replace(/[^\w-]/gi, "_");
	            var path = $("#" + id + "_" + nid).attr("tpath");
	            var deep = path.split(".").length;
	            
	            //如果父节点没有展开，需要展开父节点
	            if(!pnode.isExpand){
	            	expandnode(pnode) ;
	            }
	            
	            var ul = $("#" + id + "_" + nid).next() ;
	            if( !ul.get(0) ){//如果ul不存在，则需要添加一个ul节点
	            	$("#" + id + "_" + nid).parent().append("<ul style='display:none;'></ul>") ;
	            	ul = $("#" + id + "_" + nid).next() ;
	            }
	            
	            var sn = searchNode(parentId) ;
	            if(sn){
	            	sn.node.childNodes = sn.node.childNodes||[] ;
	            	sn.node.childNodes.push(item) ;
	            }
	            
	            asnybuild( nodes , deep ,path , ul , pnode,true ) ;
	            
	            if(dfop.onAdded) {
            		 dfop.onAdded( _id , item)  ;
            	}
            },checkNode:function(item , state){
            	var temp = item ;
            	item = typeof(item) == 'string'?getItemById(item) : item ;
            	
            	if( !item ){
            		item = searchNode(temp)  ;
            		item && ( item.node.checkstate = (state===true||state===1)?1:0 );
            	}else{
            		item.checkstate = (state===true||state===1)?0:1 ;
            		var nid = item.id;//.replace(/[^\w]/gi, "_");
	            	var div = $("#" + id + "_" + nid + " div.bbit-tree-node-cb");
	            	div.click() ;
            	}
            	return item ;
            	
            },disableNode:function(item,bool){
            	disabled(item, bool) ;
            }
        };
        return me;
    };
    
    $.extend($.fn , {
    	getSelectedIds :function() { //获取所有选中的节点的Value数组
	        if (this[0].t) {
	            return this[0].t.getSelectedValues();
	        }
	        return null;
	    },getSelectNodes:function(gethalfchecknode) {//获取所有选中的节点的Item数组
	        if (this[0].t) {
	            return this[0].t.getSelectedNodes(gethalfchecknode);
	        }
	        return null;
	    },getCurrentNode : function() {
	        if (this[0].t) {
	            return this[0].t.getCurrentItem();
	        }
	        return null;
	    },refresh : function(ItemOrItemId) {
	        if (this[0].t) {
	            return this[0].t.refresh(ItemOrItemId);
	        }
	    },expandAll: function(item,asyn,event){//item需要展开的节点，默认根节点，asyn时候展开异步节点
	    	if (this[0].t) {
	            return this[0].t.expandAll(item,asyn,null);
	        }
	    },collapse : function(item){
	    	if (this[0].t) {
	            return this[0].t.collapse(item);
	        }
	    },expandLevel:function(item,level){//item需要展开的节点，默认根节点，level层次
	    	if (this[0].t) {
	            return this[0].t.expandAll(item,true,level);
	        }
	    },isLeaf :function(item){
	    	if (this[0].t) {
	            return this[0].t.isLeaf(item);
	        }
	    },treeOption:function(option,value){//获取属性或设置属性
	    	if (this[0].t) {
	            return this[0].t.treeOption(option,value);
	        }
	    },deleteNode:function(item){
	    	if (this[0].t) {
	            return this[0].t.deleteNode(item);
	        }
	    },updateNode:function( item ){
	    	if (this[0].t) {
	            return this[0].t.updateNode(item);
	        }
	    },addNode:function( item ){
	    	if (this[0].t) {
	            return this[0].t.addNode(item);
	        }
	    },checkAll:function( state ){
	    	if (this[0].t) {
	            return this[0].t.checkAll(state);
	        }
	    },checkNode:function(item,state){
	    	if (this[0].t) {
	            return this[0].t.checkNode(item,state);
	        }
	    },disableNode:function(item,bool){
	    	if (this[0].t) {
	            return this[0].t.disableNode(item,bool);
	        }
	    }
    }) ;
    
    $.treeInit = function(jqueryObj,json4Options){
    	/*
    	if(json4Options.source == 'data'){
    		json4Options.dataProxy = {
    			type:'data',
    			value:window[json4Options.data]
    		};
    	}
    	*/
    	jqueryObj.lighttree(json4Options);
    }
    
    $.fn.tree = function(json_obj){
    	if( !this.length ){
    		alert("初始化树失败。选择器["+this.selector +"]不存在，请检查书写是否有误！") ;
    		return ;
    	}
    	
    	if( $(this).data("treeWidget") ) return  $(this).data("treeWidget");
    	
		var oTreeWidget = new treeWidget();
		oTreeWidget.init($(this),json_obj);
		
		$(this).data("treeWidget",oTreeWidget) ;
		return oTreeWidget;
	};
	
	$.uiwidget.register("tree",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this).tree(jsonOptions) ;
		});
	}) ;
	
	treeWidget = function(){
		this.$ = null;
		
		var events = ['getSelectedIds','getSelectNodes','getCurrentNode',
		              'refresh','expandAll','collapse','expandLevel','isLeaf','treeOption',
		              'deleteNode','updateNode','addNode','checkAll','checkNode','disableNode'] ;
		
		var me = this ;
		
		this.init = function(jquery_obj,json_obj){
			this.$ = jquery_obj;
			this.options = json_obj ;
			if(json_obj != undefined){
				 this.$.lighttree(json_obj);
			}
			
			$(events).each(function(){
				var event = this ;
				me[event] = function(){
					var args = [] ;
					for (var j = 0; j < arguments.length; j++) {
						args.push(arguments[j]);
					}
					return me.$[event].apply(me.$,args) ;
				}
			}) ;
		};
		
		this.reload = function(options){//bbit-tree-bwrap
			this.$.find(".bbit-tree-bwrap").remove();
			this.options = $.extend(this.options,options||{}) ;
			this.init(this.$,this.options) ;
		}
	};
})(jQuery);