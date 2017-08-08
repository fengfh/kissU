		<!-- HTTP 1.1 -->
		
<%@page import="bingo.web.GlobalConfig"%><meta http-equiv="cache-control" content="no-store"/>
		<!-- HTTP 1.0 -->
		<meta http-equiv="Pragma" content="no-cache"/>
		<meta http-equiv="Expires" content="0"/>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
		<% 
			String contextPath = request.getContextPath();
			request.setAttribute("contextPath",contextPath);
			request.setAttribute("path",contextPath);
			request.setAttribute("serverPath",request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+contextPath);
			response.setHeader("P3P","CP=\"CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR\"");
			
			String theme = GlobalConfig.getConfigValue("Profile.theme","szmobile");
			request.setAttribute("theme",theme);
		%>
		
		<script type="text/javascript">
			var Global = {};
			Global.contextPath = '${contextPath}';
			Global.serverPath = '${serverPath}';
			var Config = Global ;

			var dataServiceURL = Global.contextPath+"/dataservice/" ;
		</script>
		
		<ui:combine widgets="framework-common">
			<link rel="stylesheet" type="text/css" href="${contextPath}/statics/themes/${theme}/style.css" />
		</ui:combine>
		
		<!-- fix themes -->
		<style type="text/css">
			.datalist .toolbar{
				padding-bottom:0px;
				height:22px;
			}
			
			.ui-tag-radio input{
				vertical-align: middle;
				position:relative;
			}
			
			.ui-tag-radio td{
				height:10px;
			}
			
			.ui-tag-radio label{
				padding: 0px 5px;
				position:relative;
				display: inline-block;
			}
		</style>
		
		<script type="text/javascript">
		$(function(){
			  $(document).find("form").keydown(function(e){
				  var kc = e.keyCode ;
				  if(kc == 13){
					 var $tgt = $(e.target);
					 
					 if (!$tgt.is('input'))return true ;
					 
			 		 if (e && e.preventDefault) {
			 			e.preventDefault();
			 		 } else {
						window.event.returnValue = false;
					 }
					 return false;
				  }
				  return true ;
		      }) ;
		  }) ;
		  </script>