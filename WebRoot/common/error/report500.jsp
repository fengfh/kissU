<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@include file="/common/taglibs.jsp"%>

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:tvns>
<head>
	<title>
		查看详细出错信息
	</title>
	<%@include file="/common/meta.jsp"%>
    <ui:combine widgets="dialog">
    	<script language="javascript" src="${contextPath}/common/error/report.js"></script>
    </ui:combine>
</head>

<body class="container-body">
	<div class="apply-page">
		<div class="page-title">
			<h2>
				查看详细出错信息
			</h2>
		</div>
		
		<div class="container-fluid">
			<form action="${contextPath}/common/error/errorInfo.jsp" method="post" target="iframeForErrorInfo" id="formForSave" class="form-horizontal">
				<!-- panel 内容 start -->
				<div class="panel apply-panel">
					<!-- panel 头部内容 start -->
					<div class="panel-head">
						<div class="row-fluid">
							<div class="span6 first">							
								查看详细出错信息
							</div>
							<div class="span6"></div>	
						</div>
						<a href="#" class="toggle"></a>
					</div>
					<!-- panel 头部内容 end -->
					
					<!-- panel 中间内容 start -->
					<div class="panel-content">
						<TEXTAREA id="detailMessage" name="detailMessage" style="width:100%; height:300px;margin-bottom: 10px;"></TEXTAREA>
					</div>
					<!-- panel 中间内容 end -->
                    <div class="panel-foot">
						<div class="form-actions col2-fluid">
							<button type="button" class="btn"  onclick="javascript:saveReport500();">保&nbsp;存</button>
							<button type="button" class="btn" onclick="$(this).dialogClose();">关&nbsp;闭</button>
						</div>
					</div>
				</div>
				<!-- panel 内容 end -->
			</form>
		</div>
	</div>
	<script language="javascript">
	     document.getElementById('detailMessage').value = $.dialogAraguments().errorThrown;
	</script>
	
	<iframe name="iframeForErrorInfo" width="1px" height="1px" style="display:none" >
	</iframe>
	</body>
</html>