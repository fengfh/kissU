/*
 * Inline Form Validation Engine 1.7, jQuery plugin
 * 
 * Copyright(c) 2010, Cedric Dugas http://www.position-relative.net
 * 
 * Form validation engine allowing custom regex rules to be added. Thanks to Francois Duquette and Teddy Limousin and everyone helping me find bugs on the forum Licenced under the MIT Licence
 */
 /**---------------------tipsy------------------**/
(function($) {
    $.fn.tipsy = function(options) {

        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        return this.each(function() {
            
            var opts = $.fn.tipsy.elementOptions(this, options);
            
            $(this).hover(function() {

                $.data(this, 'cancel.tipsy', true);

                var tip = $.data(this, 'active.tipsy');
                if (!tip) {
                    tip = $('<div class="tipsy"><div class="tipsy-inner"/></div>');
                    tip.css({position: 'absolute', zIndex: 100000});
                    $.data(this, 'active.tipsy', tip);
                }

                if ($(this).attr('title') || typeof($(this).attr('original-title')) != 'string') {
                    $(this).attr('original-title', $(this).attr('title') || '').removeAttr('title');
                }

                var title;
                if (typeof opts.title == 'string') {
                    title = $(this).attr(opts.title == 'title' ? 'original-title' : opts.title);
                } else if (typeof opts.title == 'function') {
                    title = opts.title.call(this);
                }
                
                if (!title || title.length==0) return false;

                tip.find('.tipsy-inner')[opts.html ? 'html' : 'text'](title || opts.fallback);

                var pos = $.extend({}, $(this).offset(), {width: this.offsetWidth, height: this.offsetHeight});
                tip.get(0).className = 'tipsy'; // reset classname in case of dynamic gravity
                tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).appendTo(document.body);
                var actualWidth = tip[0].offsetWidth, actualHeight = tip[0].offsetHeight;
                var gravity = (typeof opts.gravity == 'function') ? opts.gravity.call(this) : opts.gravity;

                switch (gravity.charAt(0)) {
                    case 'n':
                        tip.css({top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}).addClass('tipsy-north');
                        break;
                    case 's':
                        tip.css({top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}).addClass('tipsy-south');
                        break;
                    case 'e':
                        tip.css({top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}).addClass('tipsy-east');
                        break;
                    case 'w':
                        tip.css({top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}).addClass('tipsy-west');
                        break;
                }

                if (opts.fade) {
                    tip.css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: 0.8});
                } else {
                    tip.css({visibility: 'visible'});
                }

            }, function() {
                $.data(this, 'cancel.tipsy', false);
                var self = this;
                setTimeout(function() {
                    if ($.data(this, 'cancel.tipsy')) return;
                    var tip = $.data(self, 'active.tipsy');
                    if(!tip) return ;
                    if (opts.fade) {
                        tip.stop().fadeOut(function() { $(this).remove(); });
                    } else {
                        tip.remove();
                    }
                }, 100);

            });
            
        });
        
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.defaults = {
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        title: 'title'
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
})(jQuery);
/**---------------------validatorConfig------------------**/
(function($) {
	$.fn.validationConfig = function() {
	};
	$.validationConfig = {
		newLang : function() {
			$.validationConfig.allRules = {
				"required" : { // Add your regex rules here, you can take telephone as an example
					"executor" : "_required"
				},
				"pattern" : {
					"executor" : "_customRegex"
				},
                "func" : {
                    "executor" : "_funcCall"
                },
				"length" : {
					"executor" : "_length"
				},
				"range" : {
					"executor" : "_range"
				},
				"equalToField" : {
					"executor" : "_confirm",
					"alertText" : "输入值与相关信息不相符"
				},
				"url" : {
					"regex" : /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i,
					"executor" : "_customRegex",
					"alertText" : "网址输入不正确"
				},
				"qq" : {
					"regex" : /^[1-9][0-9]{4,}$/,
					"executor" : "_customRegex",
					"alertText" : "QQ号码输入不正确（非零开头的四位以上的数字）"
				},
				"telephone" : {
					"regex" : /^(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,
					"executor" : "_customRegex",
					"alertText" : "电话号码输入不正确"
				},
				"mobile" : {
					"regex" : /^1[3|5|8]\d{9}$/,
					"executor" : "_customRegex",
					"alertText" : "手机号码输入不正确"
				},
                "zip":{
                  "regex":/^[1-9]\d{5}$/,
                  "executor" : "_customRegex",
                  "alertText":"邮政编码输入不正确"
                },
				"email" : {
					"regex" : /^[a-zA-Z0-9_\.\-]+\@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,4}$/,
					"executor" : "_customRegex",
					"alertText" : "邮箱地址输入不正确"
				},
				"date" : {
					"regex" : /^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$/,
					"executor" : "_customRegex",
					"alertText" : "日期输入格式不正确（YYYY-MM-DD）"
				},
				"identity" : {
					"regex" : /\d{15}|\d{18}/,
					"executor" : "_customRegex",
					"alertText" : "身份证输入不正确"
				},
				"money" : {
					"regex" : /^[0-9]+(.[0-9]{2})?$/,
					"executor" : "_customRegex",
					"alertText" : "金额格式输入不正确"
				},
				"integer" : {
					"regex" : /^\d+$/,
					"executor" : "_customRegex",
					"alertText" : "输入值必须是正整数"
				},
				"double" : {
					"regex" : /^[0-9]+(.[0-9]+)?$/,
					"executor" : "_customRegex",
					"alertText" : "输入值必须是数值"
				},
				"digit" : {
					"regex" : /^[0-9]+$/,
					"executor" : "_customRegex",
					"alertText" : "只能输入数字"
				},
				"noSpecialCaracters" : {
					"regex" : /^[0-9a-zA-Z]+$/,
					"executor" : "_customRegex",
					"alertText" : "不允许输入字母和数字之外的特殊字符"
				},
				"letter" : {
					"regex" : /^[a-zA-Z]+$/,
					"executor" : "_customRegex",
					"alertText" : "只允许输入英文"
				},
				"chinese" : {
					"regex" : /^[\u0391-\uFFE5]+$/,
					"executor" : "_customRegex",
					"alertText" : "只允许输入中文"
				}
			}
		}
	}
	
	$.validationConfig.newLang() ;
	
})(jQuery);


/**-------------------validation-------------------**/
(function($) {
	var gravity = $.fn.tipsy.autoNS ;
	var validtorAttr = "["+$.uiwidget.validator+"]" ;
	var validtorAttrValue = $.uiwidget.validator ;
	
	$.fn.validation = function(settings) {
		if( $(this).attr("__validation_init__") )
			return ;
		$(this).attr("__validation_init__",true) ;
		
		if ($.validationConfig) { // IS THERE A LANGUAGE LOCALISATION ?
			allRules = $.validationConfig.allRules;
		} else {
			$.validation.debug("Validation engine rules are not loaded check your external file");
		}

		settings = jQuery.extend({
			allrules : allRules,
			validationEventTriggers : "focusout",
			inlineValidation : true,
			returnIsValid : false,
			liveEvent : true,
			beforeSuccess : function() {
			},
			failure : function() {
			}
		}, settings);
		$.validation.settings = settings;
		
		$(this).find(validtorAttr).attr("tipsy-render",true).tipsy({gravity: gravity,title:"errorInfo",trigger: 'manual'});
		

		if (settings.inlineValidation == true) { // Validating Inline ?
			if (!settings.returnIsValid) { // NEEDED FOR THE SETTING returnIsValid
				allowReturnIsvalid = false;
				if (settings.liveEvent) { // LIVE event, vast performance improvement over BIND
					$(this).find(validtorAttr+"[type!=checkbox]").live(settings.validationEventTriggers, function(caller) {
						_inlinEvent(this,settings.validationEventTriggers);
					})
					$(this).find(validtorAttr+"[type=checkbox],"+validtorAttr+"[type=radio]").live("click", function(caller) {
						_inlinEvent(this,"click");
					})
				} else {
					$(this).find(validtorAttr).not("[type=checkbox]").bind(settings.validationEventTriggers, function(caller) {
						_inlinEvent(this,settings.validationEventTriggers);
					})
					$(this).find(validtorAttr+"[type=checkbox],"+validtorAttr+"[type=radio]").bind("click", function(caller) {
						_inlinEvent(this,"click");
					})
				}
				
				$(this).find(validtorAttr).live("input",function(){ 
					if( $(this).attr("tagName") == "SELECT" ){
						_inlinEvent(this,"change");
					}else if( $(this).is(":hidden") ){
						_inlinEvent(this,"change");
					}
				})
				
				//下拉框添加校验到改变
				/*$(this).find("select"+validtorAttr).live("change",function(caller) {
						_inlinEvent(this,"change");
				}) ;*/
				
				$(this).find("input"+validtorAttr+"[type=text]").each(function(){
					var event = $(this).attr("event") ;
					event = (event===false||event==='false')?null:(event||'keyup');
					if(event){
						$(this).bind(event , function(caller){
							_inlinEvent(this,event);
						}) ;
					}
				}) ;

				$(this).find("textarea"+validtorAttr).each(function(){
					var event = $(this).attr("event") ;
					if(event){
						$(this).bind(event , function(caller){
							_inlinEvent(this,event);
						}) ;
					}
				}) ;		
				firstvalid = false;
			}

			function _inlinEvent(caller,eventType,bool) {
				$.validation.settings = settings;
				if ($.validation.intercept == false || !$.validation.intercept) { // STOP INLINE VALIDATION THIS TIME ONLY
					$.validation.onSubmitValid = false;
					$.validation.loadValidation(caller,eventType);
				} else {
					$.validation.intercept = false;
				}
			}
		}
	
		//required
		$(this).find(validtorAttr).each(function(){
			if( $(this).attr(validtorAttrValue).indexOf("required")!=-1 ){
				if( $(this).parents(".control-group:first")[0] ){
					if($(this).parents(".control-group:first")
						.find(".required-star")[0] ) return ;
					$(this).parents(".control-group:first")
						.find("label.control-label")
						.prepend("<span class='required-star'>*</span>") ;
				}else{
					if($(this).parents("td:first").prev()
						.find(".required-star")[0] ) return ;
						
					if( $(this).parents("td:first").prev().find("label").length ){
						$(this).parents("td:first").prev()
						.find("label")
						.prepend("<span class='required-star'>*</span>") ;
					}else{
						$(this).parents("td:first").prev()
						.prepend("<span class='required-star'>*</span>") ;
					}
				}	
			}
		}) ;
		
		if (settings.returnIsValid) { // Do validation and return true or false, it bypass everything;
			return $.validation.validate(this, settings);
		}

		$(this).bind("submit.validation", function(caller) {
			$.validation.onSubmitValid = true;
			if ($.validation.validate(this).isError) {
				settings.failure && settings.failure();
				return false;
			}
		}) ;
	};

	$.validation = {
		defaultSetting : function(caller) { // NOT GENERALLY USED, NEEDED FOR THE API, DO NOT TOUCH
			if ($.validationConfig) {
				allRules = $.validationConfig.allRules;
			} else {
				$.validation.debug("Validation engine rules are not loaded check your external file");
			}
			settings = {
				allrules : allRules,
				validationEventTriggers : "blur",
				inlineValidation : true,
				returnIsValid : false,
				failure : function() {
				}
			}
			$.validation.settings = settings;
		},

		loadValidation : function(caller,eventType) { // GET VALIDATIONS TO BE EXECUTED
			var rules = new Array();
			if (!$.validation.settings)
				$.validation.defaultSetting();
				
			var getRules = $(caller).attr(validtorAttrValue);
			
			if($(caller).attr($.uiwidget.options)){
				var options = $(caller).attr($.uiwidget.options) ;
				if(options){
					eval("options = "+(options||"{}")) ;
					if(options.tipsTarget){
						$(caller).data("validate_target",$(options.tipsTarget)) ;
					}
				}
			}
			
			if (!getRules)
				return false;
			var ruleOptions = getRules.match(/\[[^\]]+(\]\]|\])/g);
			if (ruleOptions) {
				$.each(ruleOptions, function(index, value) {
					getRules = getRules.replace(this, ("##" + index));
				});
			}

			getRules = getRules.split(",");
			$.each(getRules, function(index, value) {

				var ruleAndOption = this.split("##");
				
				if (ruleAndOption && ruleAndOption.length == 2) {
					rules.push({
						name : ruleAndOption[0],
						options : ruleOptions[ruleAndOption[1]].replace(/^\[|\]$/g, "").split(",")
					});
				} else {
					rules.push({
						name : ruleAndOption[0],
						options : []
					});
				}
			});

			return $.validation.validateCall(caller, rules,eventType)
		},

		validateCall : function(caller, rules,eventType) { // EXECUTE VALIDATION REQUIRED BY THE USER FOR THIS FIELD
			if( $(caller).attr("tipsy-render") != true ){
				$(caller).attr("tipsy-render",true).tipsy({gravity: gravity,title:"errorInfo",trigger: 'manual'});
			}

			var promptText = "";

			//if (!$(caller).attr("id"))
			//	$.validation.debug("该字段必须设定ID属性: " + "name=" +$(caller).attr("name") + " validator=" + $(caller).attr("validator"));

			var callerName = $(caller).attr("name");
			$.validation.isError = false;
			callerType = $(caller).attr("type");

			$.each(rules, function(i, v) {
				
				var validator = $.validation.settings.allrules[this.name];
				if (validator) {
					eval(validator.executor + "(caller,this,eventType)");
				} else {
                    $.validation.debug("验证器拼写有误: " + "name=" +$(caller).attr("id") + " validator=" + $(caller).attr("validator"));
                    return false;
                }
				if (promptText.length > 0) {
					return false;
				}
			});

			radioHack();

			if ($.validation.isError == true) {
				$.validation.buildPrompt(caller, promptText);
			} else {
				$.validation.closePrompt(caller );
			}

			/* UNFORTUNATE RADIO AND CHECKBOX GROUP HACKS */
			/* As my validation is looping input with id's we need a hack for my validation to understand to group these inputs */
			function radioHack() {
				if ($("input[name='" + callerName + "']").size() > 1 && (callerType == "radio" || callerType == "checkbox")) { // Hack for radio/checkbox group button, the validation go the first radio/checkbox of the group
					caller = $("input[name='" + callerName + "'][type!=hidden]:first");
				}
			}

			/* VALIDATION FUNCTIONS */
			function _required(caller, rule) { // VALIDATE BLANK FIELD
				
				var callerType  = $(caller).attr("type");
				var tagName 	= $(caller)[0].tagName ;
				
				if (callerType == "text" || callerType == "password" || tagName == "TEXTAREA"|| callerType == "hidden") {
					if (!$.trim($(caller).val())) {
						$.validation.isError = true;
						promptText += _buildPromptText("该输入项必填", rule.options[0]);
					}
				} else if (callerType == "radio" || callerType == "checkbox") {
					callerName = $(caller).attr("name");

					if ($("input[name='" + callerName + "']:checked").size() == 0) {
						$.validation.isError = true;
						if ($("input[name='" + callerName + "']").size() == 1) {
							promptText += _buildPromptText("该选项为必选项", rule.options[0]);
						} else {
							promptText += _buildPromptText("必须选择一个选项", rule.options[0]);
						}
					}
				} else if (callerType == "select-multiple") { // added by paul@kinetek.net for select boxes, Thank you	
					if (!$(caller).find("option:selected").val()) {
						$.validation.isError = true;
						promptText += _buildPromptText("该选择项必选", rule.options[0]);
					}
				} else if ( $(caller)[0] && tagName  == 'SELECT') { // added by paul@kinetek.net for select boxes, Thank you
					
					if (!$(caller).val()) {
						$.validation.isError = true;
						promptText += _buildPromptText("该选择项必选", rule.options[0]);
					}
				}
			}

			function _customRegex(caller, rule) { // VALIDATE REGEX RULES suport custom[email[errorInfo]] or email[errorInfo]
				//alert("---"+$(caller).val()+caller.outerHTML);
				
				if (_isValueEmpty(caller)) {
                    return false;
                }
				var customRule = rule.name;
				if (customRule == "pattern") {
					customRule = rule.options[0];
				}
				
				
				
				var customPT = customRule.match(/\[[^\]]+\]/g);
				if (customPT) {
					customRule = customRule.replace(customPT[0], "");
					customPT = customPT[0].replace(/^\[|\]$/g, "");
				}
				
				var pattern = $.validation.settings.allrules[customRule];
				
				if (!pattern) {
					$.validation.debug("正则表达式:" + customRule + " 没有定义，请检查拼写是否正确");
				}
			//alert(pattern.regex);
				if( typeof pattern.regex == 'string' ){
					pattern = new RegExp(pattern.regex) ;
				}else{
					pattern = eval(pattern.regex);
				}
				

				if (!pattern.test($.trim($(caller).val()))) {
					$.validation.isError = true;
					promptText += _buildPromptText($.validation.settings.allrules[customRule].alertText, customPT);
				}
			}

			function _funcCall(caller, rule,eventType) { // VALIDATE CUSTOM FUNCTIONS OUTSIDE OF THE ENGINE SCOPE
				var funce = rule.options[0];

				var fn = window[funce];
				if (typeof(fn) === 'function') {
					var fn_result = fn(caller,eventType);
					if (fn_result.isError) {
						$.validation.isError = true;
						promptText += _buildPromptText(fn_result.errorInfo);
					}
				}
			}

			function _confirm(caller, rule) { // VALIDATE FIELD MATCH
				var confirmField = rule.options[0];
				
				var conf = $("[name='"+confirmField+"']")[0]||$("#" + confirmField)[0] ;//兼容class写法

				if ($(caller).val() != $(conf).val()) {
					$.validation.isError = true;
					promptText += _buildPromptText($.validation.settings.allrules[rule.name].alertText, rule.options[1]);
				} else {
                    $.validation.closePrompt($(conf));
                }
			}

			function _lessThan(caller, rule) {
				var callerValueType = typeof $(caller);
			}

			function _length(caller, rule) { // VALIDATE LENGTH
				if (_isValueEmpty(caller)) {
					return false;
				}

				var minL = rule.options[0];
				var maxL = rule.options[1];
				var feildLength = $.trim($(caller).val()).replace(/[^\x00-\xff]/g,'**').length;
				
				if (feildLength < minL || feildLength > maxL) {
					$.validation.isError = true;
					promptText += _buildPromptText("当前输入长度为"+feildLength+"[输入长度必须在" + minL + "和" + maxL + "之间,中文长度为2]", rule.options[2]);
				}
			}

			function _range(caller, rule) {
				var min = rule.options[0];
				var max = rule.options[1];

				var callerType = $(caller).attr("type");
				if (callerType == "radio" || callerType == "checkbox") {
					var groupSize = $("input[name='" + $(caller).attr("name") + "']:checked").size();
					if (groupSize < min || groupSize > max) {
						$.validation.isError = true;
						promptText += _buildPromptText("必须选择" + min + "到" + max + "选项", rule.options[2]);
					}
				} else {
					if (_isValueEmpty(caller)) {
						return false;
					}
					var inputValue = parseFloat($.trim($(caller).val())) || 0;
					if (inputValue < min || inputValue > max) {
						$.validation.isError = true;
						promptText += _buildPromptText("输入的值必须在" + min + "到" + max + "之间", rule.options[2]);
					}
				}
			}

			function _buildPromptText(defaultPT, customPT) {
				return customPT ? customPT : defaultPT;
			}

			function _isValueEmpty(caller) {
				return !($(caller).val() && $.trim($(caller).val()).length > 0);
			}

			return ($.validation.isError) ? $.validation.isError : false;
		},

		showPrompt : function(caller) {
			/*if ($(caller).parent("td").hasClass("error")) {
				//alert($(caller).attr("errorInfo"));
			}*/
		},

		buildPrompt : function(caller, promptText) { // ERROR PROMPT CREATION AND DISPLAY WHEN AN ERROR OCCUR
			if($(caller).data("validate_target")){
				$(caller).data("validate_target").attr({'validate':true,errorInfo:promptText}) ;//validate_target
				$(caller).data("validate_target").tipsy({gravity: gravity,title:"errorInfo",trigger: 'manual'});
			}
			$(caller).parents("td:first").find('.tipsy-container').remove() ;

			if( $(caller).parents("._td_layout")[0] || !$(caller).parents(".control-group")[0]   ){
					$(caller).attr("errorInfo", promptText).parents("td:first").removeClass("success").addClass("_td_layout control-group error").append("<span class='tipsy-container tipsy-error'></span>")  ;
					$(caller).attr("errorInfo", promptText).parents("td:first").prev().find("label").addClass("validator-error-label") ;
			}else{
					$(caller).parents(".control-group:first").removeClass("error success") ;
				    $(caller).attr("errorInfo", promptText).parents(".control-group:first").addClass("error").find(">label").addClass("validator-error-label");
			}
		},

		closePrompt : function(caller) { // CLOSE PROMPT WHEN ERROR CORRECTED
			if (!$.validation.settings) {
				$.validation.defaultSetting() ;
			}
			if($(caller).data("validate_target")){
				$(caller).data("validate_target").attr({'validate':undefined,errorInfo:''}) ;//validate_target
			}
			$(caller).parents("td:first").find('.tipsy-container').remove() ;

			//判断是否为table布局
			if( $(caller).parents("._td_layout")[0] || !$(caller).parents(".control-group")[0]   ){
				$(caller).parents("td:first").removeClass("error").addClass("_td_layout control-group success").append("<span class='tipsy-container tipsy-success'></span>") ; ;
				$(caller).removeAttr("errorInfo").parents("td:first").prev().find("label").removeClass("validator-error-label").addClass("validator-success-label") ;
			}else{
				$(caller).parents(".control-group:first").removeClass("error success") ;
			    $(caller).removeAttr("errorInfo").parents(".control-group:first").addClass("success").find(">label").addClass("validator-success-label");; 
			}
		},

		debug : function(error) {
			if (!$("#debugMode")[0]) {
				$("body").append("<div id='debugMode'><div class='debugError'><strong>错误信息：</strong></div></div>");
			}
			$(".debugError").append("<div class='debugerror'>" + error + "</div>");
		},

		validate : function(caller) { // FORM SUBMIT VALIDATION LOOPING INLINE VALIDATION
			
			var stopForm = false;
            var errorInfo = "";

			$(caller).find(validtorAttr).each(function() {
				var validationPass = $.validation.loadValidation(this);
				return (validationPass) ? stopForm = true : "";
			});
  
            if (stopForm) {
	            $(caller).find("[errorInfo]").each(function(){
	                errorInfo += $(this).attr("errorInfo")+"\n";
	            });
	            //焦点在第一个上面
	            $(caller).find("[errorInfo]").first().focus() ;
            }

			return {isError:stopForm,errorInfo:errorInfo};
		}
	}
	
	
	$.validationAdapter  = function(rules){
		$(rules).each( function(index,fieldRule){
			buildFieldRule(fieldRule) ;
		}) ;
		function buildFieldRule(fieldRule){
			var valRules = fieldRule.ValidationRules ;
			var valAttr = [] ;
			$(valRules).each(function(index,rule){
				rule.ValidationType && valAttr.push( $.validationAdapterConfig[rule.ValidationType](rule) ) ;
			}) ;
			$("[name='"+fieldRule.FieldName+"']").attr(validtorAttrValue,valAttr.join(",")) ;
		}
	}
	
	$.fn.validationAdapter = function(rules){
	
		if(typeof rules == 'string'){
			eval("rules = "+rules) ;
		}
		
		var me = $(this) ;
		$(rules).each( function(index,fieldRule){
			buildFieldRule(fieldRule) ;
		}) ;
		function buildFieldRule(fieldRule){
			var valRules = fieldRule.ValidationRules ;
			var valAttr = [] ;
			$(valRules).each(function(index,rule){
				
				!$.validationAdapterConfig[rule.ValidationType]&&alert(rule.ValidationType+"未定义！");
				valAttr.push( $.validationAdapterConfig[rule.ValidationType](rule,me) ) ;
			}) ;
			$("[name='"+fieldRule.FieldName+"']",me).attr(validtorAttrValue,valAttr.join(",")) ;
		}
	}

	$.validationAdapterConfig = {
		_regexPatternIndex:0,
		required:function(rule){
			return "required"+( rule.ErrorMessage?"["+rule.ErrorMessage+"]":"") ;
		},length:function(rule){
			var params = rule.ValidationParameters ;
			return "length["+(params.min||0)+","+params.max+""+( rule.ErrorMessage?","+rule.ErrorMessage:"")+"]" ;
		},number:function(rule){
			return "double"+( rule.ErrorMessage?"["+rule.ErrorMessage+"]":"") ;
		},range:function(rule){
			var params = rule.ValidationParameters ;
			return "range["+(params.min||0)+","+params.max+""+( rule.ErrorMessage?","+rule.ErrorMessage:"")+"]" ;;
		},equalto:function(rule){
			var other = rule.ValidationParameters.other ;
			if (other.indexOf("*.") === 0) {
	            other = other.replace("*.", "");
	        }
			return "equalToField["+other+"]" ;//
		},regex:function(rule){
			var pattern = rule.ValidationParameters.pattern ;
			var ruleProxyName = "__regexPattern_"+$.validationAdapterConfig._regexPatternIndex ;
			
			
			$.validationConfig.allRules[ruleProxyName] = {
				"regex" : pattern ,
				"executor" : "_customRegex",
				"alertText" : rule.ErrorMessage||"" 
			};
			$.validationAdapterConfig._regexPatternIndex++ ;///^1[3|5|8]\d{9}$/
			
			return "pattern["+ruleProxyName+"]" ;
		},number:function(rule){
			return "double"+( rule.ErrorMessage?"["+rule.ErrorMessage+"]":"") ;
		},
		remote:function(rule,form){
			var ruleProxyName = "remoteProxy_"+$.validationAdapterConfig._regexPatternIndex ;
			var errorInfo = rule.ErrorMessage ;
			$.validationAdapterConfig._regexPatternIndex++ ;
			window[ruleProxyName] = function(caller,eventType){
				if( eventType && eventType != "focusout"  ) return ;
	
				var val    = $(caller).val() ;
				var url    = rule.ValidationParameters.url ;
				var fields = rule.ValidationParameters.additionalfields||"" ;
				var fids = fields.split(",") ;
				
				var data = {} ;
				
				$(fids).each(function(index,field){
					if(!field) return ;
					if (field.indexOf("*.") === 0) {
			            field = field.replace("*.", "");
			        }
			        data[field] = form?$(form).find(":input[name='" + field + "']").val():$(":input[name='" + field + "']").val();
				}) ;
				
				data[ $(caller).attr("name")||$(caller).attr("id") ] = val ;
				//alert(fields);
				var isError = true ;
				$.request({
					noblock:true,
					url:url,
					method:"post",
					data:data,
					async:false,
					success:function(data){
						if( data===true || data==="true" ){
							isError = false ;
						}else{
							errorInfo = data||errorInfo ;
						}
					}
				}) ;
				return {isError:isError,errorInfo:errorInfo} ;//isError
			}
			
			return "func["+ruleProxyName+"]" ;//
		}
	} ;
    
    $.validatorInit = $.validationInit = function(jqueryObj,json4Options){
      jqueryObj.validation(json4Options);
    }
    
    $.uiwidget.register("validator",function(selector){
		selector.each(function(){
			var rules = $(this).find("[name='__ValidatorRules']") ;
			if( rules.length ){
				var _ = jQuery.trim(rules.val())||"[]" ;
				//_ = _.replace("<![CDATA[","") ;
				//_ = _.replace("]]>","") ;
				
				$(this).validationAdapter(_) ;
			}
			
			$(this).validation() ;
		}) ;
	}) ;
	
	String.prototype.chineseslen = function() {
		return this.replace(/[^\x00-\xff]/g, "*").length ;
	};
	
	
	/**
	 * data-widget="ajaxform" data-options="{action:'',before:function(req){return true;},success:function(resp){},callback:}"
	 */
	$.uiwidget.register("ajaxform",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			jsonOptions.before = jsonOptions.before||function(){return true ;} ;
			var me = $(this) ;
			$(this).unbind("submit.ajaxform").bind("submit.ajaxform",function(e){
				var action = jsonOptions.action||$(this).attr("action") ;
				 if (!e.isDefaultPrevented()) { // if event has been canceled, don't proceed
			        e.preventDefault();
			        var json = me.toJson() ;
			        if( jsonOptions.before(json) ){//doSubmit
			        	$.request({
			        		type:"POST",
			        		url:action ,
			        		data:json,
			        		target:me,
			        		success: function(resp){
			        			if( jsonOptions.success ){
			        				jsonOptions.success(resp , jsonOptions ) ;
			        			}else{
			        				window.DefaultAjaxFormSuccess = window.DefaultAjaxFormSuccess||function(){} ;
			        				window.DefaultAjaxFormSuccess(resp , jsonOptions) ;
			        			}
			        		}//jsonOptions.success
			        	}) ;
			        }
			     }
			     return false ;
			})  ;
			
		}) ;
	}) ;
	
})(jQuery);
