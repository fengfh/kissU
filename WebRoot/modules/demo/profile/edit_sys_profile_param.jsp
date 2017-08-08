<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@include file="/common/taglibs.jsp"%>

<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>
			${title}
		</title>
		<%@include file="/common/meta.jsp"%>
		<ui:combine widgets="validator,inputpro,blockui,dialog"></ui:combine>
		<ui:script src="/modules/demo/profile/script/edit_sys_profile_param.js"></ui:script>
	</head>
	
	<body class="container-body">
		<div class="apply-page">
			<div class="page-title">
				<h2>
					${title}
				</h2>
			</div>
			
			<div class="container-fluid">
		        <form id="SYS_PROFILE_PARAM_EDIT_FORM" action="#" data-widget="validator" class="form-horizontal" >
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
							<table class="form-table col2-fluid" >
								<!--<caption>基本信息</caption>-->
								<tbody>
								    <input type="hidden" name="profileId" id="profileId" value="${param.profileId}"/>
						            <input type="hidden" name="id" id="id" value="${profile.id}"/>
						            <tr>
										<th>
											参数名称：
										</th>
										<td>
											<input type="text" id="name" value="${profile.name}" data-validator="required,func[checkUniqueProfileParamName]" maxlength="50"  style="width: 97%;" class="input-large"/>
										</td>
									</tr>
									<tr>
										<th>
											参数值：
										</th>
										<td>
											<input type="text" id="value" value="${profile.value}" data-validator="required" maxlength="50"  style="width: 97%;" class="input-large"/>
										</td>
									</tr>
									<tr>
										<th>参数描述：</th>
										<td height="100px">
											<textarea id="description" style="width: 97%;overflow: auto;" data-validator="length[0,300]" rows="6" class="input-large">${profile.description}</textarea>
										</td>
									</tr>
								</tbody>
							</table>							
						</div>
						<!-- panel 中间内容 end -->
	                    <div class="panel-foot">
							<div class="form-actions col2-fluid">
								<button type="button" class="btn"  onclick="doSave();return false;">保&nbsp;存</button>
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