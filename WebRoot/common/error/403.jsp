<!DOCTYPE html>
<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>

<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<%@include file="/common/meta.jsp" %>
		<title>系统信息</title>
		<ui:combine widgets="dialog">
			<link href="${contextPath}/statics/themes/${theme}/module/error/error.css" rel="stylesheet" type="text/css" />
			<script language="javascript" src="${contextPath}/common/error/report.js"></script>
		</ui:combine>
	</head>
	
	<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
		<!-- 错误提示面板 start-->
		<div class="wrapper-error">
			<div class="error-img">
		    	<div class="img-403"></div>
		        <p>Oops... Access Forbidden!</p>
		    </div>
			<div class="error-info">
		    	<h2>很抱歉，您没有访问该页面的权限！</h2>
		        <p><strong>您可以：</strong><br/>
		        	1、与管理员确认是否有该页面的访问权限<br/>
		            2、<a href="#" id="backLink">返回前页</a>
		        </p>
			</div>					
		</div>
	</body>
</html>