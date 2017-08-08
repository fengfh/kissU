<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="bingo.security.principal.IUser"%>
<%@page import="bingo.security.SecurityContext"%>
<%@include file="/common/taglibs.jsp"%>
<%
	IUser user = SecurityContext.getCurrentUser();
    String isLogin = user != null ? "true" : "false";
    String identity = user != null ? user.getId() : "";
%>
<script type="text/javascript">
    window.parent.ssoLoginBack(<%=isLogin %>,"<%=identity %>");
</script>