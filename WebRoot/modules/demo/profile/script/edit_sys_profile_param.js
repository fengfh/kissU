function doSave() {
	var valInfo = $.validation.validate("#SYS_PROFILE_PARAM_EDIT_FORM");
	if (valInfo.isError)
		return;
	var param = $('#SYS_PROFILE_PARAM_EDIT_FORM').toJson();
	$.dataservice("spring:profileService.saveOrUpdateProfileParameter", param,
			function(response) {
				$.dialogReturnValue(true);
				$(document).dialogClose();
			});
}

function checkUniqueProfileName() {
	var profileId = document.getElementById("profileId").value;
	var profileParamName = document.getElementById('name').value;
	var profileParamId = document.getElementById('id').value;
	var exists = null;
	$.dataservice("spring:profileService.checkUniqueProfileParameterName", {
				profileId : profileId,
				profileParameterName : profileParamName,
				profileParameterId : profileParamId
			}, function(response) {
				exists = response;
			}, {
				async : false
			});
	if (exists) {
		return {
			isError : true,
			errorInfo : "参数名称不能重复!"
		};
	} else {
		return {
			isError : false,
			errorInfo : ""
		};
	}
}