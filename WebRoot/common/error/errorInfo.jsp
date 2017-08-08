<%@ page language="java" pageEncoding="UTF-8"%>
<%@page import="java.io.OutputStream"%>
<%
	response.setHeader("Content-Disposition", "attachment;filename=\"" +"ErrorInfo.txt"+ "\"");
	response.setHeader("Content-Transfer-Encoding", "binary");
	response.setHeader("Cache-Control", "must-revalidate, post-check=0, pre-check=0");
	response.setHeader("Pragma", "public");
	response.setDateHeader("Expires", (System.currentTimeMillis() + 2000));
	response.flushBuffer();
	if (null!=request.getParameter("detailMessage")) {
		response.getWriter().append(request.getParameter("detailMessage"));
	}
	response.flushBuffer();
%>