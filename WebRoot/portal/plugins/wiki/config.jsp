<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
	String path = request.getContextPath() ;
	String objectId = request.getParameter("object_id") ;
%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link type="text/css" rel="stylesheet" href="../../../statics/themes/mobile/style.css" />
	<script src="../../../statics/scripts/jquery.js"></script>
	<script src="../../../statics/scripts/common.js"></script>
	<script src="../../../statics/scripts/plugins/dialog/jquery.dialog.js"></script>
	
	
	<script type="text/javascript">
		$(function(){
			$('#wiki_name').focus().keydown(function(){ 
				event.keyCode==13 && $('#saveButton').click(); 
			})
			
			$('#closeButton').click( function(){
				window.top.plugin.close();
			} ) ;
			
			$('#saveButton').click( function(){
				var wiki_name = $('#wiki_name').val() ;
				if(!wiki_name){
	    			alert("WIKI页面名称不能为空！") ;
	    			return ;
	    		}

				window.top.plugin.callback('', $.trim(wiki_name) ) ; // params: (url , object_id)
			} ) ;

			var _objectId = '<%=objectId%>'||'' ;
			
			$('#wiki_name').val(_objectId) ;
		}) ;
		
		String.prototype.startWith=function(str){
			if(str==null||str==""||this.length==0||str.length>this.length)
			  return false;
			if(this.substr(0,str.length)==str)
			  return true;
			else
			  return false;
			return true;
		}
	</script>
</head>

<body  style="width:99%;" >
		<div  style="background: #f7fcff;height:195px; text-align: center;margin:0px;padding:0px;">
		<table width="100%" height="100%" border="0" style="margin:0px;padding:0px;" cellspacing="0" cellpadding="0">
			<tr>
				<td align=left valign=bottom id=d_c_title>
					<b>&nbsp;&nbsp;&nbsp;&nbsp;请输入WIKI名称：</b>
				</td>
			</tr>
			<tr>
				<td valign=top style="padding-top:5px;" id=d_c_content>
					<input name="wiki_name" id="wiki_name" maxlength="150" type="text" style="width:250px;height:22px;font:11pt;padding-top:3px;"/>
				</td>
			</tr>
			<tr>
				<td align="right">
					<a href="#" id="saveButton"  class="combtn" ><span style="text-align: center"><img src="../../images/ico_ok.gif"/>确定</span></a>
					<a href="#" id="closeButton" class="combtn"><span><img src="../../images/ico_del.gif" alt="关闭"/>关闭</span></a>
				</td>
			</tr>
		</table>
	   </div>
</body>
</html>
