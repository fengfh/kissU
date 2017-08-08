function doSave() {
	var valInfo = $.validation.validate("#SYS_PROFILE_EDIT_FORM");
	if (valInfo.isError)
		return;
	var profile = $('#SYS_PROFILE_EDIT_FORM').toJson();
	$.dataservice("spring:profileService.saveOrUpdateProfile", profile, function(response) {
				$.dialogReturnValue(true);
				$(document).dialogClose();
			});
}

function checkUniqueProfileName() {
	var profileName = document.getElementById('name').value;

	var profileId = document.getElementById('id').value;
	var exists = null;
	$.dataservice("spring:profileService.checkUniqueProfileName", {
				profileName : profileName,
				profileId : profileId
			}, function(response) {
				exists = response;
			}, {
				async : false
			});
	if (exists) {
		return {
			isError : true,
			errorInfo : "环境名称不能重复!"
		};
	} else {
		return {
			isError : false,
			errorInfo : ""
		};
	}
}