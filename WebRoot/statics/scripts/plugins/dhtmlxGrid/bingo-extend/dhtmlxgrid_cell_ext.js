//var __grid_home_dir = Global.contextPath + "/widgets/dhtmlxGrid/";

/**
 * 改写getTitle方法，防止返回空格的title
 */
dhtmlXGridCellObject.prototype.getTitle = function() {
	var title = (_isIE ? this.cell.innerText : this.cell.textContent);
	if (title._dhx_trim() == '') {
		title = '';
	}
	return title;
}

/**
 * 操作菜单初始化 add by crazy_rain
 */
function initOptMenu(grid, menuContainerId, menuStyleClass, menuItems, dropdownMenu) {
	var eOptMenuDiv = document.createElement('div');
	grid.menuContainerId = menuContainerId;
	eOptMenuDiv.grid = grid;
	eOptMenuDiv.id = menuContainerId;
	eOptMenuDiv.style.display = 'none';
	eOptMenuDiv.className = menuStyleClass;
	document.body.appendChild(eOptMenuDiv);
	
	var menuItems = grid.menuItems;
	if (dropdownMenu) {
		var eUl = document.createElement('ul');
		for (var i = 0; i < menuItems.length; i++) {
			var eLi = document.createElement('li');
			if (menuItems[i].id) {
				eLi.id = menuItems[i].id;
			}
			var hh = "<a href='javascript:void(0);' onclick='document.getElementById(\"" + menuContainerId
					+ "\").style.display=\"none\";menuItemDelegate(\"" + menuItems[i].onClick + "\",\"" + menuContainerId + "\");'><img src='"
					+ Global.contextPath + menuItems[i].icon + "'/>" + menuItems[i].label + "</a>";
			eLi.innerHTML = hh;
			eUl.appendChild(eLi);
		}
		eOptMenuDiv.appendChild(eUl);
		
		eOptMenuDiv.onmouseout = function() {
			this.style.display = 'none';
		};
		eOptMenuDiv.onmouseover = function() {
			this.style.display = '';
		};
		
		// 处理好menuItems数据
		for (var i = 0; i < menuItems.length; i++) {
			menuItems[menuItems[i].id] = $("#" + menuItems[i].id);
		}
		
		menuItems.showItem = function(itemName) {
			if (this[itemName]) {
				this[itemName].show();
			}
		}
		menuItems.hideItem = function(itemName) {
			if (this[itemName]) {
				this[itemName].hide();
			}
		}
	}
}

function menuItemDelegate(menuItemOnClickName, menuContainerId, rowIndex) {
	try {
		var menuItemOnClick = eval(menuItemOnClickName);
		if ("function" != typeof(menuItemOnClick)) {
			alert(menuItemOnClickName + "必须是一个函数");
			return;
		}
	} catch (e) {
		alert(menuItemOnClickName + "函数没有定义");
	}

	// 如果是操作列是下拉菜单
	var menuContainer = document.getElementById(menuContainerId);
	var grid = menuContainer.grid;
	var rowData = null;
	if (menuContainer.rowIndex != undefined) {
		rowData = grid.getRowData(menuContainer.rowIndex);
	} else {
		rowData = grid.getRowData(rowIndex);
	}
	
	if (grid.keyField.length > 0) {
		var keyFieldNames = grid.keyField.split(",");
		if (keyFieldNames.length == 1) {
			menuItemOnClick.call(grid, grid, rowData, rowData[grid.keyField]);
		} else {
			var keyValue = {};
			var keyFields = grid.keyField.split(",");
			for (var i=0; i<keyFields.length; i++) {
				keyValue[keyFields[i]] = rowData[keyFields[i]];
			}
			menuItemOnClick.call(grid, grid, rowData, keyValue);
		}
	} else {
		alert("您没有给grid定义任何的主键！");
	}
}

function mousePosition(ev) {
	var pos = (ev.pageX || ev.pageY) ? {
		x : ev.pageX,
		y : ev.pageY
	} : {
		//x : ev.clientX + document.body.scrollLeft - document.body.clientLeft,
		//y : ev.clientY + document.body.scrollTop - document.body.clientTop
		x : ev.clientX + document.documentElement.scrollLeft - document.body.clientLeft,
		y : ev.clientY + document.documentElement.scrollTop - document.body.clientTop
	};
	return pos;
}

function showOptMenu(event, menuContainer, rowIndex, colIndex) {
	if ("undefined" ==menuContainer) {
		return;
	}
	var menuContainerObject = document.getElementById(menuContainer);
	menuContainerObject.rowIndex = rowIndex;
	menuContainerObject.colIndex = colIndex;
	event = event || window.event
	var _e = _isIE ? event.srcElement : event.target;
	var x = _e.offsetLeft;
	var y = _e.offsetTop;
	while (_e = _e.offsetParent) {
		x += _e.offsetLeft;
		y += _e.offsetTop;
	}
	var pos = mousePosition(event);

	y = (y - pos.y) > 10 ? pos.y : y;

	x += 10;
	//var bodyHeight = document.body.clientHeight;
	var bodyHeight = Math.max(document.body.offsetHeight,document.body.clientHeight);
	var menuHeight = document.getElementById(menuContainer).clientHeight;
	if (menuHeight + y > bodyHeight) {
		y = bodyHeight - menuHeight - 16;
	}
	// 触发弹出操作菜单事件
	var grid = document.getElementById(menuContainer).grid;
	var menuItems = grid.menuItems;
	if (!grid.callEvent("onBeforeOperationMenuPopup", [grid, grid.getRowData(rowIndex), menuItems])) {
		return;
	}

	var liList = document.getElementById(menuContainer).getElementsByTagName('LI');
	var allMenuIsHidden = true;
	for (var i = 0; i < liList.length; i++) {
		if (liList[i].style.display != 'none') {
			allMenuIsHidden = false;
			break;
		}
	}
	if (allMenuIsHidden) {
		return;
	}
	document.getElementById(menuContainer).style.position = 'absolute';
	document.getElementById(menuContainer).style.left = x + 'px';
	document.getElementById(menuContainer).style.top = y + 'px';
	document.getElementById(menuContainer).style.display = '';
	document.getElementById(menuContainer).style.zIndex = 9999;
}

function hideOptMenu(menuContainer) {
	if ("undefined" == menuContainer) {
		return;
	}
	document.getElementById(menuContainer).style.display = 'none';
}

// -------------------------------------------操作列（菜单模式）----------------------------------------------------------
function eXcell_opt(cell) {
	try {
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	} catch (er) {
	}
	this.getValue = function() {
		if (this.cell.realValue)
			return this.cell.realValue;
		if (this.cell.firstChild.tagName == "IMG")
			return this.cell.firstChild.src + (this.cell.titFl != null ? "^" + this.cell.tit : "");
		else if (this.cell.firstChild.tagName == "A") {
			var out = this.cell.firstChild.firstChild.src + (this.cell.titFl != null ? "^" + this.cell.tit : "");
			out += "^" + this.cell.lnk;

			if (this.cell.trg)
				out += "^" + this.cell.trg
			return out;
		}
	}
	this.isDisabled = function() {
		return true;
	}
}
eXcell_opt.prototype = new eXcell_img;
eXcell_opt.prototype.setValue = function(val) {
	if (this.grid.menuItems == undefined) {
		this.setCValue("");
		return;
	}
	
	if (val._dhx_trim() == "") {
		this.setCValue("");
		return;
	}

	var title = val;
	if (val.indexOf("^") != -1) {
		var ar = val.split("^");
		val = ar[0];
		title = this.cell._attrs.title || ar[1];

		// link
		if (ar.length > 2) {
			this.cell.lnk = ar[2];

			if (ar[3])
				this.cell.trg = ar[3];
		}
		this.cell.titFl = "1";
	}
	var rowIndex = this.cell.parentNode.idd;
	var cellIndex = this.cell._cellIndex;
	this.cell.realValue = val;

	this.setCValue("<img src='" + __grid_home_dir + "bingo-extend/images/opt_menu/ico_set.gif' border='0' onmouseout='hideOptMenu(\""
					+ this.grid.optMenuContainerId + "\");' onmouseover='showOptMenu(event,\"" + this.grid.optMenuContainerId + "\"," + rowIndex
					+ "," + cellIndex + ");'>", val);

	if (this.cell.lnk) {
		this.cell.innerHTML = "<a href='" + this.cell.lnk + "' target='" + this.cell.trg + "'>" + this.cell.innerHTML + "</a>"
	}
	this.cell.tit = '';
}

// -------------------------------------------操作列（平铺模式）-----------------------------------------------
function eXcell_opt_tile(cell) {
	try {
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
	} catch (er) {
	}
	this.getValue = function() {
		return '';
	}
	this.isDisabled = function() {
		return true;
	}
}
eXcell_opt_tile.prototype = new eXcell_img;
eXcell_opt_tile.prototype.getTitle = function() {
	return false;
}
eXcell_opt_tile.prototype.setValue = function(val) {
	if (this.grid.menuItems == undefined) {
		this.setCValue("");
		return;
	}
	
	var menuItems = this.grid.menuItems;
	var rowIndex = this.cell.parentNode.idd;
	
	var cellContent = '';
	for (var i = 0; i < menuItems.length; i++) {
		var eOptMenuItem = document.createElement('a');
		eOptMenuItem.id = menuItems[i].id + rowIndex;
		eOptMenuItem.href = "javascript:menuItemDelegate(\""+ menuItems[i].onClick + "\",\"" + this.grid.menuContainerId + "\"," + rowIndex + ");";
		eOptMenuItem.innerHTML = "<img src='" + Global.contextPath + menuItems[i].icon + "' title='" + menuItems[i].label + "' class='dg_opt_menu'/>";
		this.cell.appendChild(eOptMenuItem);
		//this.grid.setUserData(rowIndex, menuItems[i].id, eOptMenuItem);
		var menuItemsInUserData = this.grid.getUserData(rowIndex, "menuItems");
		if (!menuItemsInUserData) {
			menuItemsInUserData = {};
			menuItemsInUserData.showItem = function(itemName) {
				if (this[itemName]) $(this[itemName]).show();
			}
			menuItemsInUserData.hideItem = function(itemName) {
				if (this[itemName]) $(this[itemName]).hide();
			}
		}
		menuItemsInUserData[menuItems[i].id] = eOptMenuItem;
		this.grid.setUserData(rowIndex, "menuItems", menuItemsInUserData);
	}
}

// -------------------------------------------全选列----------------------------------------------------------
function eXcell_cb(cell) {
	if (cell) {
		this.cell = cell;
		this.grid = this.cell.parentNode.grid;
		this.cell.obj = this;
	}

	this.disabledF = function(fl) {
		if ((fl == true) || (fl == 1))
			this.cell.firstChild.disable = true;
		else
			this.cell.firstChild.disable = false;
	}

	this.changeState = function() {
		// nb:
		if ((!this.grid.isEditable) || (this.cell.parentNode._locked) || (this.isDisabled()))
			return;

		if (this.grid.callEvent("onEditCell", [0, this.cell.parentNode.idd, this.cell._cellIndex])) {
			this.val = this.getValue()

			if (this.val == "1")
				this.setValue("0")
			else
				this.setValue("1")

			// this.cell.wasChanged=true;
			// nb:
			this.grid.callEvent("onEditCell", [1, this.cell.parentNode.idd, this.cell._cellIndex]);

			this.grid.callEvent("onCheckbox", [this.cell.parentNode.idd, this.cell._cellIndex, (this.val != '1')]);

			this.grid.callEvent("onCheck", [this.cell.parentNode.idd, this.cell._cellIndex, (this.val != '1')]);
		} else { // preserve editing (not tested thoroughly for this editor)
			this.editor = null;
		}
	}
	this.getValue = function() {
		return this.cell.chstate ? this.cell.chstate.toString() : "0";
	}

	this.isCheckbox = function() {
		return true;
	}
	this.isChecked = function() {
		if (this.getValue() == "1")
			return true;
		else
			return false;
	}

	this.setChecked = function(fl) {
		this.setValue(fl.toString())
	}
	this.detach = function() {
		return this.val != this.getValue();
	}
	this.edit = null;
}
eXcell_cb.prototype = new eXcell;
eXcell_cb.prototype.setValue = function(val) {
	this.cell.style.verticalAlign = "middle"; // nb:to center checkbox in line
	var text = '';
	// val can be int
	if (val) {
		val = val.toString()._dhx_trim();
		if (val.indexOf("^") != -1) {
			var ar = val.split("^");
			val = ar[0];
			text = ar[1];
		}
		if ((val == "false") || (val == "0"))
			val = "";
	}

	if (val) {
		val = "1";
		this.cell.chstate = "1";
	} else {
		val = "0";
		this.cell.chstate = "0"
	}

	if (val == 1) {
		val = " checked = 'true'";
	}

	if (val == "") {
		val += " disable = 'true'";
	}

	if (val == 0) {
		val = "";
	}

	var obj = this;
	/*this.setCValue("<input type='checkbox' style='width:auto;'" + val + " onclick='this.parentNode.obj.changeState();(arguments[0]||event).cancelBubble=true; '/>"
					+ text, this.cell.chstate);*/
	this
			.setCValue(
					"<img src='"
							+ this.grid.imgURL
							+ "item_chk"
							+ this.cell.chstate
							+ ".gif' onclick='this.parentNode.obj.changeState(); (arguments[0]||event).cancelBubble=true; '>",
					this.cell.chstate);
}