$(document).ready(function() {
			var backLink = $("#backLink");
			if (backLink.length > 0) {
				if (opener || window.dialogArguments) {
					backLink.bind("click", function() {
								closeWindow();
							});
					backLink.text("关闭窗口");
				} else {
					backLink.bind("click", function() {
								goBack();
							});
					backLink.text("返回前页");
				}
			}

			$(document).bind("keypress", function() {
						if ((window.opener || window.dialogArguments) && window.event.keyCode == 27) {
							closeWindow();
						}
					});
		});

/**
 * open 500 report window
 */
function openReport500() {
	jQuery.open(Global.contextPath+'/common/error/report500.jsp', 700, null,{errorThrown:$("#errorMessage").val()});
}

/**
 * save message text
 */
function saveReport500() {
	$("#formForSave").submit();
}

function closeWindow() {
	$(document).dialogClose();
}

function goBack() {
	history.back();
}