<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java"  pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>
<%@page import="bingo.security.SecurityContext"%>

<%@page import="bingo.common.core.utils.StringUtils"%>
<%@page import="bingo.environment.Env"%>
<%@page import="bingo.web.GlobalConfig"%><html xmlns="http://www.w3.org/1999/xhtml">
<% 
	String contextPath = request.getContextPath();
	request.setAttribute("contextPath",contextPath);
	request.setAttribute("serverPath",request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+contextPath);
	response.setHeader("P3P","CP=CAO PSA OUR");
	out.println("<script>var $portalCode = '"+request.getParameter("portalCode")+"';</script>" ) ;
	String theme = request.getParameter("theme") ;
	if (StringUtils.isNotEmpty(theme)) {
		// 覆盖主题
		Env.register("Profile.theme", theme);
	} else {
		theme = GlobalConfig.getConfigValue("Profile.theme","mobile");
	}
	request.setAttribute("theme",theme);
	out.println("<script>var theme = '"+theme+"';</script>" ) ;
	out.println("<script>var canChangeTheme = "+SecurityContext.hasPermission("PORTAL.DESIGN")+" </script>" );
%>
<head>
	<title>开发框架</title>

	<ui:combine>
		<!-- plugin styles -->
		<link href="${contextPath}/statics/scripts/plugins/dialog/jquery.dialog.css" rel="stylesheet">
		<link href="${contextPath}/statics/scripts/plugins/blockui/jquery.blockui.css" rel="stylesheet">
		<link href="${contextPath}/statics/scripts/plugins/jcarousel/jquery.jcarousel.css" rel="stylesheet">
		<!-- required style-->
		<link href="${contextPath}/statics/themes/${theme}/style.css" rel="stylesheet">
		<link href="${contextPath}/statics/themes/${theme}/module/baseframe/baseframe.css" rel="stylesheet">
		
		<link href="${contextPath}/portal/layouts/default/styles/portal_config.css" rel="stylesheet">
		
		<script src="${contextPath}/statics/scripts/jquery.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/common.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/browserfix.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/module/baseframe/index.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/jsrender.js" type="text/javascript"></script> 
		
		<script src="${contextPath}/statics/scripts/plugins/jquery.cookie.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/jquery.json.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/jquery.query.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/dialog/jquery.dialog.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/blockui/jquery.blockui.js" type="text/javascript"></script>
		<script src="${contextPath}/statics/scripts/plugins/jcarousel/jquery.jcarousel.js" type="text/javascript"></script>
		
		<script src="${contextPath}/portal/scripts/portal_rest_services.js" type="text/javascript"></script>

		<script src="${contextPath}/portal/layouts/default/scripts/layout.js" type="text/javascript"></script>
		<script src="${contextPath}/portal/layouts/default/scripts/portal_config_init.js" type="text/javascript"> </script> 
		
		<script src="${contextPath}/statics/scripts/module/baseframe/${theme}/index.js" type="text/javascript"></script>
	</ui:combine>

	
	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  <script type="text/javascript" src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
	
	<!--[if IE 6]>
		<script type="text/javascript" src="../../../statics/scripts/plugins/DD_belatedPNG/DD_belatedPNG.js"></script>
	<![endif]-->
	
	<style>
		/* 去掉后台系统的滚动条 */
		html {
			overflow-y:hidden;
		}
	</style>
</head>


<!-- <li class="active"><a href="#"><span>首　页</span></a></li> -->
<script id="topmenu_template"  container=".navbar ul.nav" type="text/x-jsrender">
	<li title="{{:name}}"  menuid="{{:id}}">
		<a href="{{:url}}" menuid="{{:id}}">
			<span>
				{{:name}}
			</span>
		</a>
	</li>
</script>

<script id="leftmenu_template"  container="#sidebar ul.rootmenu" type="text/x-jsrender">
	<li>
		<a href="{{:url}}" class="root" menuid="{{:id}}">
			<span>
				{{if  thumbnailSmall}}
    				<img src="{{:thumbnailSmall}}" alt="" />
				{{/if}}
			</span>
			{{:name}}
		</a>
		{{if childs}}
		<ul class="submenu">
			{{for childs}}
				<li><a href="{{:url}}" menuid="{{:id}}" >{{:name}}</a></li>
				{{if childs}} 
					<ul>
						 {{for childs}}
						 	<li><a href="{{:url}}" menuid="{{:id}}" >{{:name}}</a></li>
						 {{/for}}
					</ul>
					{{/if}}
			{{/for}}
		</ul>
		{{/if}}
	</li>
</script>

<script id="shortcut_template"  container=".shortcut-container" type="text/x-jsrender">
	<a href="{{:url}}" shortcut-id="{{:id}}" class="btn-shortcut pngfix" title="{{:name}}" >
		<span>
			<img class="pngfix" src="{{:thumbnail}}" alt="{{:name}}" style="width:32px;height:32px;">
			<b class="btn-text">{{:name}}</b>
		</span>
	</a>
</script>
	
<body class="container-index">

	<div class="wrapper master-page">
		<!-- 头部 start -->
		<div id="header" class="header">	
			<!-- tool 工具栏 start-->
			<div id="header-toolbar"  style="display:none;">		
			</div>
			<!-- tool 工具栏 end-->
			
			<!--logo start-->
			<div class="header-menu">
					<div class="pull-left">
						<a href="#" id="logo">
							logo
						</a>
					</div>
					<div class="pull-right  shortcut-container">
					</div>
			</div>
			<!-- logo end -->
			
			<!--顶部导航菜单  start-->
			<div class="navbar">
				<div class="navbar-inner">
					<div class="container">
						<div class="user-info">您好，<%=SecurityContext.getCurrentUser().getName()%></div>
						<div class="nav-outter"> 
							<ul class="nav">
							</ul>
						</div>
					</div>
				</div>
			</div>
			<!--顶部导航菜单 end-->
		</div>
		<!-- 头部 end -->
		
		
		<!-- 左边导航菜单  start -->
		<div id="sidebar" class="sidebar">
            <h2 class="sidebar-title">
            	<span>操作菜单</span>
            </h2>
            <div class="control" style="display:none;">
				<ul>
					<li class="showall">
						<a href="#">全部展开</a>
					</li>
					<li class="showsetting">
						<a href="#">自定义</a>
					</li>
				</ul>
			</div>
			<ul class="rootmenu">
			</ul>
			<a href="#" id="menucollapse" class="menucollapse-hide"></a>
		</div>
		<!-- 左边导航菜单  end-->
		
		
		<!-- 中间主体内容 start -->
		<div class="content-wrapper">
        	<div class="content-body">
            	<div id="content" class="content" >
                	<!-- iframe start -->
                    <iframe allowtransparency="true" frameborder=0  style="height:100%;width:100%;" src="" ></iframe>
                    <!-- iframe end -->
                </div>
            </div>
		</div>
		<!-- 中间主体内容 end -->
		

		<!-- 脚部 start -->
		<div id="footer">
			<div class="copyright text-center">		
				京ICP备05002571号 | 中国移动通信版权所有
			</div>
		</div> 
		<!-- 脚部 end -->
	</div>
</body>
</html>