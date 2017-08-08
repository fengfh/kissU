/*---------------- zhongtao add 2007/7/2 -----------------------------------------------------*/
/**
 * read only check box
 */
function eXcell_chr(cell) {
	this.base = eXcell_ch;
	this.base(cell);
	this.changeState = function() {
		return false;
	}
}
eXcell_chr.prototype = new eXcell_ch;
/*-----------------------------------------------------------------------------------------------------------*/		

//#ch_excell:04062008{
/**
*	@desc: checkbox editor
*	@returns: dhtmlxGrid cell editor object
*	@type: public
*/
function eXcell_cb(cell){
	if (cell){
		this.cell=cell;
		this.grid=this.cell.parentNode.grid;
		this.cell.obj=this;
	}

	this.disabledF=function(fl){
		if ((fl == true)||(fl == 1))
			this.cell.firstChild.disable = true;
		else
			this.cell.firstChild.disable = false;
	}

	this.changeState=function(){
		//nb:
		if ((!this.grid.isEditable)||(this.cell.parentNode._locked)||(this.isDisabled()))
			return;

		if (this.grid.callEvent("onEditCell", [
			0,
			this.cell.parentNode.idd,
			this.cell._cellIndex
		])){
			this.val=this.getValue()

			if (this.val == "1")
				this.setValue("0")
			else
				this.setValue("1")

			//this.cell.wasChanged=true;
			//nb:
			this.grid.callEvent("onEditCell", [
				1,
				this.cell.parentNode.idd,
				this.cell._cellIndex
			]);

			this.grid.callEvent("onCheckbox", [
				this.cell.parentNode.idd,
				this.cell._cellIndex,
				(this.val != '1')
			]);

			this.grid.callEvent("onCheck", [
				this.cell.parentNode.idd,
				this.cell._cellIndex,
				(this.val != '1')
			]);
		} else { //preserve editing (not tested thoroughly for this editor)
			this.editor=null;
		}
	}
	this.getValue=function(){
		return this.cell.chstate ? this.cell.chstate.toString() : "0";
	}

	this.isCheckbox=function(){
		return true;
	}
	this.isChecked=function(){
		if (this.getValue() == "1")
			return true;
		else
			return false;
	}

	this.setChecked=function(fl){
		this.setValue(fl.toString())
	}
	this.detach=function(){
		return this.val != this.getValue();
	}
	this.edit=null;
}
eXcell_cb.prototype=new eXcell;
eXcell_cb.prototype.setValue=function(val){
	this.cell.style.verticalAlign="middle"; //nb:to center checkbox in line
	//val can be int
	if (val){
		val=val.toString()._dhx_trim();

		if ((val == "false")||(val == "0"))
			val="";
	}

	if (val){
		val="1";
		this.cell.chstate="1";
	} else {
		val="0";
		this.cell.chstate="0"
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
	this.setCValue("<input type='checkbox' " + val +" onclick='this.parentNode.obj.changeState();(arguments[0]||event).cancelBubble=true; '>",
		this.cell.chstate);
}