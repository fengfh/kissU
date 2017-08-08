/**
 * jquery.plupload.queue.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

// JSLint defined globals
/*global plupload:false, jQuery:false */

(function($) {
	var uploaders = {};

	function _(str) {
		return plupload.translate(str) || str;
	}

	function renderUI(id, target) {
		// Remove all existing non plupload items
		target.contents().each(function(i, node) {
			node = $(node);
			if (!node.is('.plupload')) {
				node.remove();
			}
		});

		target.prepend(
			'<div class="plupload_wrapper plupload_scroll">' +
				'<div id="' + id + '_container" class="plupload_container">' +
					'<div class="plupload">' +
						'<div class="plupload_content">' +
							'<div class="plupload_filelist_header">' +
								'<div class="plupload_file_name">' + _('文件名') + '</div>' +
								'<div class="plupload_file_action">&nbsp;</div>' +
								'<div class="plupload_file_status"><span>' + _('状态') + '</span></div>' +
								'<div class="plupload_file_size">' + _('文件大小') + '</div>' +
								'<div class="plupload_clearer">&nbsp;</div>' +
							'</div>' +

							'<ul id="' + id + '_filelist" class="plupload_filelist"></ul>' +

							'<div class="plupload_filelist_footer">' +
								'<div class="plupload_file_name">' +
									'<div class="plupload_buttons">' +
										'<a href="#" class="plupload_button plupload_add">' + _('浏览') + '</a>' +
										'<a href="#" class="plupload_button plupload_start">' + _('上传') + '</a>' +
										'<a href="#" class="plupload_button plupload_close">' + _('关闭') + '</a>' +
									'</div>' +
									'<span class="plupload_upload_status"></span>' +
								'</div>' +
								'<div class="plupload_file_action"></div>' +
								'<div class="plupload_file_status"><span class="plupload_total_status">0%</span></div>' +
								'<div class="plupload_file_size"><span class="plupload_total_file_size">0 b</span></div>' +
								'<div class="plupload_progress">' +
									'<div class="plupload_progress_container">' +
										'<div class="plupload_progress_bar"></div>' +
									'</div>' +
								'</div>' +
								'<div class="plupload_clearer">&nbsp;</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<input type="hidden" id="' + id + '_count" name="' + id + '_count" value="0" />' +
			'</div>'
		);
		
	}

	$.fn.pluploadQueue = function(settings) {
		if (settings) {
			
			this.each(function() {
				var uploader, target, id;

				target = $(this);
				id = target.attr('id');

				if (!id) {
					id = plupload.guid();
					target.attr('id', id);
				}
				
				uploader = new plupload.Uploader($.extend({
					dragdrop : true,
					container : id
				}, settings));

				// Call preinit function
				if (settings.preinit) {
					settings.preinit(uploader);
				}

				uploaders[id] = uploader;

				function handleStatus(file) {
					var actionClass;
					
					$('#' + file.id).find('a').css('display', 'block');

					if (file.status == plupload.DONE) {
						actionClass = 'plupload_done';
					}

					if (file.status == plupload.FAILED) {
						actionClass = 'plupload_failed';
					}

					if (file.status == plupload.QUEUED) {
						actionClass = 'plupload_delete';
					}

					if (file.status == plupload.UPLOADING) {
						actionClass = 'plupload_uploading';
					}

					$('#' + file.id)
						.removeClass('plupload_done plupload_failed plupload_delete plupload_uploading')
						.addClass(actionClass) ;
				}

				function updateTotalProgress() {
					if(settings.updateTotalProgress){
						settings.updateTotalProgress(uploader.total.percent + '%' , uploader) ;
					}
					
					$('span.plupload_total_status', target).html(uploader.total.percent + '%');
					$('div.plupload_progress_bar', target).css('width', uploader.total.percent + '%');
					$('span.plupload_upload_status', target).text('已上传' + uploader.total.uploaded + '/' + uploader.files.length + ' 文件');

					// All files are uploaded
					if (uploader.total.uploaded == uploader.files.length) {
						uploader.stop();
						$('li.plupload_delete a,div.plupload_buttons', target).show();
						$('span.plupload_upload_status', target).hide();
					}
				}

				function updateList() {
					var fileList = $('ul.plupload_filelist', target).html(''), inputCount = 0, inputHTML;

					$.each(uploader.files, function(i, file) {
						inputHTML = '';

						if (file.status == plupload.DONE) {
							if (file.target_name) {
								inputHTML += '<input type="hidden" name="' + id + '_' + inputCount + '_tmpname" value="' + plupload.xmlEncode(file.target_name) + '" />';
							}

							inputHTML += '<input type="hidden" name="' + id + '_' + inputCount + '_name" value="' + plupload.xmlEncode(file.name) + '" />';
							inputHTML += '<input type="hidden" name="' + id + '_' + inputCount + '_status" value="' + (file.status == plupload.DONE ? 'done' : 'failed') + '" />';
	
							inputCount++;

							$('#' + id + '_count').val(inputCount);
						}

						fileList.append(
							'<li id="' + file.id + '" class="ui-state-default">' +
								'<div class="plupload_file_name"><span>' + file.name + '</span></div>' +
								'<div class="plupload_file_action"><a href="#"></a></div>' +
								'<div class="plupload_file_status">' + file.percent + '%</div>' +
								'<div class="plupload_file_size">' + plupload.formatSize(file.size) + '</div>' +
								'<div class="plupload_clearer">&nbsp;</div>' +
								inputHTML +
							'</li>'
						);
						
						$('#'+file.id+" .plupload_file_name").width( ($('#' + id + '_filelist').width() - 180)+"px" ) ;
						handleStatus(file);

						$('#' + file.id + '.plupload_delete a').click(function(e) {
							$('#' + file.id).remove();
							uploader.removeFile(file);

							e.preventDefault();
						});
					});

					$('span.plupload_total_file_size', target).html(plupload.formatSize(uploader.total.size));

					if (uploader.total.queued === 0) {
						$('span.plupload_add_text', target).text(_('Add files.'));
					} else {
						$('span.plupload_add_text', target).text(uploader.total.queued + ' files queued.');
					}

					$('a.plupload_start', target).toggleClass('plupload_disabled', uploader.files.length === 0);

					// Scroll to end of file list
					fileList[0].scrollTop = fileList[0].scrollHeight;

					updateTotalProgress();

					// Re-add drag message if there is no files
					if (!uploader.files.length && uploader.features.dragdrop && uploader.settings.dragdrop) {
						$('#' + id + '_filelist').append('<li class="plupload_droptext">' + _("Drag files here.") + '</li>');
					}
				}

				uploader.bind("UploadFile", function(up, file) {
					$('#' + file.id).addClass('plupload_current_file');
				});

				uploader.bind('Init', function(up, res) {
					renderUI(id, target);
					
					$('#' + id + '_container .plupload_filelist_header .plupload_file_name')
						.width( ($('#' + id + '_filelist').width() - 180)+"px" ) ;
					
					if(settings.height){
						$('#' + id + '_filelist').height(settings.height) ;
					}
					// Enable rename support
					if (!settings.unique_names && settings.rename) {
						$('#' + id + '_filelist div.plupload_file_name span', target).live('click', function(e) {
							var targetSpan = $(e.target), file, parts, name, ext = "";

							// Get file name and split out name and extension
							file = up.getFile(targetSpan.parents('li')[0].id);
							name = file.name;
							parts = /^(.+)(\.[^.]+)$/.exec(name);
							if (parts) {
								name = parts[1];
								ext = parts[2];
							}

							// Display input element
							targetSpan.hide().after('<input type="text" />');
							targetSpan.next().val(name).focus().blur(function() {
								targetSpan.show().next().remove();
							}).keydown(function(e) {
								var targetInput = $(this);

								if (e.keyCode == 13) {
									e.preventDefault();
									// Rename file and glue extension back on
									file.name = targetInput.val() + ext;
									targetSpan.text(file.name);
									targetInput.blur();
								}
							});
						});
					}

					$('a.plupload_add', target).attr('id', id + '_browse');

					up.settings.browse_button = id + '_browse';

					// Enable drag/drop
					if (up.features.dragdrop && up.settings.dragdrop) {
						up.settings.drop_element = id + '_filelist';
						$('#' + id + '_filelist').append('<li class="plupload_droptext">' + _("Drag files here.") + '</li>');
					}

					/*$('#' + id + '_container').attr('title', 'Using runtime: ' + res.runtime);*/
					
					$('a.plupload_start', target).click(function(e) {
						if (!$(this).hasClass('plupload_disabled')) {
							uploader.start();
						}

						e.preventDefault();
					});
					
					$('a.plupload_close', target).click(function(e) {
						if( up.settings.close ){
							up.settings.close() ;
						}
					});

					$('a.plupload_stop', target).click(function(e) {
						uploader.stop();

						e.preventDefault();
					});

					$('a.plupload_start', target).addClass('plupload_disabled');
					
					
					if( settings.initAfter ){
						settings.initAfter(uploader) ;
					}
				});

				uploader.init();

				// Call setup function
				if (settings.setup) {
					settings.setup(uploader);
				}

				uploader.bind("Error", function(up, err) {
					var file = err.file, message;

					if (file) {
						message = err.message;

						if (err.details) {
							message += " (" + err.details + ")";
						}

						$('#' + file.id).attr('class', 'plupload_failed').find('a').css('display', 'block').attr('title', message);
					}
				});

				uploader.bind('StateChanged', function() {
					if (uploader.state === plupload.STARTED) {
						if(settings.max_file_num > 1) {
							$('li.plupload_delete a,div.plupload_buttons', target).hide();
							$('span.plupload_upload_status,div.plupload_progress,a.plupload_stop', target).css('display', 'block');
							$('span.plupload_upload_status', target).text('已上传 0/' + uploader.files.length + ' 文件');
						}
					} else {
						$('a.plupload_stop,div.plupload_progress', target).hide();
						$('a.plupload_delete', target).css('display', 'block');
					}
				});
				
				/************************************/
				if(settings.FilesAdded){
					settings.FilesAdded( uploader ) ;
				}
				/************************************/

				uploader.bind('QueueChanged', updateList);

				uploader.bind('StateChanged', function(up,file,props) {
					
					if (up.state == plupload.STOPPED) {
						updateList();
					}
					if( settings.StateChanged ) {
						settings.StateChanged( up.state , up ) ;
					}
				});

				uploader.bind('FileUploaded', function(up, file) {
					handleStatus(file);
				});
				
				
				uploader.bind('FileUploaded', function(up,file,props){
					var _res = props.response ;
					if(typeof _res == 'string'){
						_res = eval( '('+_res+')' ) ;
					}
					if(settings.onComplete){ settings.onComplete( _res )} ;
				} );

			
				uploader.bind('FileUploaded', function(up,file,props){
					uploader['response'] = uploader['response']||[] ;
					var _res = props.response ;
					if(typeof _res == 'string'){
						_res = eval( '('+_res+')' ) ;
					}
					
					if( settings.FileUploaded ) {
						if( !settings.FileUploaded( up,file ,_res ) )
							return ;
					}
	
					var __res = { id:file.id,fileId:file.id,fileName:file.name,filePath:_res.filePath,cacheId:_res.fileid } ;//_res.fileid[0]
					uploader['response'].push( __res ) ;
					if( uploader.total.queued <=0 ){
						if(settings._onAllComplete){ settings._onAllComplete( uploader['response'] ,uploader ,_res ) ;} ;
						if(settings.onAllComplete){ settings.onAllComplete( uploader['response'],uploader ,_res) ; } ;
						uploader['response'] = null ;
					}
				} );
				
				uploader.bind("UploadProgress", function(up, file) {
					// Set file specific progress
					$('#' + file.id + ' div.plupload_file_status', target).html(file.percent + '%');
					handleStatus(file);
					updateTotalProgress();
				});
			});

			return this;
		} else {
			// Get uploader instance for specified element
			return uploaders[$(this[0]).attr('id')];
		}
	};
	
	var initVersionCount = 0 ;
	function getFlashVersion() {
			var version;
			try {
				version = navigator.plugins['Shockwave Flash'];
				version = version.description;
			} catch (e1) {
				try {
					version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
				} catch (e2) {
					version = '0.0';
				}
			}
			version = version.match(/\d+/g);
			initVersionCount++ ;
			return parseFloat(version[0] + '.' + version[1]);
		}
		
	function str2Json(str){
	 	return (new Function( "return " + str ))();
	}
		
	$.fn.uploadReload= function(up){
		var options=$(this).data("upload_options"); 
		var me=this;
		if( !options.load_url ) return ;
		
		
		$.request({
			url:options.load_url,
			data:options.load_params,
			success: function(data, textStatus){
				if(typeof data == 'string'){
					data = str2Json(data) ;
				}
				var renderContainer = options.render_container||('#'+options.pluploadId+'_container .plupload_mul_default_container') ;
				$(me).uploadRender(data,renderContainer,up, options,options.pluploadId);
			}
		}) ;
	}
	
	$.fn.uploadRender = function(resps,renderContainer,up){
		var options=$(this).data("upload_options"); 
		var _id = options.pluploadId ;
		
		if(options.render){
			var attachments = [] ;
			$(resps).each(function(){
				var id   = this.id || this.seqId ;
				var name = this.name || this.attrName ;
				attachments.push({id:id,name:name})
				options.render(attachments) ;
			});
			return ;
		}
		
		var html = ["<ul class='plupload-renderul'>"] ;

		$(resps).each(function(){
			var id   = this.id || this.seqId ;
			var name = this.name || this.attrName ;
			
			html.push("<li class='plupload-row' id='"+_id+id+"_r' title='"+name+"'>");
			html.push("<span class='upload-filename'>"+name+"</span>");
			html.push("<span class='upload-btn'>");
			if(options.del_url || options.delAction){
				html.push("<a title='删除附件' href='#' class='upload-del' fId='"+id+"'></a>") ;
			}
			
			if(options.download_url){
				html.push("<a title='下载附件' href='#' class='upload-download' fId='"+id+"'></a>") ;
			}
			
			
			html.push("</span>");
			html.push("</li>");
		}) ;
		
		html.push("</ul>");
		
		$( renderContainer ).html( html.join('') ) ;
		
		$(".plupload-row").each(function(){
			$(this).hover(function(){
				$(this).addClass("upload-row-over").find(".upload-btn").show();
			},function(){
				$(this).removeClass("upload-row-over").find(".upload-btn").hide();
			});
		}) ;
		
		$( renderContainer +' .upload-del').unbind("click").bind('click', function(e){
			var self = this ;
			var _confirm = $.messageBox?$.messageBox.confirm:function(params){
					params.callback = params.callback||function(){} ;
					params.callback(window.confirm(params.message)) ;
			} ;
			
			_confirm({message:"确认删除吗？",callback:function(result){
				if(result){
					var fId = $.trim($(self).attr('fId'))  ;
					
					if(options.delAction){
						if( !options.delAction(fId) ) return ;
					}
					
					if(options.del_url){
						var bool = false ;
						var params= $.extend({},options.load_params,{fileId:fId});
						$.request({
							url:options.del_url,
							data:params,
							async:false,
							dataType:"json",
							success: function(data, textStatus){
								bool= true ;
							}
						}) ;
						if(!bool) return ;
					}
					
					$(resps).each( function(){
						if( this.id == fId ){
							try{ up.removeFileById( this.fileId ) ; }catch(e){}//控件删除
						}
					} ) ;
					$("#"+_id+fId+"_r").remove();//页面元素清除
				}
			}}) ;
			
			
					
			e.stopPropagation() ;
			return false;
		}) ;
		
		$( renderContainer +' .upload-download').live('click', function(e){
			var fId = $.trim($(this).attr('fId'))  ;
			var iframe = $("#"+_id+"_downloadIframe") ;
			var split = options.download_url.indexOf("?")<=-1?"?":"&" ;
			iframe.attr("src",jQuery.utils.parseUrl(options.download_url)+split+"fileId="+fId);
			return false;
		}) ;
	}
	
	$.fn.upload = function(_options){
		if( $(this).attr("__render__") == "true" ) return ;
		if (getFlashVersion() < 10 ) {
			if( initVersionCount > 1 ) return ;
			
			var browser = "msie" ;
			if($.browser.webkit){
				browser = "webkit" ;
			}else if($.browser.mozilla){
				browser = "mozilla" ;
			}

			//处理Flash版本
			$.open( $.utils.scriptPath("upload")+"upload/upgrade.html?browser="+browser+"&"+new Date().getTime(),350,170,null ,null , {title:""}) ;
			return;
		}
		
		$(this).attr("__render__","true") ;

		var me = this ;
		var _width = $(this).width()  ; 
		
		if( _width == 0 ){
			var isIE6 = false ;
			if ($.browser.msie){
				var bowser = "ie" ;
				var version = parseInt($.browser.version, 10) ;
				if( version == 6 ) isIE6 = true ;
			}
			
			if( !isIE6 ){
				var clz =$(me)[0].className ;
				var prxoy = $("<input type='text' style='position:fixed;left:-1000px;'>").appendTo(document.body).addClass( clz ) ;
				_width = Math.max( prxoy.width(), $(me).width() );
			}
			
			_width = _width||155 ;
		}
		if(_width == 'auto') _width = 100 ;
		if((_width+"").indexOf('px')!=-1)_width.replace("px",'') ;
		
		_width = parseInt(_width);
		var _id = me.attr('id')||plupload.guid() ;
		
		_options.url = jQuery.utils.parseUrl(_options.url) ;
		_options.pluploadId= _id ;
		
		var options = $.extend({},{
			runtimes:'flash',
			multipart:true,
			unique_names : true,
			multi_selection:false,
			chunk_size : '2mb',
			max_file_num:1,//默认只能选择一个文件
			flash_swf_url : getBasePath(_options)+'/plupload.flash.swf' 
		},_options) ;
		$.extend( options, {
			_onAllComplete:function(resps ,up,res){ // , fileIds,idnames
				
				var ids = [] ;
				$(resps).each(function(){
					ids.push(this.id) ;
				}) ;
				up['fileids'] = ids ;
				
				$(me).uploadReload(up) ;
			}
		}) ;
		
		$(this).data("upload_options",options);

		if(options.download_url){
			$(document.body).append("<iframe src='about:blank' style='display:none;' id='"+_id+"_downloadIframe'></iframe>");
		}

		if( options.max_file_num === 1){//单文件上传
			$.extend( options, {
				StateChanged:function(state,up){
					//stateProcess(state,up) ;
					stateProcess(state,_id) ;
				},
				updateTotalProgress:function( percent , uploader ){
					$( '#'+_id+'_container span.plupload_percent' ).html("<b>"+percent+"</b>&nbsp;");
					if (uploader.total.uploaded == uploader.files.length) {
						uploader.stop();
						$( '#'+_id+'_container span.plupload_percent' ).html("");
					}
				},
				FileUploaded:function(up,file ,_res){

					if( _res.success == false ){
						stateProcess("error" ,_id) ;
						//上传失败
						var message = _res.message ;
						jQuery.request.defaultErrorHandler(null , null , message,null) ;
						return false;
					}

					if( options.clearUploadField ){
						up.removeFile( file ) ;//控件删除
						$(me).val('');
						$( '#'+_id+'_container .plupload_prog_content' ).empty();//页面元素清除
						$( '#'+_id+'_container .plupload_prog_content' ).removeClass('progress-uploading progress-error progress-uploaded') ;
					}else{
						stateProcess("success" ,_id) ;
					}
					
					var $id = up.id +"_delete" ;
					$('#'+$id +"  .upload-del-action").one('click', function(e){
						var fileid = _res.fileid[0] ;
						var filePath = _res.filePath ;
						var bgFileId = _res.attachment.id ;
						
						if(options.delAction){
							if( !options.delAction(bgFileId,fileid) ) return ;
						}
						
						if( !options.clearUploadField ){
							up.removeFile( file ) ;//控件删除
							$(me).val('');
							$( '#'+_id+'_container .plupload_prog_content' ).empty();//页面元素清除
							$( '#'+_id+'_container .plupload_prog_content' ).removeClass('progress-uploading progress-error progress-uploaded') ;	
						}
						
						if(fileid && options.del_url ){//数据库删除
							var bool = false ;
							var params= $.extend({},options.load_params,{fileId:bgFileId,persistFilePath:filePath});
							$.request({
								url:options.del_url,
								data:params,
								async:false,
								dataType:"json",
								success: function(data, textStatus){
									bool= true ;
								}
							}) ;
							if(!bool) return ;
						}
						e.stopPropagation() ;
					}) ;
					
					
					return true ;
				},
				//uploader.total.percent + '%'
				FilesAdded:function(uploader){
					uploader.bind("Flash:SelectFiles", function(up, selected_files) {
						var fileNums = (up.files.length) + (selected_files.length );
						
						var uploadBefore =  options.uploadBefore||function(fileNums,up){
							return "" ;
						}
						
						var message = uploadBefore(fileNums,up) ;
						if(message){
							up.trigger('Error', {
								message : message
							});
							return false ;
						}
						return true ;
					});
					
					uploader.bind('FilesAdded',function(up, selected_files) {
						var file = selected_files[0] ;
						var $id = up.id +"_delete" ;
						var deleteHtml = "<div id='"+$id+"' class='progress_delete_link'><a href='#' class='upload-del-action' title='删除' ></a></div>" ;
						$( '#'+_id+'_container .plupload_prog_content' ).html("<span class='plupload_percent'></span>"+file.name + deleteHtml).attr("title",file.name) ;
						$( '#'+_id+'_container .plupload_start' ).click() ;
					});
				},
				initAfter:function(up){
					$( '#'+_id+'_container .plupload_filelist_header' ).hide();
					$( '#'+_id+'_container .plupload_filelist' ).hide();
					$( '#'+_id+'_container .plupload_file_status' ).hide();
					$( '#'+_id+'_container .plupload_file_size' ).hide();
					$( '#'+_id+'_container .plupload_start' ).hide();
					$( '#'+_id+'_container .plupload_file_action' ).hide();
					$( '#'+_id+'_container .plupload_close' ).hide();
					
					$( '#'+_id+'_container .plupload_add' ).html("<span class='btn-text'>浏览</span>")
						.addClass('plupload_button_clear').parent().addClass("ui-widget ui-state-default") ;
					$( '#'+_id+'_container .plupload_filelist_footer' ).removeClass('plupload_filelist_footer').css("height","26px");
					
					$( '#'+_id+'_container .plupload_render_con' ).css({"position":"absolute",right:0,top:0})
					//$( '#'+_id+'_container .plupload_render_con .plupload_add' ).css({"margin-top":"-2px","margin-right":"-1px","border":"none"})
				
					$( '#'+_id+'_container .plupload_prog_content' ).width(_width-$( '#'+_id+'_container .plupload_render_con' ).width()-20) ;
				}
			} ) ;

			$(this).wrap("<div id='"+_id+"_container' class='plupload_render_container plupload_filenum1 ui-widget ui-state-default ui-corner-all' style='width:"+_width+"px'></div>");
			
			if( ($(this).attr('type')||'').toLowerCase() == 'text' ){
				$( '#'+_id+'_container' ).append("<div class='plupload_render_con'>&nbsp;</div>") ;
				$( '#'+_id+'_container' ).append("<div class='plupload_prog_content'></div>") ;
				
				/*var width = ($.browser.msie && ($.browser.version == "6.0"))?0:45 ;
				var __w =  _width-$( '#'+_id+'_container .plupload_render_con' ).width() - width;//IE ok
				
				*/
			}
			$(this).hide() ;
			$(this).data("validate_target",$( '#'+_id+'_container' )) ;
			
			$( '#'+_id+'_container .plupload_render_con' ).pluploadQueue(options);
			
		}else{//多文件上传
			
			$.extend( options, {
				FileUploaded:function(up,file ,_res){
					if( _res.success == false ){
						//上传失败
						var message = _res.message ;
						jQuery.request.defaultErrorHandler(null , null , message,null) ;
						stateProcess("error" ,_id,file.id,file) ;
						return false;
					}
					stateProcess("success" ,_id,file.id,file) ;
					return true ;
				}
			} ) ;
			
			
			var selector = this ;
			if( options.render_container !== false || typeof options.render != 'undefined'){
				$(this).wrap("<div id='"+_id+"_container' class='plupload_multi_render_container'></div>");
				
				if( ($(this).attr('type')||'').toLowerCase() == 'text' ){
					$("<a href='#' id='"+_id+"_browser' class='plupload_button plupload_add'>" + _('浏览') +"</a><div class='plupload_mul_default_container'></div>").insertAfter( $(this) ) ;
				}
				if( options.render_container ){
					$( '#'+_id+'_container .plupload_mul_default_container' ).hide();
				}
				
				$(this).hide() ;
				selector = "#"+_id+"_browser" ;
			}
			
			$(selector).data("validate_target",$( '#'+_id+'_container')) ;
			
			var dialog = null ;
			$.extend( options, {
				close:function(){
					if(dialog) dialog.frwDom.find(".ui-dialog-content").dialogClose()  ;
				}
			}) ;
			$(selector).click( function(){
				var dH = (options.height||130)+66 ;
				dialog = $._upload_dialog ;
				//if( !dialog ){
					dialog = $.dialog({//155
						title:options.Title||'',
						width:410,
						height:dH,
						contentSelector:'',
						content:"&nbsp;",
						renderTop:false
					}) ;
					$._upload_dialog = dialog ;
				/*}else{
					dialog.show();
					dialog.title( options.Title,options.MessageTitle,options.Message ) ;
					dialog.setSize(410,dH);
				}*/
				setTimeout(function(){
					dialog.frwDom.addClass("upload-dialog").find(".ui-dialog-content").pluploadQueue(options);
				},100) ;
				
				return false ;
			} ) ;
		}
		
		if( options.load_url && options.load_params ){
			$(me).uploadReload();
		}
	} ;
	
	function stateProcess(state ,_id,upId,file){
		var tgt = null ;
		if(upId){
			tgt = $( '#'+upId  ) ;
			
			
			
			if( state === "start"){
				tgt.addClass('progress-uploading') ;
			}else if(state === 'success'){
				tgt.removeClass('progress-uploading plupload_failed').addClass('plupload_done') ;
			}else if(state === 'error'){
				tgt.removeClass("plupload_done").addClass('plupload_failed').find("a").css("display","block") ;
				file.status = plupload.FAILED ;
			}
			
		}else{
			tgt = $( '#'+_id+'_container .plupload_prog_content' ) ;
			
			if( state === "start"){
				tgt.addClass('progress-uploading') ;
			}else if(state === 'success'){
				tgt.removeClass('progress-uploading progress-error').addClass('progress-uploaded') ;
			}else if(state === 'error'){
				tgt.addClass('progress-error') ;
				file.status = plupload.FAILED ;
			}
		}
	}

	
	function getBasePath(_options){
		return _options.basePath||($.utils.scriptPath("upload")+"upload") ; //Config.contextPath+"/widgets/upload/" ;
	}
	

	$.uiwidget.register("upload",function(selector){
		selector.each(function(){
			var options = $(this).attr( $.uiwidget.options )||"{}";
			eval(" var jsonOptions = "+options) ;
			$(this).upload( jsonOptions ) ;
			
		});
	}) ;

})(jQuery);
