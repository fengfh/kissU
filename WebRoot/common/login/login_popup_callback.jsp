<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<%@ include file="/common/meta.jsp"%>
		<ui:combine widgets="dialog"></ui:combine>
		<script type="text/javascript">
		    $(document).ready(function () {
		        $("body").dialogClose();
		    })
		</script>
	</head>
	<body>
	</body>
</html>