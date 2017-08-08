// 新建
function createProfile() {
	var url = '~/demo/profile/createProfile.do'
	$.open(url, 810, null, {}, function() {
				if ($.dialogReturnValue()) {
					profile_grid.refresh();
				}
			});
}

// 编辑
function updateProfile(grid, rowData, keyData) {
	if (keyData) {
		var url = '~/demo/profile/editProfile.do?profileId=' + keyData;
		$.open(url, 810, null, {}, function() {
					if ($.dialogReturnValue()) {
						grid.refresh();
					}
				});
	}
}

// 删除
function deleteProfile(grid, rowData, keyData) {
	if (keyData) {
		$.messageBox.confirm({
					message : "您确定要删除该环境对应的所有参数吗？",
					callback : function(result) {
						if (result) {
							$.dataservice(
									"spring:profileService.deleteProfile", {
										profileId : keyData
									}, function(response) {
										profile_grid.refresh();
									});
						}
					}
				});
	}
}

// 激活
function activateProfile(grid, rowData, keyData) {
	if (keyData) {
		$.messageBox.confirm({
					message : "您确定要设置当前系统运行环境是“" + rowData.NAME + "”吗？",
					callback : function(result) {
						if (result) {
							$.dataservice(
									"spring:profileService.activateProfile", {
										profileId : keyData
									}, function(response) {
										profile_grid.refresh();
									});
						}
					}
				});
	}
}

// 复制
function copyProfile(grid, rowData, keyData) {
	if (keyData) {
		var url = '~/demo/profile/copyProfile.do?profileId=' + keyData;
		$.open(url, 810, null, {}, function() {
					if ($.dialogReturnValue()) {
						grid.refresh();
					}
				});
	}
}

// 激活公共配置
function activateGlobalProfile(grid, rowData, keyData) {
	if (keyData) {
		$.messageBox.confirm({
					message : "您确定要启用“" + rowData.NAME + "”下的全局参数吗？",
					callback : function(result) {
						if (result) {
							$.dataservice(
									"spring:profileService.activateProfile", {
										profileId : keyData
									}, function(response) {
										profile_grid.refresh();
									});
						}
					}
				});
	}
}

// 失效公共配置
function inactivateGlobalProfile(grid, rowData, keyData) {
	if (keyData) {
		$.messageBox.confirm({
					message : "您确定要停用“" + rowData.NAME + "”下的全局参数吗？",
					callback : function(result) {
						if (result) {
							$
									.dataservice(
											"spring:profileService.inactivateGlobalProfile",
											{
												profileId : keyData
											}, function(response) {
												profile_grid.refresh();
											});
						}
					}
				});
	}
}

// 当选中某个环境配置
function doOnProfileSelect(rowIndex, colIndex) {
	if (null != profile_grid.getSelectedRowId()) {
		var profileId = profile_grid.getCellValue(rowIndex, "ID");
		profile_parameter_grid.doSearch({
					profileId : profileId
				});
	}
}

// 当表格数据加载后
function doOnAfterDataLoad(grid) {
	grid.selectRow(0, true);
	var btnCreateParam = $("#btnCreateParam");
	if (btnCreateParam) {
		if (grid.getRowsNum() == 0) {
			btnCreateParam.hide();
		} else {
			btnCreateParam.show();
		}
	}
}

/**
 * 控制权限范围内操作菜单的显示与否
 */
function doOnBeforeMenuRender(grid, rowData, menuItems) {
	menuItems.hideItem("activate_global_profile");
	menuItems.hideItem("inactivate_global_profile");
	menuItems.hideItem("activate_profile");
	if (rowData.GLOBAL == '是') {
		if (rowData.ACTIVATE == '是') {
			menuItems.showItem("inactivate_global_profile");

		} else {
			menuItems.showItem("activate_global_profile");
		}
	} else {
		if (rowData.ACTIVATE == '否') {
			menuItems.showItem("activate_profile");
		}
	}
	return true;
}

// 新建参数
function createProfileParameter() {
	if (profile_grid.getSelectedRowData() == null) {
		$.messageBox.info({
					message : "请选中特定环境后再行添加对应参数！"
				});
		return;
	}

	var url = '~/demo/profile/createProfileParameter.do?profileId='
			+ profile_grid.getSelectedRowData().ID;
	$.open(url, 500, null, {}, function() {
				if ($.dialogReturnValue()) {
					profile_parameter_grid.refresh();
				}
			});
}

// 编辑参数
function updateProfileParameter(grid, rowData, keyData) {
	if (keyData) {
		var url = '~/demo/profile/editProfileParameter.do?profileParameterId='
				+ keyData;
		$.open(url, 500, null, {}, function() {
					if ($.dialogReturnValue()) {
						grid.refresh();
					}
				});
	}
}

// 删除参数
function deleteProfileParameter(grid, rowData, keyData) {
	if (keyData) {
		$.messageBox.confirm({
					message : "您确定要删除该环境对应的所有参数吗？",
					callback : function(result) {
						if (result) {
							$
									.dataservice(
											"spring:profileService.deleteProfileParameter",
											{
												profileParameterId : keyData
											}, function(response) {
												profile_parameter_grid
														.refresh();
											});
						}
					}
				});
	}
}