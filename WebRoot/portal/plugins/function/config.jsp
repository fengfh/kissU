<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>配置来自功能的菜单</title>
	
	<link type="text/css" rel="stylesheet" href="../../../statics/themes/mobile/style.css" />
	<link type="text/css" rel="stylesheet" href="../../../statics/scripts/plugins/tree/jquery.tree.css" />
	<script src="../../../statics/scripts/jquery.js"></script>
	<script src="../../../statics/scripts/common.js"></script>
	<script src="../../../statics/scripts/plugins/jquery.json.js"></script>
	<script src="../../../statics/scripts/plugins/dialog/jquery.dialog.js"></script>
	<script src="../../../statics/scripts/plugins/tree/jquery.tree.js"></script>

	<script>
		var defaultName = '' ;
		var objectId    = '' ;

		$(function(){
			params = {
					code 	: window.location.href.getQueryString("code") ,
					pageid  : window.location.href.getQueryString("pageid"),
					url		: window.location.href.getQueryString("url")||window.location.href.getQueryString("content")
		    };

			objectId = params.pageid ;
			var menu = window.top.Portal.config.getCurrentMenu() ;
			var sourceId = menu.sourceId ;
			defaultName = menu.title||"" ;

			//alert($.json.encode(menu));

			$.dataservice("sqlid:portal.plugin.function.list", {format:false}, function(menuJson) {

				//数据格式转换
				var roots  = [] ;
				var childs = {} ;
				
				$(menuJson).each( function(){
					
					var me = this ;
					if(me.ID == sourceId ){
						defaultName = me.NAME ;
					}
						
					//数据转化
					var _n = {id:me.ID , text:me.NAME , pid: me.PARENT_ID , type:me.TYPE ,showCheck: me.CANCHECK , iconPath:me.ICON_PATH} ;
					_n.isExpand = true ;
					if( 'root' == _n.pid ){
						
						roots.push(_n) ;
					}else{
						childs[_n.pid] = childs[_n.pid]||[] ;
						childs[_n.pid].push(_n) ;
					}
				} ) ;
				
				$(roots).each(function(){
					renderChild( this,childs ) ;
				}) ;
		        
	        	$('#default-tree').tree({//tree为容器ID
					source:'array',
					onNodeClick	:	function(id, text, record,node){
	            		$('#current').html("当前选择功能页面为："+text) ;
	            		$('#functionId').val(id) ;
	            		$('#functionName').val(text);
	            	},
					data:roots
	            }) ;

	        	$('#current').html("当前选择功能页面为："+defaultName) ;
	        	//$('#functionId').val(objectId) ;
        		$('#functionName').val(defaultName);

       			$('#default-tree .bbit-tree-node-anchor').find("span:contains('"+defaultName+"')").each(function(){
   					if( $.trim($(this).text()) == defaultName ){
   						$(this).parents(".bbit-tree-node-el").find("span").focus().click() ;
   					}
   		        }) ;
        		//$('#default-tree').tree().checkNode(objectId) ;
        		
			});
			
			$('#closeButton').click( function(){
				$(this).dialogClose();
			} ) ;
			
			$('#saveButton').click( function(){
				var functionId = $('#functionId').val() ;
				if(!functionId){
					 alert("请选择功能页面！") ;
					 return ;
				}
				params.url = $.trim(functionId);
				window.top.plugin.callback( params );
				return true ;
			} ) ;
		}) ;

		function renderChild(menu , childs){
			if( childs[menu.id] ){
				menu.childNodes = childs[menu.id] ;
				$(menu.childNodes).each( function(){
					renderChild(this,childs) ;
				} );
			}
		}
	</script>
	
</head>

<body   style="width:99%;" >
	<div  style=" text-align: center;margin:0px;padding:0px;">
		<table width="100%" height="100%" border="0" style="margin:0px;padding:0px;" cellspacing="0" cellpadding="0">
			<tr>
				<td align=left valign=bottom id=d_c_title>
					<b><div id="default-tree" class="tree" style="padding: 5px; overflow-y: auto; height:310px;margin-top:30px;"></div></b>
				</td>
			</tr>
			<tr>
				<td valign=top style="padding-top:5px;height:30px;text-align:left;" class="ui-state-highlight" id=d_c_content>
					<input type="hidden" id="functionId"/>
					<input type="hidden" id="functionName"/>
					<span id="current"></span>
				</td>
			</tr>
			<tr>
				<td align="right" style="padding-top:10px;">
					<a href="#" id="saveButton"  class="combtn btn btn-primary" >确定</a>
					<a href="#" id="closeButton" class="combtn btn">关闭</a>
				</td>
			</tr>
		</table>
	   </div>
</body>
</html>