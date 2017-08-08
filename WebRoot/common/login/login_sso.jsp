<%@page pageEncoding="UTF-8" %><%@page import="java.net.URLEncoder"%><%
	request.getRequestDispatcher("/openid/login?return_url=" + URLEncoder.encode(request.getParameter("returnUrl"),"UTF-8")).forward(request,response);
%>