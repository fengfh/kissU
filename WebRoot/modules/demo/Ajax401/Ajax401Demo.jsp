<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:tvns>
<head>
    <title></title>
    <%@include file="/common/meta.jsp"%>
	<ui:combine widgets="dialog"></ui:combine>
	
    <script type="text/javascript">
        function ajax401() {
            $.ajax({
                url: Global.contextPath + "/dataservice?CommandName=spring:profileService.getProfile ",
                data:{profileId:1,b:3},
                type: "post",
                dataType: "json",
                contentType: 'application/json; charset=utf-8'                
            });
        }
     </script>
</head>
<body>
<br/>
<button onclick="ajax401()">ajax 401 call demo</button>
</body>
</html>