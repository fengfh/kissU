<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>

<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>系统参数维护</title>
		<%@ include file="/common/meta.jsp"%>
		<ui:combine widgets="dhtmlxgrid,dialog,multiselect,messagebox"></ui:combine>
		<ui:script src="modules/demo/profile/script/list_sys_profile.js"></ui:script>
	</head>
	
	<body class="container-body">
	    <!--搜索框 -->
		<div class="container-fluid">
			<div class="grid-page">
				<div class="page-title">
					<h2>配置列表</h2>
				</div>	
				<div class="panel search-panel">
					<div class="panel-head">
						<div class="row-fluid">
							<div class="span6 first">
								<i class="icon-list-alt"></i>
								查询条件
							</div>
							<div class="span6"></div>
						</div>
						<a href="#" class="toggle"></a>	
					</div>
					<div class="panel-content">
						<div class="toolbar">
						<form id="queryForm" style="margin: 0px;">
							<table>
							    <!--
								<tr>
									<td class="btn-toggle" rowspan="5">									
										<a href="###" data-widget="btn-toggle" data-options="{rel:'.toggle-content2'}"  title="高级选项"><i class="icon-plus2"></i></a>
									</td>
								</tr>
							    -->
								<tr>
								    <th>
										 环境名称：
									</th>
									<td>
										<input type="text" name="name" id="name" class="input-large"/>
									</td>
									<th>
										是否启用：
									</th>
									<td>
										<select name='activate' multiple="multiple" data-widget="multiselect">
											<option value='' selected="selected"></option>
											<option value='1'>启用</option>
											<option value='0'>未启用</option>
										</select>
									</td>
									<th>
										是否全局：
									</th>
									<td>
										<select name='global' multiple="multiple" data-widget="multiselect">
											<option value='' selected="selected"></option>
											<option value='1'>全局</option>
											<option value='0'>非全局</option>
										</select>
									</td>
									<td class="toolbar-btns" rowspan="3">
										<button type="button" class="btn" onclick="profile_grid.doSearch();">查询</button>
										<button type="button" class="btn"/ onclick="document.forms['queryForm'].reset();">重置</button>
									</td>
								</tr>
							</table>
							</form>				
						</div>	
					</div>
				</div>
			
				<!-- 列表框 -->
				<div class="panel grid-panel">
						<div class="panel-head">
							<div class="row-fluid">
								<div class="span6 first">
									<i class="icon-list-alt"></i>
									环境信息列表
								</div>
								<div class="span6">
									<!-- 工具栏  -->	
									<div class="pull-right">
									    <security:isAllow privilege="USER_MANAGE$CREATE_USER">
										    <a class="btn" href="javascript:void(0);" onclick="createProfile()"><i class="icon-plus"></i>新建环境</a>	
										</security:isAllow>
									</div>
								</div>
							</div>
							<a href="#" class="toggle"></a>	
						</div>
						<div class="panel-content">
							<dg:grid container="profile_div" id="profile_grid" autoHeight="true" minHeight="120" onRowClick="doOnProfileSelect" onAfterDataLoad="doOnAfterDataLoad">
								<dg:datasource selectSqlId="demo.profile.getProfiles"></dg:datasource>
								<dg:operationColumn onBeforeMenuRender="doOnBeforeMenuRender">
									<dg:action label="启用全局参数" onClick="activateGlobalProfile" id="activate_global_profile" icon="/statics/images/ico_start.gif"></dg:action>
									<dg:action label="停用全局参数" onClick="inactivateGlobalProfile" id="inactivate_global_profile" icon="/statics/images/ico_pause.gif"></dg:action>
									<dg:action label="设为当前环境" onClick="activateProfile" id="activate_profile" icon="/statics/images/ico_start.gif"></dg:action>
									<dg:action label="修改" onClick="updateProfile" id="update_profile" icon="/statics/images/ico_edit.gif"></dg:action>
									<dg:action label="删除" onClick="deleteProfile" id="delete_profile" icon="/statics/images/ico_del.gif"></dg:action>
									<dg:action label="从其他环境复制" onClick="copyProfile" id="copy_profile" icon="/statics/images/icon_copy.gif"></dg:action>
								</dg:operationColumn>
								<dg:column id="ID" width="0" header="环境id" type="ro" frozen="false" isKey="true"></dg:column>
								<dg:column id="NAME" width="25" header="环境名称" type="ro" frozen="false"></dg:column>
								<dg:column id="DESCRIPTION" width="50" header="环境描述" type="ro" frozen="false"></dg:column>
								<dg:column id="GLOBAL" width="8" header="是否全局" type="ro" frozen="false" align="center"></dg:column>
								<dg:column id="ACTIVATE" width="8" header="是否启用" type="ro" frozen="false" align="center"></dg:column>
								<dg:page enabled="false"></dg:page>
							</dg:grid>
						</div>
				</div>
				
				<!-- 列表框 -->
				<div class="panel grid-panel">
						<div class="panel-head">
							<div class="row-fluid">
								<div class="span6 first">
									<i class="icon-list-alt"></i>
									环境参数列表
								</div>
								<div class="span6">
									<!-- 工具栏  -->	
									<div class="pull-right">
									    <security:isAllow privilege="USER_MANAGE$CREATE_USER">
										    <a class="btn" href="javascript:void(0);" onclick="createProfileParameter()"><i class="icon-plus"></i>新建参数</a>	
										</security:isAllow>
									</div>
								</div>
							</div>
							<a href="#" class="toggle"></a>	
						</div>
						<div class="panel-content">
							<dg:grid container="profile_parameter_div" id="profile_parameter_grid" autoHeight="true" loadOnFirst="false">
								<dg:datasource selectSqlId="demo.profile.getProfileParams"></dg:datasource>
								<dg:operationColumn onBeforeMenuRender="doOnBeforeMenuRender">
									<dg:action label="修改" onClick="updateProfileParameter" id="update_profile_parameter" icon="/statics/images/ico_edit.gif"></dg:action>
									<dg:action label="删除" onClick="deleteProfileParameter" id="delete_profile_parameter" icon="/statics/images/ico_del.gif"></dg:action>
								</dg:operationColumn>
								<dg:column id="ID" width="0" header="参数id" type="ro" frozen="false" isKey="true"></dg:column>
								<dg:column id="NAME" width="25" header="参数名称" type="ro" frozen="false"></dg:column>
								<dg:column id="VALUE" width="25" header="参数值" type="ro" frozen="false"></dg:column>
								<dg:column id="DESCRIPTION" width="40" header="参数描述" type="ro" frozen="false"></dg:column>
							</dg:grid>
						</div>
				</div>
			</div>
		</div>
	</body>
</html>