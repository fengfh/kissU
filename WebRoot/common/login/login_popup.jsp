<!DOCTYPE html>
<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="bingo.security.SecurityContext"%>
<%@include file="/common/taglibs.jsp"%>
<%
	String username = request.getParameter("username");
	String password = request.getParameter("password");

	if ("login".equals(request.getParameter("action"))) {
		if (null == username || "".equals(username.trim())) {
			request.setAttribute("errors", "请输入登录帐号");
		} else {
			if (SecurityContext.getProvider().validateUser(username, password)) {
				SecurityContext.getProvider().signIn(request, username);

				String returnUrl = request.getParameter("returnUrl");
				if (null != returnUrl && !"".equals(returnUrl)) {
					response.sendRedirect(returnUrl);
				} else {
					response.sendRedirect("/" + request.getContextPath());
				}
			} else {
				request.setAttribute("errors", "用户名或密码不正确");
			}
		}
	}
	
	String errors = (String) request.getAttribute("errors");
	boolean isError = null != errors && !"".equals(errors.trim());
%>

<html>
	<head>
		<title>系统登录</title>
		<%@include file="/common/meta.jsp"%>
		<link href="${contextPath}/statics/scripts/plugins/dialog/jquery.dialog.css" type="text/css" rel="stylesheet"/>
		<ui:combine>
			<link rel="stylesheet" type="text/css" href="${contextPath}/statics/themes/${theme}/module/login/login-popup/login.css" />
			<script type="text/javascript" src="${contextPath}/common/login/login.js"></script>
		</ui:combine>
	</head>
	
	<body  class="container-popup">
	<!-- form-content 场景 -->
	<div class="form-page">
		<!-- 页面标题 -->
		<div class="page-title">
		</div>
		<div class="container-fluid">
			<div class="login-box">
		        <div class="login">
		        	<!-- 用户登录信息 start-->
		            <div class="login-form">
		            	<form method="post" action="${contextPath}/common/login/login_popup.jsp" target="_self">
		                    <!-- login 表单数据 -->
		                    <div class="errormsg">
		                    <%
								if (isError) {
							%>
							    
		                        	<%=errors%>
		                    <%
								}
							%>
							</div>
							<input type="hidden" name="returnUrl" value="<%=request.getParameter("returnUrl")%>"/>
			                <input type="hidden" name="action" value="login"/>
			
		                    <div class="input-group">
		                    	<label>用户名</label>
		                        <input type="text" id="username" name="username" onkeydown="if(event.keyCode == 13||event.which == 13){doSubmit();}" tabindex="1" accesskey="u"/>
		                    </div>
		                    
		                    <div class="input-group">
		                    	<label>密码</label>
		                        <input type="password" id="password" name="password" onkeydown="if(event.keyCode == 13||event.which == 13){doSubmit();}"  tabindex="2" accesskey="p"/>
		                    </div>
		                        
		                    <div class="input-group">
		                        <label></label>
		                        <button type="button" class="btn btn-blue" onclick="javascript:doSubmit();">登录</button>
		                        <button type="button" class="btn btn-blue" onclick="javascript:window.close();">取消</button>
		                    </div>
		                </form>
		            </div>
					<!-- 用户登录信息 end-->
		        </div>
		    </div>
		</div>
	</div>
	</body>
</html>