function StringBuffer(){
	this.data = [];
	if(arguments.length==1){
        this.data.push(arguments[0]);
    }
}
StringBuffer.prototype.append = function(){
	this.data.push(arguments[0]);
	return this;
}
StringBuffer.prototype.toString = function(){
	return this.data.join("");
}
dhtmlXGridObject.prototype.defaultPageSizeList = [10,20,30,40,50];

dhtmlXGridObject.prototype.showTotalRecords = false;

dhtmlXGridObject.prototype.setShowTotalRecords = function(showOrHide){
	this.showTotalRecords = showOrHide;	
}

dhtmlXGridObject.prototype.setPageSizeList = function(pageSizeList){
	this.pageSizeList = pageSizeList;	
}
dhtmlXGridObject.prototype.getPageSizeList = function(){
	return this.pageSizeList || this.defaultPageSizeList;
}



/**
 * 初始化分页工具条
 */
dhtmlXGridObject.prototype._pgn_dhx_skyblue = function(current,start,end,total){
	this._pgn_parentObj.className = 'grid_pagerstyle';
	//构建html
	this._pgn_parentObj.innerHTML = this.createPagingBar(current,start,end,total);
    //给a添加grid属性
    this._pgn_template_active_esms(this._pgn_parentObj);
}

dhtmlXGridObject.prototype._pgn_template_active_esms=function(block){
	var tags=block.getElementsByTagName("A");
	if (tags)
		for (var i=0; i < tags.length; i++) {
			tags[i].grid=this;
		};
	var selects=block.getElementsByTagName("SELECT");
	if (selects)
		for (var i=0; i < selects.length; i++) {
			selects[i].grid=this;
		};
}

dhtmlXGridObject.prototype.jumpToPage = function(){
	
	var pageNum = document.getElementById(this.id + '_jumpToTxt').value;
	if(pageNum == ''){
		return;
	}
	if (pageNum < 0 || pageNum != parseInt(pageNum)) {
		alert("页码必须是正整数！");
		return;
	}
	this.changePage(pageNum);
	return false;
}

function __filterNum(e){
	var _e = window.event || e;
	var keyCode = _e.keyCode || _e.charCode;
	//48-57 0-9
	//37 left 38 up 39 left 40 down 8 backspace 46 delete 
	if(keyCode == 8 || (keyCode >= 37 && keyCode <=40) ||keyCode == 46){//backspace
		return true;
	}
	if((keyCode > 95) && (keyCode < 106)){//小键盘数字输入
		return true;
	}
	if(_e.keyCode){//在IE环境下
	    sChar=String.fromCharCode(_e.keyCode);
	}else{//非IE下
	    sChar=String.fromCharCode(_e.charCode);
	}
	return '0123456789'.indexOf(sChar) != -1;
}
dhtmlXGridObject.prototype.createPagingBar = function(current,start,end,totalRecords){
	var buffer = new StringBuffer();
	var pageSize = this.rowsBufferOutSize;
	var totalPages = parseInt((totalRecords + pageSize - 1)/pageSize);
	var _sep = '&nbsp;';
	buffer.append('<div class="pageinfo">共')
		  .append(totalPages)
		  .append('页/')
		  .append(totalRecords)
		  .append('条记录 每页');
	buffer.append('<select id="'+this.id + '_pageSize_select" onchange="this.grid.changePageSize();">');
	var pageSizeList = this.getPageSizeList();
	var appendPageSize = true;
	for(var i = 0 ; i < pageSizeList.length;i++){//检查是否已经包含
		if(pageSizeList[i] == pageSize){
			appendPageSize = false;
			break;
		}
	}
	if(appendPageSize){
		this.pageSizeList = [pageSize].concat(pageSizeList);
	}else if(typeof this.pageSizeList == 'undefined'){
		this.pageSizeList = pageSizeList;
	}
	for(var i = 0; i < this.pageSizeList.length ;i ++){
		 buffer.append('<option '+(pageSize == this.pageSizeList[i] ? 'selected="true"':'' )+' value="'+this.pageSizeList[i]+'">'+this.pageSizeList[i]+'</option>');
	}
	if(this.showTotalRecords || false){
		buffer.append('<option '+(pageSize == totalRecords ? 'selected="true"':'' )+'value="'+totalRecords+'">全部</option>');
	}
	buffer.append('</select>') ;
	buffer.append(_sep);	  
	buffer.append(' 跳转<input type="text" id="'+this.id+'_jumpToTxt" onkeydown="return __filterNum();" value="'+current+'" class=""/>页<a href="javascript:void(0);" onclick="return this.grid.jumpToPage();return false;" class="btn_go"><span>GO</span></a>');
	buffer.append(_sep);
	if (this.exportable) {
		buffer.append('<a href="javascript:void(0);" onclick=this.grid.exportToExcel(); return false;><span>XLS</span></a>').append(_sep);
	}
	buffer.append('<a href="javascript:void(0);" onclick=this.grid.changePage('+1+'); return false;><span>首页</span></a>');
	buffer.append(_sep);
	buffer.append(this._pgn_link_esms('prevpages','<span>&lt;&lt;</span>',_sep));
	buffer.append(_sep);
	buffer.append(this._pgn_block_esms(_sep));
	buffer.append(_sep);
	buffer.append(this._pgn_link_esms('nextpages','<span>&gt;&gt;</span>',_sep));
	buffer.append(_sep);
	buffer.append('<a href="javascript:void(0);" onclick=this.grid.changePage('+totalPages+'); return false;><span>尾页</span></a>');
	buffer.append('</div>');
	//html 拼接
	return buffer.toString();
}

dhtmlXGridObject.prototype.changePageSize = function(pageSize){
	var eSelect = document.getElementById(this.id + '_pageSize_select');
	var pageSize = eSelect.options[eSelect.selectedIndex].value;
	if(pageSize == 0)return;
	this.rowsBufferOutSize = parseInt(pageSize);
	this.changePage();
}

dhtmlXGridObject.prototype._pgn_block_esms=function(sep){ 
	var start=Math.floor((this.currentPage-1)/this.pagesInGroup)*this.pagesInGroup;
	var max=Math.min(Math.ceil(this.rowsBuffer.length/this.rowsBufferOutSize),start+this.pagesInGroup);
	var str=[];
	for (var i=start+1; i<=max; i++)
		if (i==this.currentPage)
			str.push("<a href='javascript:void(0);' class='current'><span>"+i+"</span></a>");
		else
			str.push("<a href='javascript:void(0);' onclick='this.grid.changePage("+i+"); return false;'><span>"+i+"</span></a>");
	return str.join(sep);
}
dhtmlXGridObject.prototype._pgn_link_esms=function(mode,ac,ds){
	var _page = 0;
	if (mode=="prevpages" || mode=="prev"){
		if (this.currentPage==1) return ds;
		if(mode=="prevpages"){
			_page = -(this.currentPage % this.pagesInGroup == 0 ? this.pagesInGroup : this.currentPage % this.pagesInGroup);
		}else{
			_page = -1;
		}
		return '<a href="javascript:void(0);" onclick=\'this.grid.changePageRelative('+_page +'); return false;\'>'+ac+'</a>'
	}
	if (mode=="nextpages" || mode=="next"){
		if (this.rowsBuffer.length/this.rowsBufferOutSize <= this.currentPage ) return ds;
		if (this.rowsBuffer.length/(this.rowsBufferOutSize*(mode=="next"?'1':this.pagesInGroup)) <= 1 ) return ds;
		if(mode=="nextpages"){
			_page = this.currentPage % this.pagesInGroup == 0 ? 1 : this.pagesInGroup - this.currentPage % this.pagesInGroup + 1;
		}else{
			_page = 1;
		}
		
		return '<a href="javascript:void(0);" onclick=\'this.grid.changePageRelative('+_page+'); return false;\'>'+ac+'</a>'
	}
	
	if (mode=="current"){
		var i=this.currentPage+(ac?parseInt(ac):0);
		if (i<1 || Math.ceil(this.rowsBuffer.length/this.rowsBufferOutSize) < i ) return ds;
		return '<a href="javascript:void(0);" '+(i==this.currentPage?"class='dhx_active_page_link' ":"")+'onclick=\'this.grid.changePage('+i+'); return false;\'>'+i+'</a>';
	}
	return ac;
}