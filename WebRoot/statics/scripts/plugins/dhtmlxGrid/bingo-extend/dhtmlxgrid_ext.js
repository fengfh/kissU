// 兼容attachEvent事件绑定
if (!window.attachEvent) {
	window.attachEvent = function(eventType, eventHandler) {
		window.addEventListener(eventType.substring(2), eventHandler, false);
	};
}
if (!document.attachEvent) {
	document.attachEvent = window.attachEvent;
}

/**
 * 显示遮罩层
 * 
 * @param {}
 *            message
 */
dhtmlXGridObject.prototype.showWaitingBox = function(message) {
	if (this.messageBox == undefined) {
		this.messageBox = document.createElement("div");
		this.messageBox.id = "processing-mask";
		this.entBox.appendChild(this.messageBox);
		this.divHTML = "<div id=\"processing\"><div class=\"processing-indicator\"><img src=\"" + __grid_home_dir + 'bingo-extend/images/'
				+ "loading/actionloading.gif\" align=\"absmiddle\"/>" + message + "</div></div>";
		this.messageBox.innerHTML = this.divHTML;
	}
	this.messageBox.style.display = "";
	if (this.globalBox && this.messageBox.times != 1) {
		this.globalBox.appendChild(this.messageBox);
		this.messageBox.times = 1;
	}
}

/**
 * 隐藏遮罩层
 */
dhtmlXGridObject.prototype.hideWaitingBox = function() {
	this.messageBox.style.display = "none";
}

/**
 * 到处表格数据到Excel
 */
dhtmlXGridObject.prototype.exportToExcel = function() {
	if (this.rowsBuffer.length > 65000) {
		alert("您要导出的数据超过了65000行，建议您设定查询条件缩小数据范围后再导出");
		return;
	}

	var doExport = true;

	if (this.rowsBuffer.length >= 5000) {
		doExport = confirm('共计有' + this.rowsBuffer.length + '条数据需要导出，可能会比较慢，确认要导出吗？');
	}

	if (doExport) {
		this.showWaitingBox();
		this.excelLoader.loadXML(this.exportURI, "POST", JSON.valueOf({
							limit : this.limited,
							orderBy : this.orderBy,
							filterSet : this.filterSet,
							total : this.rowsBuffer.length,
							fileName : this.fileName,
							dataExporter: this.dataExporter,
							rowConverter: this.rowConverter,
							exportColumnIds: this.exportColumnIds,
							exportColumnHeaders: this.exportColumnHeaders,
							exportColumnTypes: this.exportColumnTypes,
							templateFileName: this.templateFileName,
							exportColumnAligns: this.exportColumnAligns
						}), true);
	}
}

/**
 * 根据查询条件查询数据
 */
dhtmlXGridObject.prototype.doSearch = function() {
	var conditionForm = null;
	if (typeof(arguments[0]) == "string") {
		conditionForm = arguments[0];
	}
	conditionForm = conditionForm || document.getElementById(this.id + "_form") || document.getElementsByName(this.id + "_form")[0]
			|| document.forms[0];

	var ignoreCheckChange = arguments[1] || true;
	var saveDataMethod = arguments[2];

	var isDefinedSaveMethod = typeof(saveDataMethod) == "function" || typeof(saveByChangePage) == "function";

	if (!ignoreCheckChange && this.wasChanged() && isDefinedSaveMethod && confirm("您修改了部分数据，如果不保存，修改不会生效，\n 您确定要保存吗？")) {

		if (typeof(saveDataMethod) == "function") {
			saveDataMethod();

		} else if (typeof saveByChangePage != 'undefined') {
			saveByChangePage();
		}
	}

	// 重置查询条件
	this.filterSet = {};

	// 这里使用jquery的扩展方法，后面应该改成不依赖于任何js框架
	if (conditionForm) {
		this.filterSet = $(conditionForm).toJson();
	}
	// 附加固定参数
	if (this.fixedQueryCondition) {
		for (var property in this.fixedQueryCondition) {
			this.filterSet[property] = this.fixedQueryCondition[property];
		}
	}

	// 支持直接通过参数传递json对象作为查询条件
	if (typeof(arguments[0]) == "object") {
		for (var property in arguments[0]) {
			this.filterSet[property] = arguments[0][property];
		}
	}

	// grid支持首次不渲染，因此查询后需要自动展示grid
	this.entBox.style.display = "block";
	if (this._pgn_parentObj)
		this._pgn_parentObj.style.display = "block";
	var xmlFileUrl = this.xmlFileUrl;
	this.clearAndLoad(xmlFileUrl);
}

/**
 * 设置固定查询条件
 * 
 * @param {}
 *            queryCondtionAsJson
 */
dhtmlXGridObject.prototype.setFixedQueryCondition = function(queryCondtionAsJsonString) {
	if (typeof(queryCondtionAsJsonString) == "string") {
		try {
			queryCondtionAsJsonString = eval("(" + queryCondtionAsJsonString + ")");
			for (var property in queryCondtionAsJsonString) {
				this.filterSet[property] = queryCondtionAsJsonString[property];
			}
		} catch (e) {
			alert("传入的fixedQueryCondition查询条件不是合格的json表达式：" + queryCondtionAsJsonString);
			return;
		}
	}
	this.fixedQueryCondition = queryCondtionAsJsonString;
}

/**
 * 根据查询既定查询条件刷新表格
 */
dhtmlXGridObject.prototype.refresh = function(callback) {
	cp = this.currentPage;
	grid = this;
	if (this.wasChanged() && !confirm("您修改了部分数据，如果不保存，修改不会生效，\n 您确定要刷新吗？")) {
		return;
	}
	var xmlFileUrl = this.xmlFileUrl;
	if (!callback) {
		callback = function() {
			grid.changePage(cp);
		}
	}
	this.clearAndLoad(xmlFileUrl, function(){callback(grid, cp, Math.ceil(grid.rowsBuffer.length/grid.rowsBufferOutSize))});
}

/**
 * 显示或隐藏表格
 * 
 * @param {}
 *            showOrHide true 显示 false 隐藏
 */
dhtmlXGridObject.prototype.showOrHideGrid = function(showOrHide) {
	var state = convertStringToBoolean(showOrHide) ? "block" : "none";
	if (this.globalBox) {
		this.globalBox.style.display = state;
	} else {
		this.entBox.style.display = state;
	}

	if (this._pgn_parentObj)
		this._pgn_parentObj.style.display = state;
}

/**
 * 设置grid默认的键盘按键事件
 */
dhtmlXGridObject.prototype.doOnCtrlCPressed = function(code, ctrl, shift) {
	if (code == "67" && ctrl) {
		if (!this._selectionArea)
            return alert("You need to select a block area in grid first");
        this.setCSVDelimiter("\t");
        this.copyBlockToClipboard();
	}
}

/**
 * 初始化表格信息
 * 
 * @param {}
 *            seting 配置信息
 */
dhtmlXGridObject.prototype.initSetting = function(setting) {
	var attrs = ["label", "width", "type", "align", "sort", "color", "format", "hidden", "id"];
	var calls = ["setHeader", "setInitWidthsP", "setColTypes", "setColAlign", "setColSorting", "setColumnColor", "setFormat", "", "setColumnIds"];
	// 初始化grid的配置
	for (var i = 0; i < attrs.length; i++) {
		if (calls[i] && setting[attrs[i]]) {
			this[calls[i]](setting[attrs[i]].replace(new RegExp("null", "gm"), ""));

		}
	}
	// 设置列的隐藏情况
	this.init();
	
	if (this.setColHidden && setting["hidden"] && setting["hidden"].replace(/,/g, "") != "")
		this.setColHidden(setting["hidden"]);
	// 配置列的格式信息
	if (setting["format"]) {
		var formats = setting["format"].split("^");
		for (var i = 0; i < this.cellType.length; i++) {
			if (formats[i]) {
				if ((this.cellType[i].toLowerCase().indexOf("calendar") != -1)) {
					this.setDateFormat(formats[i], i);
				} else {
					this.setNumberFormat(formats[i], i);
				}
			}
		}
	}
	// 设置遮罩层
	this.attachEvent("onXLS", function() {
				this.showWaitingBox("正在查询数据，请稍候...");
			});
	this.attachEvent("onXLE", function() {
				//this.selectRow(0,true);
				this.hideWaitingBox();
			});
	// 设置编辑事件模式
	this.enableEditEvents(true, false, true);

	// 设置表格的关键字
	this.keyField = setting["keyField"];
}

/**
 * 设置每列的转换格式
 */
dhtmlXGridObject.prototype.setFormat = function(formatStr) {
	this.cellFormat = formatStr.split("^");
}

/**
 * 获取指定单元格的值
 * 
 * @param {}
 *            rowId 行号
 * @param {}
 *            columnName 列的ID
 * @return {}
 */
dhtmlXGridObject.prototype.getCellValue = function(rowId, columnName) {
	return this.getCellObject(rowId, columnName).getValue();
}

/**
 * 设定指定单元格的值
 * 
 * @param {}
 *            rowId 行号
 * @param {}
 *            columnName 列的ID
 * @return {}
 */
dhtmlXGridObject.prototype.setCellValue = function(rowId, columnName, value) {
	this.getCellObject(rowId, columnName).setValue(value);
}

/**
 * 获取指定单元格的对象
 * 
 * @param {}
 *            rowId 行号
 * @param {}
 *            columnName 列的ID
 * @return {}
 */
dhtmlXGridObject.prototype.getCellObject = function(rowId, columnName) {
	if (isNaN(columnName))
		return this.cells2(this.getRowIndex(rowId), this.getColIndexById(columnName));
	return this.cells2(this.getRowIndex(rowId), columnName);
}

/**
 * 获取用户修改的信息，以json的方式返回
 */
dhtmlXGridObject.prototype.getChangedData = function() {
	var modifiedIds = this.getChangedRows(true)._dhx_trim();
	if (modifiedIds == "") {
		return [];
	}
	modifiedIds = modifiedIds.split(this.delim);

	var jsons = [];

	for (var i = 0; i < modifiedIds.length; i++) {
		var json = {};
		for (var j = 0; j < this.columnIds.length; j++) {
			if (this.columnIds[j] != "undefined" && this.columnIds[j].length != 0) {
				json[this.columnIds[j]] = this.getCellValue(modifiedIds[i], this.columnIds[j]);
			}
		}
		jsons[i] = json;
	}
	return jsons;
}

/**
 * 检查表格数据是否有被修改
 */
dhtmlXGridObject.prototype.wasChanged = function() {
	return this.getChangedRows(true)._dhx_trim() != "";
}

/**
 * 获取全选列被选中的行ID
 * 
 * @param {}
 *            columnName 全选列名称
 * @return {} 逗号分隔开
 */
dhtmlXGridObject.prototype.getCheckedRowIds = function(columnName) {
	if (!columnName) {
		columnName = "_checkAll";
	}
	return this.getCheckedRows(this.getColIndexById(columnName));
}

/**
 * 获取所有选中行的关键字集合，逗号分隔开
 * 
 * @param {}
 *            columnName 全选列名称
 */
dhtmlXGridObject.prototype.getCheckedKeyFields = function(columnName) {
	if (this.keyField == "" || this.keyField.length == 0) {
		alert("表格的关键字没有设置，请设置表格的关键字后才能使用该方法");
		return "";
	}
	if (!columnName) {
		columnName = "_checkAll";
	}
	var checkedRowIds = this.getCheckedRowIds(columnName);
	if (checkedRowIds == "" || checkedRowIds.length == 0) {
		return "";
	}
	checkedRowIds = checkedRowIds.split(",");
	var keyFields = new Array(0);
	for (var i = 0; i < checkedRowIds.length; i++) {
		keyFields[keyFields.length] = this.getCellValue(checkedRowIds[i], this.keyField);
	}
	return keyFields.join(this.delim);
}

/**
 * 获取列名称
 * 
 * @param {}
 *            columnIndex 根据列的序号
 */
dhtmlXGridObject.prototype.getcolumnNameByIndex = function(columnIndex) {
	return this.getColumnId(columnIndex);
}

/**
 * 根据行号获取单行数据
 * 
 * @param {}
 *            rowId 行号
 */
dhtmlXGridObject.prototype.getRowData = function(rowId) {
	var cols = this.getColumnsNum();
	var rowData = {};
	for (var i = 0; i < cols; i++) {
		var key = this.getColumnId(i);
		rowData[key] = this.getCellValue(rowId, key);
	}
	return rowData;
}

/**
 * 获取单行选中的行数据信息
 */
dhtmlXGridObject.prototype.getSelectedRowData = function() {
	if (this.getSelectedRowId() == null) {
		return null;
	}
	return this.getRowData(this.getSelectedRowId());
}

/**
 * 用环境变量替换后再添加Footer
 * 
 * @param {}
 *            data
 * @param {}
 *            style
 */
dhtmlXGridObject.prototype.attachFooterByEnv = function(data, style) {
	var userd = this.UserData['gridglobaluserdata'];
	if (data && data.length > 0) {
		if (userd) {
			for (var i = 0; i < userd.keys.length; i++) {
				var value = userd.get(userd.keys[i]);
				value = value.replace(/,/gi, "\\,");
				data = data.replace(new RegExp("\\${" + userd.keys[i] + "}",
								"gi"), value);
			}
		}
		var data = data.split(this.delim);
	}
	this.attachFooter(data, style);
	this.setSizes();
}

document.write('<style type="text/css">');
document
		.write('#processing-mask{position:absolute;width:100%;height:100%;left:0;top:0;padding:2px;z-index:2000;background:#C1DDFF;filter:alpha(opacity=60);}');
document.write('#processing{position:absolute;left:45%;top:40%;padding:2px;z-index:100;height:auto;background:#93bdf7;}');
document.write('#processing img {margin-bottom:0px;margin-right:8px;height: 40px;width: 40px;}');
document.write('#processing .processing-indicator{color:#6596cf;font:bold 13px 宋体;padding:10px;border:1px solid #a3bad9;background: white;}');
document.write('</style>');