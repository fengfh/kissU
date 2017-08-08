/*
 * 级联选择控件
 * 
 * @author: lixh@bingosoft.net
 * @date  : 2012-07-16
 * 
 * 使用示例：
 * 		编程式使用方式：
  		$(function(){
			//1.静态数据
			$(".first").cascadeselect({
				data:function(id,text){
					id="" ;
					text = "" ;
					var data= [] ;
					data.push({id:"root0_"+id,text:"root0_"+text}) ;
					data.push({id:"root1_"+id,text:"root1_"+text}) ;
					data.push({id:"root2_"+id,text:"root2_"+text}) ;
					data.push({id:"root3_"+id,text:"root3_"+text}) ;
					data.push({id:"root4_"+id,text:"root4_"+text}) ;
					return data ;
				},
				target:[{
					selector:".two",
					CommandName : 'java.tree.command',
					params : {
						daoBeanName:'dao',
					 	sqlId : 'combotree.demo'
				    },
					target:{
						selector:".three",
						data:function(id,text){
							var data= [] ;
							data.push({id:"three0_"+id,text:"three0_"+text}) ;
							data.push({id:"three1_"+id,text:"three1_"+text}) ;
							data.push({id:"three2_"+id,text:"three2_"+text,selected:true}) ;
							data.push({id:"three3_"+id,text:"three3_"+text}) ;
							data.push({id:"three4_"+id,text:"three4_"+text}) ;
							return data ;
						},
						target:{
							selector:"button",
							type:"button",
							trigger:"click",
							beforeAction:function(prev){
								return true ;
							} ,
							action:function(prev){
								//alert( prev);
								alert($(prev).val());
							}
						}
					}
				},{
					selector:".two1",
					data:function(id,text){
						var data= [] ;
						data.push({id:"two10_"+id,text:"two10_"+text}) ;
						data.push({id:"two11_"+id,text:"two11_"+text}) ;
						data.push({id:"two12_"+id,text:"two12_"+text}) ;
						data.push({id:"two13_"+id,text:"two13_"+text,selected:true}) ;
						data.push({id:"two14_"+id,text:"two14_"+text}) ;
						return data ;
					}
				}]
			}) ;
		}) ;
		
		声明式使用方式：
		<select class="first" defaultValue="3"
				data-widget="cascadeselect" 
				data-options="{root:true,target:[{selector:'.two'},{selector:'.two1'}]}">
			<option value="1">1</option>
			<option value="2">2</option>
			<option value="3">3</option>
			<option value="4">4</option>
			<option value="5">5</option>
		</select>
		<br/><br/><br/>
		<select class="two" 
				data-widget="cascadeselect" 
				data-options="{CommandName:'java.tree.command',params:{daoBeanName:'dao',sqlId:'combotree.demo'},target:{selector:'.three'}}">
		</select>
		<select class="two1">
			<option value="1">1</option>
			<option value="2">2</option>
			<option value="3">3</option>
		</select>
		<br/><br/><br/>
		<select class="three"
				data-widget="cascadeselect" 
				data-options='{data:function(id,text){var data= [];data.push({id:"two10_"+id,text:"two10_"+text}) ;data.push({id:"two11_"+id,text:"two11_"+text,selected:true}) ;data.push({id:"two12_"+id,text:"two12_"+text});return data ;}}'>
		</select>
 */

;(function($){
	$.fn.cascadeselect = function(options){
		//初始化参数
		var opts = $.extend({} ,$.fn.cascadeselect.defaults , options ) ;
		
		$(this).each(function(){
			var defaultValue = $(this).attr("defaultValue") ;
			//给自己绑定事件
			opts.selector = this ;
			opts.defaultValue = defaultValue||opts.defaultValue ;
			triggerTarget.call(opts , "" , "") ;
		}) ;
	};
	
	function bindEvent( source ,parent ){
		var trigger = source.trigger||"change" ;
		var type    = source.type||"select" ;
		
		source.beforeAction = source.beforeAction||function(){ return true ; } ;
		source.afterAction = source.afterAction||function(){ return true ; } ;
		
		$(this).unbind(trigger+".cascadeselect").bind(trigger+".cascadeselect",function(){
			var _parent = this ;
			if( source.beforeAction.call(this , parent , source) ){
				var target = source.target ;
				if(source.action){
					source.action.call(this , parent ,source) ;
				}else  if( target ){
					var val='' ;
					var text = '' ;
					if( type == "select" ){
						val = $(this).val() ;
						text = $(this).find("option:selected").text() ;
					}else{
						val = $(this).val() ;
						text = val ;
					}
					if( $.isArray( target ) ){
						$(target).each(function(){
							triggerTarget.call( this  , val ,text ,_parent ) ;
						}) ;
					}else{
						triggerTarget.call( target , val ,text,_parent ) ;
					}
				}
				source.afterAction.call(this , parent , source) ;
			}
		}) ;
		if( $(this)[trigger] ){
			$(this)[trigger]() ;
		}else 
			$(this).trigger(trigger) ;
	}
	
	//触发目标操作
	function triggerTarget( id ,text,parent){
		var selector = $(this.selector) ;
		renderData.call( selector , this , id ,text ) ;
		
		if(this.target){
			bindEvent.call(selector,this ,parent )  ;
		}else if(this.trigger || this.beforeAction || this.action || this.afterAction ){
			bindEvent.call(selector,this ,parent)  ;
		}
	}
	
		
	function renderData( target , id ,text ){
		var type = target.type||"select" ;
		$._cascadeselect.render[type] = $._cascadeselect.render[type]||$._cascadeselect.render._default ;
		$._cascadeselect.render[type].call(this,target,id,text) ;
		
	}
	
	$._cascadeselect = $._cascadeselect||{} ;
	$._cascadeselect.render = {
			_default: function(target,id,text){
				try{
					var me = this ;
					var data = target.data ;
					var selected = me.attr("defaultValue")||target.defaultValue||"" ;
					$(me).val(selected||target.defaultValue||"") ;
				}catch(e){}
			},
			select : function(target,id,text){
				var me = this ;
				var data = target.data ;
				var selected = me.attr("defaultValue")||target.defaultValue||"" ;
				if(data){ //通过data获取数据源
					var _selectData = [] ;
					if( $.isFunction(data) ){
						_selectData = data( id , text ) ;
					}else{
						_selectData = data ;
					}
					//渲染下拉框
					me = me.empty() ;
					$(_selectData).each(function(){
						if( this.selected ) selected = this.id||this.ID ;
						$("<option></option>").appendTo(me).attr("value",this.id||this.ID).text(this.text||this.TEXT) ;
					}) ;
				}else if( target.CommandName ){//数据服务
					//var dataServiceUrl = window.dataServiceUrl||"~/dataservice" ;
					var data = null ;
					var _params = $.extend({} , target.params , {id:id,text:text}) ;
					target.params = target.params||{} ;
					
					$.dataservice(
						target.CommandName ,
						_params ,
						function (response){
							data = response;
						},
						{async:false}
					) ;
					
					var ret = data ;
		        	if(typeof data == 'string'){
		        		eval( 'ret = '+data ) ;
		        	}
		        	me = me.empty() ;
		        	$(ret).each(function(){
		        		if( this.selected ) selected = this.id||this.ID ;
						$("<option></option>").appendTo(me).attr("value",this.id||this.ID).text(this.text||this.TEXT) ;
					}) ;
				}else if( target.url ){ // 通过URL获取数据
					//TODO:URL获取数据暂时未实现
				}
				
				$(me).val(selected||target.defaultValue||"") ;
				
			},
			multiselect: function(target,id,text){
				var me = this ;
				$(me).attr("multiple","multiple") ;
				var selected = me.attr("defaultValue")||target.defaultValue||"" ;
				$._cascadeselect.render.select.call(this,target,id,text) ;
				$(selected.split(",")).each(function(index,item){
					if(!item) return ;
					$(me).find("option[value='"+item+"']").attr("selected","selected");
				}) ;
				
				if(jQuery(me).next().hasClass("multiSelect-cont")){
					jQuery(me).multiSelect().reload({ 
							oneOrMoreSelected: '*'
						}) ;
				}else{
					jQuery(me).multiSelect({ 
						oneOrMoreSelected: '*'
					}) ;
				}
			}
	};
	
	//设置默认参数
	$.fn.cascadeselect.defaults = {} ;
	
	//register declarative
	$.uiwidget.register("cascadeselect",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			
			if( jsonOptions.root ){ // linked 被链接
				var target = jsonOptions.target ;
				formatRegisterInfo(target) ;
				$(this).cascadeselect(jsonOptions) ;
			}
		});
	}) ;
	
	function formatRegisterInfo(target){
		if( $.isArray( target ) ){
			$(target).each(function(i,tgt){
				var seltor = tgt.selector ;
				var _options = $(seltor).attr( $.uiwidget.options )||"{}";
				eval(" var _jsonOptions = "+_options) ;
				target[i] = $.extend(target[i] , _jsonOptions ) ;
				if(target[i].target){
					formatRegisterInfo(target[i].target) ;
				} ;
			}) ;
		}else{
			var seltor = target.selector ;
			//alert(target.selector) ;
			var _options = $(seltor).attr( $.uiwidget.options )||"{}";
			//alert(seltor+"      "+_options);
			eval(" var _jsonOptions = "+_options) ;
			target = $.extend(target , _jsonOptions ) ;
			if(target.target){
				formatRegisterInfo(target.target) ;
			} ;
		}
	}
})(jQuery) ;