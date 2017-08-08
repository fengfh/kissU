function L_calendar() {
}

L_calendar.prototype = {
	Moveable : true,
	NewName : "",
	insertId : "",
	ClickObject : null,
	InputObject : null,
	InputDate : null,
	IsOpen : false,
	MouseX : 0,
	MouseY : 0,
	GetDateLayer : function() {
		return window.L_DateLayer;
	},
	L_TheYear : new Date().getFullYear(), // 定义年的变量的初始值
	L_TheMonth : new Date().getMonth() + 1,// 定义月的变量的初始值
	L_TheHour: new Date().getHours(),
	L_TheMinute: new Date().getMinutes(),
	L_TheSecond: new Date().getSeconds(),
	L_WDay : new Array(42),// 定义写日期的数组
	MonHead : new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31), // 定义阳历中每个月的最大天数
	CurrentBgColor: "#FFFFFF",
	getAbsolutePos: function(el) {
		var SL = 0, ST = 0;
		var is_div = /^div$/i.test(el.tagName);
		if (is_div && el.scrollLeft)
			SL = el.scrollLeft;
		if (is_div && el.scrollTop)
			ST = el.scrollTop;
		var r = { x: el.offsetLeft - SL, y: el.offsetTop - ST };
		if (el.offsetParent) {
			var tmp = this.getAbsolutePos(el.offsetParent);
			r.x += tmp.x;
			r.y += tmp.y;
		}
		return r;
	},
	CreateHTML : function() {
		var htmlstr = "";
		htmlstr += "<div id=\"L_calendar\">\r\n";
		htmlstr += "<span id=\"SelectYearLayer\" style=\"z-index: 9999;position: absolute;top: 3; left: 39;display: none\"></span>\r\n";
		htmlstr += "<span id=\"SelectMonthLayer\" style=\"z-index: 9999;position: absolute;top: 3; left: 103;display: none\"></span>\r\n";
		htmlstr += "<span id=\"SelectHourLayer\" style=\"z-index: 9999;position: absolute;top: 185; left: 54;display: none\"></span>\r\n";
		htmlstr += "<span id=\"SelectMinuteLayer\" style=\"z-index: 9999;position: absolute;top: 185; left: 85;display: none\"></span>\r\n";
		htmlstr += "<span id=\"SelectSecondLayer\" style=\"z-index: 9999;position: absolute;top: 185; left: 114;display: none\"></span>\r\n";
		htmlstr += "<div id=\"L_calendar-year-month\">\r\n";
		htmlstr += "<div id=\"L_calendar-PrevM\"><input type='button' class='buttonMiddle' onclick=\"parent."
				+ this.NewName
				+ ".PrevY()\" title=\"上年\" value='&lt;&lt;'></input></div>\r\n";
		htmlstr += "<div id=\"L_calendar-PrevY\"><input type='button' class='buttonSmall' onclick=\"parent."
				+ this.NewName
				+ ".PrevM()\" title=\"上月\" value='&lt;'></input></div>\r\n";
		htmlstr += "<div id=\"L_calendar-year\" onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='#C8E3FF'\" onclick=\"parent."
				+ this.NewName
				+ ".SelectYearInnerHTML('"
				+ this.L_TheYear
				+ "')\"></div>\r\n";
		htmlstr += "<div id=\"L_calendar-month\"  onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='#C8E3FF'\" onclick=\"parent."
				+ this.NewName
				+ ".SelectMonthInnerHTML('"
				+ this.L_TheMonth
				+ "')\"></div>\r\n";
		htmlstr += "<div id=\"L_calendar-NextM\"><input type='button' class='buttonSmall' onclick=\"parent."
				+ this.NewName
				+ ".NextM()\" title=\"下月\" value='&gt;'></input></div>\r\n";
		htmlstr += "<div id=\"L_calendar-NextY\"><input type='button' class='buttonMiddle' onclick=\"parent."
				+ this.NewName
				+ ".NextY()\" title=\"下年\" value='&gt;&gt;'></input></div></div>\r\n";
		htmlstr += "<div id=\"L_calendar-week\"><ul  onmouseup=\"StopMove()\"><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul></div>\r\n";
		htmlstr += "<div id=\"L_calendar-day\">\r\n";
		htmlstr += "<ul>\r\n";
				for (var i = 0; i < this.L_WDay.length; i++) {
					htmlstr += "<li id=\"L_calendar-day_"
							+ i
							+ "\" style=\"background:#ffffff\" onmouseover=\"this.CurrentBgColor=this.style.background;this.style.background='#00FF00'\"  onmouseout=\"this.style.background=this.CurrentBgColor;\"></li>\r\n";
				}
		htmlstr += "</ul></div>\r\n";
	    htmlstr += "<div id='L_calendar-control'><div id='L_calendar-today'><input type='button' class='buttonBig' title=\"当前日期\" value=\"今天\" name=\"Today\" onclick=\"parent."
				+ this.NewName + ".Today()\"></div>";
		htmlstr += "<div id=\"L_calendar-hour\" onmouseover=\"this.style.backgroundColor='#FFD700'\" onmouseout=\"this.style.backgroundColor='#C8E3FF'\" onclick=\"parent."
				+ this.NewName
				+ ".SelectHourInnerHTML('"
				+ this.L_TheHour
				+ "')\"></div><div id=\"L_calendar-minute\"  onmouseover=\"this.style.backgroundColor='#FFD700'\" onmouseout=\"this.style.backgroundColor='#C8E3FF'\" onclick=\"parent."
				+ this.NewName
				+ ".SelectMinuteInnerHTML('"
				+ this.L_TheMinute
				+ "')\"></div><div id=\"L_calendar-second\"  onmouseover=\"this.style.backgroundColor='#FFD700'\" onmouseout=\"this.style.backgroundColor='#C8E3FF'\" onclick=\"parent."
				+ this.NewName
				+ ".SelectSecondInnerHTML('"
				+ this.L_TheSecond
				+ "')\"></div>";
		htmlstr += "<div id='L_calendar-clear'><input type='button' class='buttonBig' title=\"清除日期\" value=\"清除\" name=\"Clear\" onclick=\"parent."
				+ this.NewName + ".Clear()\"></div>";
		htmlstr += "</div>\r\n";
		htmlstr += "</div>\r\n";
		htmlstr += "<scr" + "ipt type=\"text/javas" + "cript\">\r\n";
		htmlstr += "var MouseX,MouseY;";
		htmlstr += "var Moveable=" + this.Moveable + ";\r\n";
		htmlstr += "var MoveaStart=false;\r\n";
		htmlstr += "document.attachEvent('onmousemove',function(e)\r\n";
		htmlstr += "{\r\n";
		htmlstr += "var DateLayer=parent.document.getElementById(\"L_DateLayer\");\r\n";
		htmlstr += "	e = window.event || e;\r\n";
		htmlstr += "var DateLayerLeft=DateLayer.style.posLeft || parseInt(DateLayer.style.left.replace(\"px\",\"\"));\r\n";
		htmlstr += "var DateLayerTop=DateLayer.style.posTop || parseInt(DateLayer.style.top.replace(\"px\",\"\"));\r\n";
		htmlstr += "if(MoveaStart){DateLayer.style.left=(DateLayerLeft+e.clientX-MouseX)+\"px\";DateLayer.style.top=(DateLayerTop+e.clientY-MouseY)+\"px\"}\r\n";
		htmlstr += ";\r\n";
		htmlstr += "});\r\n";

		htmlstr += "document.getElementById(\"L_calendar-week\").onmousedown=function(e){\r\n";
		htmlstr += "if(Moveable){MoveaStart=true;}\r\n";
		htmlstr += "	e = window.event || e;\r\n";
		htmlstr += "  MouseX = e.clientX;\r\n";
		htmlstr += "  MouseY = e.clientY;\r\n";
		htmlstr += "	}\r\n";

		htmlstr += "function StopMove(){\r\n";
		htmlstr += "MoveaStart=false;\r\n";
		htmlstr += "	}\r\n";
		htmlstr += "</scr" + "ipt>\r\n";
		var stylestr = "";
		stylestr += "<style type=\"text/css\">";
		stylestr += "body{background:#fff;font-size:12px;margin:0px;padding:0px;text-align:left}\r\n";
		stylestr += "#L_calendar{border:2px solid blue;padding:1px;height:180px;z-index:9998;text-align:center;background:#C8E3FF}\r\n";
		stylestr += "#L_calendar-year-month{height:23px;line-height:23px;z-index:9998;}\r\n";
		stylestr += "#L_calendar-year{line-height:20px;width:60px;float:left;z-index:9998;position: absolute;top: 3; left: 39;cursor:default}\r\n";
		stylestr += "#L_calendar-month{line-height:20px;width:48px;float:left;z-index:9998;position: absolute;top: 3; left: 103;cursor:default}\r\n";
		stylestr += "#L_calendar-PrevM{position: absolute;top: 3; left: 5;cursor:pointer}";
		stylestr += "#L_calendar-NextM{position: absolute;top: 3; left: 159;cursor:pointer}";
		stylestr += "#L_calendar-PrevY{position: absolute;top: 3; left: 24;cursor:pointer}";
		stylestr += "#L_calendar-NextY{position: absolute;top: 3; left: 172;cursor:pointer}";
		stylestr += "#L_calendar-week{height:23px;line-height:23px;z-index:9998;background:#0080FF}\r\n";
		stylestr += "#L_calendar-day{height:136px;z-index:9998;}\r\n";
		stylestr += "#L_calendar-week ul{cursor:move;list-style:none;margin:0px;padding:0px;}\r\n";
		stylestr += "#L_calendar-week li{width:25px;height:20px;float:left;;margin:1px;padding:0px;text-align:center;color:#FFFFFF}\r\n";
		stylestr += "#L_calendar-day ul{list-style:none;margin:0px;padding:0px;}\r\n";
		stylestr += "#L_calendar-day li{cursor:pointer;width:25px;height:20px;float:left;;margin:1px;padding:0px;}\r\n";
		stylestr += "#L_calendar-control{height:20px;line-height:20px;z-index:9998;}\r\n";
		stylestr += "#L_calendar-today{position: absolute;top: 185; left: 5;cursor:pointer;width:15px;}";
		stylestr += "#L_calendar-clear{position: absolute;top: 185; left: 156;cursor:pointer}";
		stylestr += "#L_calendar-hour{line-height:20px;width:30px;float:left;z-index:9998;position: absolute;top: 185; left: 54;cursor:default}\r\n";
		stylestr += "#L_calendar-minute{line-height:20px;width:30px;float:left;z-index:9998;position: absolute;top: 185; left: 85;cursor:default}\r\n";
		stylestr += "#L_calendar-second{line-height:20px;width:30px;float:left;z-index:9998;position: absolute;top: 185; left: 114;cursor:default}\r\n";
		stylestr += ".buttonBig {font-size: 12px; height: 20px; width:30px; background-color: #FFF7E7;border:1px solid #78acff;font-size:12.8px;cursor:hand;FONT-SIZE: 9pt;font-family:宋体;}"
		stylestr += ".buttonMiddle {font-size: 12px; height: 20px; width:20px; background-color: #FFF7E7;border:1px solid #78acff;font-size:12.8px;cursor:hand;FONT-SIZE: 9pt;font-family:宋体;}"
		stylestr += ".buttonSmall {font-size: 12px; height: 20px; width:15px; background-color: #FFF7E7;border:1px solid #78acff;font-size:12.8px;cursor:hand;FONT-SIZE: 9pt;font-family:宋体;}"
		stylestr += "</style>";
		var TempLateContent = "<html>\r\n";
		TempLateContent += "<head>\r\n";
		TempLateContent += "<title></title>\r\n";
		TempLateContent += stylestr;
		TempLateContent += "</head>\r\n";
		TempLateContent += "<body>\r\n";
		TempLateContent += htmlstr;
		TempLateContent += "</body>\r\n";
		TempLateContent += "</html>\r\n";
		this.GetDateLayer().document.writeln(TempLateContent);
		L_DateLayer.document.getElementById("L_calendar").onselectstart = function(){return false};
		this.GetDateLayer().document.onkeydown = function(e){return false;};
		L_DateLayer.document.onkeydown = function(e){return false;};
		L_DateLayer.document.body.onkeydown = function(){return false};
		this.GetDateLayer().document.close();
	},
	InsertHTML : function(id, htmlstr) {
		var L_DateLayer = this.GetDateLayer();
		if (L_DateLayer) {
			L_DateLayer.document.getElementById(id).innerHTML = htmlstr;
		}
	},
	WriteHead : function(yy, mm) // 往 head 中写入当前的年与月
	{
		this.InsertHTML("L_calendar-year", yy + " 年");
		this.InsertHTML("L_calendar-month", mm + " 月");
	},
	WriteTime : function(hh, mm, ss) {
		this.InsertHTML("L_calendar-hour", hh + " 时");
		this.InsertHTML("L_calendar-minute", mm + " 分");
		if (!ss) ss = "00";
		this.InsertHTML("L_calendar-second", ss + " 秒");
	},
	IsPinYear : function(year) // 判断是否闰平年
	{
		if (0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0)))
			return true;
		else
			return false;
	},
	GetMonthCount : function(year, month) // 闰年二月为29天
	{
		var c = this.MonHead[month - 1];
		if ((month == 2) && this.IsPinYear(year))
			c++;
		return c;
	},
	GetDOW : function(day, month, year) // 求某天的星期几
	{
		var dt = new Date(year, month - 1, day).getDay() / 7;
		return dt;
	},
	GetText : function(obj) {
		if (obj.innerText) {
			return obj.innerText
		} else {
			return obj.textContent
		}
	},
	PrevM : function() // 往前翻月份
	{
		if (this.L_TheMonth > 1) {
			this.L_TheMonth--
		} else {
			this.L_TheYear--;
			this.L_TheMonth = 12;
		}
		this.SetDay(this.L_TheYear, this.L_TheMonth, this.L_TheHour, this.L_TheMinute, this.L_TheSecond);
	},
	NextM : function() // 往后翻月份
	{
		if (this.L_TheMonth == 12) {
			this.L_TheYear++;
			this.L_TheMonth = 1
		} else {
			this.L_TheMonth++
		}
		this.SetDay(this.L_TheYear, this.L_TheMonth, this.L_TheHour, this.L_TheMinute, this.L_TheSecond);
	},
	PrevY : function() // 往前翻年份
	{
		this.L_TheYear--;
		this.SetDay(this.L_TheYear, this.L_TheMonth, this.L_TheHour, this.L_TheMinute, this.L_TheSecond);
	},
	NextY : function() // 往后翻年份
	{
		this.L_TheYear++;
		this.SetDay(this.L_TheYear, this.L_TheMonth, this.L_TheHour, this.L_TheMinute, this.L_TheSecond);
	},
	Today : function() // Today Button
	{
		this.L_TheYear = new Date().getFullYear();
		this.L_TheMonth = new Date().getMonth() + 1;
		this.L_TheHour = new Date().getHours();
		this.L_TheMinute = new Date().getMinutes();
		this.L_TheSecond = new Date().getSeconds();
		this.setInputObjectValue(new Date().formatDate(this.formatStr));
		this.CloseLayer();
	},
	Clear : function() // Clear Button
	{
		if (this.InputObject) {
			this.setInputObjectValue("");
		}
		this.CloseLayer();
	},
	SetDay : function(yy, mm, hh, mi, ss) // 主要的写程序**********
	{
		this.WriteHead(yy, mm);
		// 设置当前年月的公共变量为传入值
		this.L_TheYear = yy;
		this.L_TheMonth = mm;
		// 当页面本身位于框架中时 IE会返回错误的parent
		if (window.parent.location.href != window.location.href) {
			for (var i_f = 0; i_f < window.parent.frames.length; i_f++) {
				if (window.parent.frames[i_f].location.href == window.location.href) {
					L_DateLayer_Parent = window.parent.frames[i_f];
				}
			}
		} else {
			L_DateLayer_Parent = window.parent;
		}
		for (var i = 0; i < 42; i++) {
			this.L_WDay[i] = ""
		}; // 将显示框的内容全部清空
		var day1 = 1, day2 = 1, firstday = new Date(yy, mm - 1, 1).getDay(); // 某月第一天的星期几
		for (i = 0; i < firstday; i++)
			this.L_WDay[i] = this.GetMonthCount(mm == 1 ? yy - 1 : yy, mm == 1
					? 12
					: mm - 1)
					- firstday + i + 1 // 上个月的最后几天
		for (i = firstday; day1 < this.GetMonthCount(yy, mm) + 1; i++) {
			this.L_WDay[i] = day1;
			day1++;
		}
		for (i = firstday + this.GetMonthCount(yy, mm); i < 42; i++) {
			this.L_WDay[i] = day2;
			day2++
		}
		for (i = 0; i < 42; i++) {
			var da = this.GetDateLayer().document
					.getElementById("L_calendar-day_" + i + "");
			var month, day;
			var lastYear = false;
			if (this.L_WDay[i] != "") {
				if (i < firstday) {
					da.innerHTML = "<b style=\"color:gray\">" + this.L_WDay[i]
							+ "</b>";
					da.style.background = "#F0F0F0";
					month = (mm == 1 ? 12 : mm - 1);
					if (mm == 1) lastYear = true;
					day = this.L_WDay[i];
				} else if (i >= firstday + this.GetMonthCount(yy, mm)) {
					da.innerHTML = "<b style=\"color:gray\">" + this.L_WDay[i]
							+ "</b>";
					da.style.background = "#F0F0F0";
					month = (mm == 1 ? 2 : parseInt(mm) + 1);
					month = (mm == 12 ? 1 : parseInt(mm) + 1);
					day = this.L_WDay[i];
				} else {
					da.innerHTML = "<b style=\"color:#000\">" + this.L_WDay[i]
							+ "</b>";
					da.style.background = "#FFFFFF";
					month = (mm == 1 ? 1 : mm);
					day = this.L_WDay[i];
				}
				if (document.all) {
						da.onclick = Function("L_DateLayer_Parent."
								+ this.NewName + ".DayClick(" + lastYear + "," + month + ","
								+ day + ")");
					} else {
						da.setAttribute("onclick", "parent." + this.NewName
								+ ".DayClick(" + month + "," + day + ")");
				}
				da.title = month + "月" + day + "日";
				if (yy == new Date().getFullYear()
						&& month == new Date().getMonth() + 1 && day == new Date()
						.getDate()) {
						da.style.background = "#FF8040";	
				}
				if (this.InputDate != null) {
					if (yy == this.InputDate.getFullYear()
							&& month == this.InputDate.getMonth() + 1
							&& day == this.InputDate.getDate()) {
						da.style.background = "#FFff40";
					}
				}
			}
		}
		this.WriteTime(hh,mi,ss);
	},
	SelectHourInnerHTML : function(strHour) {
		if (strHour.match(/\D/) != null) {
			alert("小时输入参数不是数字！");
			return;
		}
		var m = (strHour) ? strHour : new Date().getHours();
		if (m < 0 || m > 24) {
			alert("小时值不在 0 到 24之间！");
			return;
		}
		var s = "<select name=\"L_SelectHour\" id=\"L_SelectHour\" style='font-size: 12px' "
		s += "onblur='document.getElementById(\"SelectHourLayer\").style.display=\"none\"' "
		s += "onchange='document.getElementById(\"SelectHourLayer\").style.display=\"none\";"
		s += "parent." + this.NewName + ".L_TheHour = this.value; parent."
				+ this.NewName + ".SetDay(parent." + this.NewName
				+ ".L_TheYear,parent." + this.NewName + ".L_TheMonth, parent." + this.NewName
				+ ".L_TheHour, parent." + this.NewName
				+ ".L_TheMinute, parent." + this.NewName
				+ ".L_TheSecond)'>\r\n";
		var selectInnerHTML = s;
		for (var i = 0; i < 24; i++) {
			if (i == strHour) {
				selectInnerHTML += "<option value='" + i + "' selected>" + i + "</option>\r\n";
			} else {
				selectInnerHTML += "<option value='" + i + "'>" + i
						+ "</option>\r\n";
			}
		}
		selectInnerHTML += "</select>";
		var DateLayer = this.GetDateLayer();
		DateLayer.document.getElementById("SelectHourLayer").style.display = "";
		DateLayer.document.getElementById("SelectHourLayer").innerHTML = selectInnerHTML;
		DateLayer.document.getElementById("L_SelectHour").focus();
	},
	SelectMinuteInnerHTML : function(strMinute) {
		if (strMinute.match(/\D/) != null) {
			alert("分钟输入参数不是数字！");
			return;
		}
		var m = (strMinute) ? strMinute : new Date().getMinutes();
		if (m < 0 || m > 59) {
			alert("小时值不在 0到 60 之间！");
			return;
		}
		var s = "<select name=\"L_SelectMinute\" id=\"L_SelectMinute\" style='font-size: 12px' "
		s += "onblur='document.getElementById(\"SelectMinuteLayer\").style.display=\"none\"' "
		s += "onchange='document.getElementById(\"SelectMinuteLayer\").style.display=\"none\";"
		s += "parent." + this.NewName + ".L_TheMinute = this.value; parent."
				+ this.NewName + ".SetDay(parent." + this.NewName
				+ ".L_TheYear,parent." + this.NewName + ".L_TheMonth, parent." + this.NewName
				+ ".L_TheHour, parent." + this.NewName
				+ ".L_TheMinute, parent." + this.NewName
				+ ".L_TheSecond)'>\r\n";
		var selectInnerHTML = s;
		for (var i = 0; i < 60; i++) {
			if (i == strMinute) {
				selectInnerHTML += "<option value='" + i + "' selected>" + i + "</option>\r\n";
			} else {
				selectInnerHTML += "<option value='" + i + "'>" + i
						+ "</option>\r\n";
			}
		}
		selectInnerHTML += "</select>";
		var DateLayer = this.GetDateLayer();
		DateLayer.document.getElementById("SelectMinuteLayer").style.display = "";
		DateLayer.document.getElementById("SelectMinuteLayer").innerHTML = selectInnerHTML;
		DateLayer.document.getElementById("L_SelectMinute").focus();
	},
	SelectSecondInnerHTML : function(strSecond) {
		if (strSecond.match(/\D/) != null) {
			alert("秒输入参数不是数字！");
			return;
		}
		var m = (strSecond) ? strSecond : new Date().getSeconds();
		if (m < 0 || m > 59) {
			alert("秒值不在 10到 60 之间！");
			return;
		}
		var s = "<select name=\"L_SelectSecond\" id=\"L_SelectSecond\" style='font-size: 12px' "
		s += "onblur='document.getElementById(\"SelectSecondLayer\").style.display=\"none\"' "
		s += "onchange='document.getElementById(\"SelectSecondLayer\").style.display=\"none\";"
		s += "parent." + this.NewName + ".L_TheSecond = this.value; parent."
				+ this.NewName + ".SetDay(parent." + this.NewName
				+ ".L_TheYear,parent." + this.NewName + ".L_TheMonth, parent." + this.NewName
				+ ".L_TheHour, parent." + this.NewName
				+ ".L_TheMinute, parent." + this.NewName
				+ ".L_TheSecond)'>\r\n";
		var selectInnerHTML = s;
		for (var i = 0; i < 60; i++) {
			if (i == strSecond) {
				selectInnerHTML += "<option value='" + i + "' selected>" + i + "</option>\r\n";
			} else {
				selectInnerHTML += "<option value='" + i + "'>" + i
						+ "</option>\r\n";
			}
		}
		selectInnerHTML += "</select>";
		var DateLayer = this.GetDateLayer();
		DateLayer.document.getElementById("SelectSecondLayer").style.display = "";
		DateLayer.document.getElementById("SelectSecondLayer").innerHTML = selectInnerHTML;
		DateLayer.document.getElementById("L_SelectSecond").focus();
	},
	SelectYearInnerHTML : function(strYear) // 年份的下拉框
	{
		if (strYear.match(/\D/) != null) {
			alert("年份输入参数不是数字！");
			return;
		}
		var m = (strYear) ? strYear : new Date().getFullYear();
		if (m < 1000 || m > 9999) {
			alert("年份值不在 1000 到 9999 之间！");
			return;
		}
		var n = m - 90;
		if (n < 1000)
			n = 1000;
		if (n + 26 > 9999)
			n = 9974;
		var s = "<select name=\"L_SelectYear\" id=\"L_SelectYear\" style='font-size: 12px' "
		s += "onblur='document.getElementById(\"SelectYearLayer\").style.display=\"none\"' "
		s += "onchange='document.getElementById(\"SelectYearLayer\").style.display=\"none\";"
		s += "parent." + this.NewName + ".L_TheYear = this.value; parent."
				+ this.NewName + ".SetDay(parent." + this.NewName
				+ ".L_TheYear,parent." + this.NewName + ".L_TheMonth, parent." + this.NewName
				+ ".L_TheHour, parent." + this.NewName
				+ ".L_TheMinute, parent." + this.NewName
				+ ".L_TheSecond)'>\r\n";
		var selectInnerHTML = s;
		for (var i = n; i < n + 120; i++) {
			if (i == m) {
				selectInnerHTML += "<option value='" + i + "' selected>" + i
						+ "年" + "</option>\r\n";
			} else {
				selectInnerHTML += "<option value='" + i + "'>" + i + "年"
						+ "</option>\r\n";
			}
		}
		selectInnerHTML += "</select>";
		var DateLayer = this.GetDateLayer();
		DateLayer.document.getElementById("SelectYearLayer").style.display = "";
		DateLayer.document.getElementById("SelectYearLayer").innerHTML = selectInnerHTML;
		DateLayer.document.getElementById("L_SelectYear").focus();
	},
	SelectMonthInnerHTML : function(strMonth) // 月份的下拉框
	{
		if (strMonth.match(/\D/) != null) {
			alert("月份输入参数不是数字！");
			return;
		}
		var m = (strMonth) ? strMonth : new Date().getMonth() + 1;
		var s = "<select name=\"L_SelectMonth\" id=\"L_SelectMonth\" style='font-size: 12px' "
		s += "onblur='document.getElementById(\"SelectMonthLayer\").style.display=\"none\"' "
		s += "onchange='document.getElementById(\"SelectMonthLayer\").style.display=\"none\";"
		s += "parent." + this.NewName + ".L_TheMonth = this.value; parent."
				+ this.NewName + ".SetDay(parent." + this.NewName
				+ ".L_TheYear,parent." + this.NewName + ".L_TheMonth, parent." + this.NewName
				+ ".L_TheHour, parent." + this.NewName
				+ ".L_TheMinute, parent." + this.NewName
				+ ".L_TheSecond)'>\r\n";
		var selectInnerHTML = s;
		for (var i = 1; i < 13; i++) {
			if (i == m) {
				selectInnerHTML += "<option value='" + i + "' selected>" + i
						+ "月" + "</option>\r\n";
			} else {
				selectInnerHTML += "<option value='" + i + "'>" + i + "月"
						+ "</option>\r\n";
			}
		}
		selectInnerHTML += "</select>";
		var DateLayer = this.GetDateLayer();
		DateLayer.document.getElementById("SelectMonthLayer").style.display = "";
		DateLayer.document.getElementById("SelectMonthLayer").innerHTML = selectInnerHTML;
		DateLayer.document.getElementById("L_SelectMonth").focus();
	},
	DayClick : function(lastYear, mm, dd) // 点击显示框选取日期，主输入函数*************
	{
		var yy = this.L_TheYear;
		if (lastYear) yy--;
		// 判断月份，并进行对应的处理
		if (this.ClickObject) {
			if (!dd) {
				return;
			}
			this.setInputObjectValue(new Date(yy,mm-1,dd,this.L_TheHour,this.L_TheMinute,this.L_TheSecond,0).formatDate(this.formatStr));
			this.CloseLayer();
		} else {
			this.CloseLayer();
			alert("您所要输出的控件对象并不存在！");
		}
	},
	SetDate : function() {
		if (document.getElementById("L_DateLayer").style.display != "none") {
			this.CloseLayer();
			return;
		}
		
		if (arguments.length < 1) {
			alert("对不起！传入参数太少！");
			return;
		}
		
		if (arguments.length == 1) {
			this.InputObject = arguments[0];
			this.ClickObject = arguments[0];
			this.formatStr = "yyyy-MM-dd";
		} else if (arguments.length == 2) {
			this.InputObject = arguments[0];
			this.ClickObject = arguments[1];
			this.formatStr = "yyyy-MM-dd";
		} else {
			this.InputObject = arguments[0];
			this.ClickObject = arguments[1];
			this.formatStr = arguments[2];
		}
		
		// 取代绑定的控件有onchange等事件
		this.doOnChange = this.InputObject.onblur||this.InputObject.onchange||this.InputObject.onTempEvent||null;
		this.InputObject.onblur = null;
		this.InputObject.onchange = null;
		
		var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{0,2}):{0,1}(\d{0,2}):{0,1}(\d{0,2})$/;
		var inputObjectValue = this.getInputObjectValue();
		if (!inputObjectValue||inputObjectValue=="&nbsp;") {
			inputObjectValue = (new Date()).formatDate("yyyy-MM-dd hh:mm:ss");
		} else if (inputObjectValue.indexOf(":") <= 0) {
			var newDate = new Date();
			inputObjectValue += " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds();
		}
		var r = inputObjectValue.match(reg);
		
		if (r != null) {
			r[2] = r[2] - 1;
			var d = new Date(r[1], r[2], r[3]);
			if (d.getFullYear() == r[1] && d.getMonth() == r[2]
					&& d.getDate() == r[3]) {
				this.InputDate = d; // 保存外部传入的日期
			} else
				this.InputDate = "";
			this.L_TheYear = r[1];
			this.L_TheMonth = r[2] + 1;
			this.L_TheHour = r[4];
			this.L_TheMinute = r[5];
			this.L_TheSecond = r[6];
		} else {
			this.L_TheYear = new Date().getFullYear();
			this.L_TheMonth = new Date().getMonth() + 1
		}
		this.CreateHTML();
		
		var position = this.getAbsolutePos(this.ClickObject);
		var DateLayer = document.getElementById("L_DateLayer");
		DateLayer.style.top = position.y + this.ClickObject.clientHeight + 5 + "px";
		DateLayer.style.left = position.x + "px";
		DateLayer.style.display = "block";
		if (document.all) {
			this.GetDateLayer().document.getElementById("L_calendar").style.width = "198px";
			this.GetDateLayer().document.getElementById("L_calendar").style.height = "180px"
		} else {
			this.GetDateLayer().document.getElementById("L_calendar").style.width = "190px";
			this.GetDateLayer().document.getElementById("L_calendar").style.height = "210px"
			DateLayer.style.width = "196px";
			DateLayer.style.height = "216px";
		}
		this.SetDay(this.L_TheYear, this.L_TheMonth, this.L_TheHour, this.L_TheMinute, this.L_TheSecond);
	},
	CloseLayer : function() {
		try {
			var DateLayer = document.getElementById("L_DateLayer");
			if ((DateLayer.style.display == "" || DateLayer.style.display == "block")
					&& arguments[0] != this.ClickObject
					&& arguments[0] != this.InputObject) {
				DateLayer.style.display = "none";
			}
		} catch (e) {
		} finally {
			if (this.InputObject&&this.doOnChange) {
				this.InputObject.onTempEvent = this.doOnChange;
			}
		}
	},
	getInputObjectValue: function() {
		if (this.InputObject.tagName == "INPUT") {
			return this.InputObject.value;
		}
		return (this.InputObject.innerHTML)?this.InputObject.innerHTML:this.InputObject.textContent;
	},
	setInputObjectValue: function(value) {
		var oldValue = "";
		if (this.InputObject.tagName == "INPUT") {
			oldValue = this.InputObject.value;
			this.InputObject.value = value;
		} else {
			if (document.all) {
				oldValue = this.InputObject.innerHTML;
				this.InputObject.innerHTML = value;
			} else {
				oldValue = this.InputObject.textContent;
				this.InputObject.textContent = value;
			}
		}
		if (this.doOnChange&&value!=oldValue) {
			this.doOnChange();
		}
	}
}

document.writeln('<iframe id="L_DateLayer" name="L_DateLayer" frameborder="0" style="position:absolute;width:199px; height:210px;z-index:1;display:none;"></iframe>');
var L_DateLayer_Parent = null;
var MyCalendar = new L_calendar();
MyCalendar.NewName = "MyCalendar";

document.attachEvent("onclick", function(e) {
	e = window.event || e;
	var srcElement = e.srcElement || e.target;
	MyCalendar.CloseLayer(srcElement);
});

Date.prototype.formatDate = function(format) // author: meizz
{
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }
  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] : 
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}