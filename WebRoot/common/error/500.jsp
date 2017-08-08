<!DOCTYPE html>
<%@ page language="java" pageEncoding="UTF-8"%>
<%@ page isErrorPage="true"%>
<%@ page import="java.io.PrintWriter" %>
<%
	PrintWriter writer = new java.io.PrintWriter(out);
%>
<%@include file="/common/taglibs.jsp"%>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<%@include file="/common/meta.jsp" %>
		<title>500错误</title>
		<ui:combine widgets="dialog">
			<link href="${contextPath}/statics/themes/${theme}/module/error/error.css" rel="stylesheet" type="text/css" />
			<script language="javascript" src="${contextPath}/common/error/report.js"></script>
		</ui:combine>
		<style>
			html {
				overflow:hidden;
			}	
		</style>
	</head>
	
	<body>
		<!-- 错误提示面板 start-->
		<div class="wrapper-error">
			<div class="error-img">
		    	<div class="img-500"></div>
		        <p>Oops... Page Not Found!</p>
		    </div>
			<div class="error-info">
		    	<h2>很抱歉，内部服务器错误...</h2>
		        <p><strong>下面描述的情况可能导致此错误发生：</strong><br/>
		            1、如果您点击大部分链接后都出现此错误，那么系统可能正在更新维护中，导致系统服务暂时不能访问，请稍候再重试！<br/>
		            2、如果不是上述情况，那么系统可能出现了功能异常，请<b><a href="#" onclick="openReport500();">查看错误信息</a></b> ，并把错误信息保存后发送给相关处理人，我们将对问题做出分析并及时解决！<br/>
		        </p>
			</div>					
		</div>
		<!-- 错误提示面板 end-->

	    <textarea id="errorMessage" style="display:none">
			<%if(null != exception) exception.printStackTrace(writer);%>
		</textarea>
		<SCRIPT language="javascript">openReport500();</SCRIPT>
	</body>
</html>