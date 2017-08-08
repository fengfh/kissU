<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>

<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>${title}</title>
		<%@ include file="/common/meta.jsp"%>
		<ui:combine widgets="dhtmlxgrid,dialog,messagebox"></ui:combine>
		<ui:script src="modules/demo/profile/script/select_sys_profile.js"></ui:script>
		<script>
			var destinationProfileId = '${destinationProfileId}';
		</script>
	</head>
	
	<body class="container-body">
		<div class="apply-page">
			<div class="page-title">
				<h2>
					${title}
				</h2>
			</div>
			
			<div class="container-fluid">
		        <form id="SYS_PROFILE_EDIT_FORM" action="#" data-widget="validator" class="form-horizontal" >
					<!-- panel 内容 start -->
					<div class="panel apply-panel">
						<!-- panel 头部内容 start -->
						<div class="panel-head">
							<div class="row-fluid">
								<div class="span6 first">							
									${title}
								</div>
								<div class="span6"></div>	
							</div>
							<a href="#" class="toggle"></a>
						</div>
						<!-- panel 头部内容 end -->
						
						<!-- panel 中间内容 start -->
						<div class="panel-content">
							<!-- 数据列表样式 -->
							<dg:grid container="profile_div" id="profile_select_grid" onRowClick="doOnRowSelected" onCellCheck="doOnCheck">
								<dg:datasource selectSqlId="demo.profile.getProfiles" includePageParams="true"></dg:datasource>
								<dg:column id="_SELECT" width="8" header="选择" type="ra" frozen="false" align="center"></dg:column>
								<dg:column id="ID" width="0" header="环境id" type="ro" frozen="false" isKey="true"></dg:column>
								<dg:column id="NAME" width="21" header="环境名称" type="ro" frozen="false"></dg:column>
								<dg:column id="DESCRIPTION" width="46" header="环境描述" type="ro" frozen="false"></dg:column>
								<dg:column id="GLOBAL" width="8" header="是否全局" type="ro" frozen="false" align="center"></dg:column>
								<dg:column id="ACTIVATE" width="8" header="是否启用" type="ro" frozen="false" align="center"></dg:column>
								<dg:page enabled="false"></dg:page>
							</dg:grid>
						</div>
						<!-- panel 中间内容 end -->
	                    <div class="panel-foot">
							<div class="form-actions col2-fluid">
								<button type="button" class="btn"  onclick="doSave();return false;">复&nbsp;制</button>
								<button type="button" class="btn" onclick="$(this).dialogClose();">关&nbsp;闭</button>
							</div>
						</div>
					</div>
					<!-- panel 内容 end -->
				</form>
			</div>
		</div>
	</body>
</html>