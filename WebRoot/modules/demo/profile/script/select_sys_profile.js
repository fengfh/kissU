function doSave() {
	if (!profile_select_grid.getSelectedRowData()) {
		$.messageBox.warning({message:"您先选择要比照复制的环境！"});
		return;
	}
	
	$.messageBox.confirm({message:"您确定要把" + profile_select_grid.getSelectedRowData().NAME + "中的所有参数复制过来吗？",callback:function(result) {
		if (result) {
			$.dataservice("spring:profileService.copyProfile", {
					sourceProfileId : profile_select_grid.getSelectedRowData().ID,
					destinationProfileId : destinationProfileId
				}, function(response) {
					$.dialogReturnValue(true);
					$(document).dialogClose();
				});
		}
	}});
	
	
}

function doOnRowSelected(rowIndex, colIndex) {
	profile_select_grid.setCellValue(rowIndex, "_SELECT", 1);
}

function doOnCheck(rowIndex, colIndex, state) {
	profile_select_grid.selectRow(rowIndex, true);
}