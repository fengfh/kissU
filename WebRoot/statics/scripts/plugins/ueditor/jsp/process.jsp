<%@ page language="java" contentType="text/html; charset=UTF-8"  pageEncoding="UTF-8"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%@page import="java.util.ArrayList"%>
<%@page import="java.util.List"%>
<%@page import="bingo.common.core.ApplicationContext"%>    
<%@ page import="java.io.*"%>
<%@ page import="org.apache.commons.fileupload.*" %>
<%@ page import="org.apache.commons.fileupload.util.*" %>
<%@ page import="org.apache.commons.fileupload.servlet.*" %>
<%@ page import="org.apache.commons.fileupload.FileItemIterator" %>
<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory" %>
<%@ page import="java.io.BufferedInputStream" %>
<%@ page import="java.io.BufferedOutputStream" %>
<%@ page import="java.io.File"%>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.io.OutputStream" %>
<%@ page import="java.io.FileOutputStream" %>
<%@ page import="java.util.regex.Matcher" %>
<%@ page import="java.util.regex.Pattern" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.net.MalformedURLException"%>
<%@ page import="java.net.URL"%>
<%@ page import="java.net.URLConnection"%>

<%
    String action = request.getParameter("action") ;
    
    if("imageUpload".equals(action)){//图片上传
    	//保存文件路径
    	uploadLocalImage(request,response) ;
    }else if("fileUp".equals(action)){
    	fileUp(request,response) ;
    }else if("getRemoteImage".equals(action)){
    	getRemoteImage(request,response) ;
    }else if("imageManager".equals(action)){
    	imageManager(request,response) ;
    }else if("view".equals(action)){
    	viewImage(request,response ) ;
    	/*
   		 * 阻止getOutputStream() has already been called for this response错误出现
   		 **/
   		out.clear() ;
   		out = pageContext.pushBody();
    }
	    
    %>
    
    <%!
    public void fileUp(HttpServletRequest request,HttpServletResponse response  ) throws Exception{
    	String realPath = ApplicationContext.getProperty("ueditor.upload.file.path") ; 
        request.setCharacterEncoding("utf-8");
        //判断路径是否存在，不存在则创建
        File dir = new File(realPath);
        if(!dir.isDirectory()){
  	    	FileUtils.forceMkdir(dir) ;
  	    }

        if(ServletFileUpload.isMultipartContent(request)){
            DiskFileItemFactory dff = new DiskFileItemFactory();
            dff.setRepository(dir);
            dff.setSizeThreshold(1024000);
            ServletFileUpload sfu = new ServletFileUpload(dff);
            FileItemIterator fii = sfu.getItemIterator(request);
            String title = "";   //图片标题
            String url = "";    //图片地址
            String fileName = "";
        	String state="SUCCESS";
        	String contentType = "";
        	String uploadFolder = "" ;
        	String original = "" ;
            while(fii.hasNext()){
                FileItemStream fis = fii.next();
                try{
                    if(!fis.isFormField() && fis.getName().length()>0){
                        fileName = fis.getName();
                        original = fileName ;
        				Pattern reg=Pattern.compile("[.]rar|doc|zip|pdf|txt|swf|wmv$");
        				/*Matcher matcher=reg.matcher(fileName);
        				if(!matcher.find()) {
        					state = "文件类型不允许！";
        					break;
        				}*/
        				contentType = fileName.substring(fileName.lastIndexOf("."),fileName.length());
        				if( null != uploadFolder && !"".equals(uploadFolder) ){
        					realPath = realPath+"/"+uploadFolder ;
        					File uFdir = new File(realPath);
						  	 if(!uFdir.isDirectory()){
						  	     FileUtils.forceMkdir(uFdir) ;
						  	}
        		    	}
        				fileName = new Date().getTime()+fileName.substring(fileName.lastIndexOf("."),fileName.length()) ;
                        url = realPath+"/"+fileName;

                        BufferedInputStream in = new BufferedInputStream(fis.openStream());//获得文件输入流
                        FileOutputStream a = new FileOutputStream(new File(url));
                        BufferedOutputStream output = new BufferedOutputStream(a);
                        Streams.copy(in, output, true);//开始把文件写到你指定的上传文件夹
                    }else{
                        String fname = fis.getFieldName();

                        if(fname.indexOf("pictitle")!=-1){
                            BufferedInputStream in = new BufferedInputStream(fis.openStream());
                            byte c [] = new byte[10];
                            int n = 0;
                            while((n=in.read(c))!=-1){
                                title = new String(c,0,n);
                                break;
                            }
                        }
                        
                        if(fname.indexOf("uploadFolder")!=-1){//uploadFloder
                            BufferedInputStream in = new BufferedInputStream(fis.openStream());
                            byte c [] = new byte[10];
                            int n = 0;
                            while((n=in.read(c))!=-1){
                            	uploadFolder = new String(c,0,n);
                                break;
                            }
                            in.close();
                        }
                    }

                }catch(Exception e){
                    e.printStackTrace();
                }
            }
            //filePath.substring(filePath.lastIndexOf("/")+1,filePath.length())+"/"+fileName
            String url1 = getImageHttpUrl(realPath,fileName,realPath) ;
            response.getWriter().print("{'url':'"+url1+"','fileType':'"+contentType+"','state':'"+state+"','original':'"+original+"'}");
        }
    }
    
    public void viewImage(HttpServletRequest request,HttpServletResponse response  ) throws Exception{
    	String fileName = request.getParameter("src") ;
    	String type = request.getParameter("type") ;
    	
    	response.reset();
		response.setContentType("application/x-download");
	   	response.addHeader("Content-Disposition", "attachment;filename="+fileName);
	   	response.setCharacterEncoding("GBK") ;
	   	
	   	String path = ApplicationContext.getProperty("ueditor.upload.image.path") ; 
	   	if("file".equals(type)){
	   		path = ApplicationContext.getProperty("ueditor.upload.file.path") ; 
	   	}
	   	
	   	
		java.io.OutputStream outp = null;
	   	FileInputStream in = null;
	   	try {
	   		outp = response.getOutputStream();
	   		in = new FileInputStream(path+"/"+fileName);

	   		byte[] b = new byte[1024];
	   		int i = 0;

	   		while ((i = in.read(b)) > 0) {
	   			outp.write(b, 0, i);
	   		}
	   		//     
	   		outp.flush();
	   	} catch (Exception e) {
	   	} finally {
	   		if (null != in) {
	   			in.close();
	   			in = null;
	   		} 
	   	}
    }
    
    public void imageManager(HttpServletRequest request,HttpServletResponse response) throws Exception{
    	String uploadFolder = request.getParameter("uploadFolder") ;
    	String path = ApplicationContext.getProperty("ueditor.upload.image.path") ; 
    	File dir = new File(path);
  	    
  	    if(!dir.isDirectory()){
  	    	FileUtils.forceMkdir(dir) ;
  	    }
    	String imgStr ="";
    	String realpath = path ;
    	if( null != uploadFolder && !"".equals(uploadFolder) ){
    		realpath = path+"/"+uploadFolder ;
    	}
    	List<File> files = getFiles(realpath,new ArrayList());
    	for(File file :files ){
    		imgStr+= getImageHttpUrl(path,file.getName(),path ) +"ue_separate_ue";
    	}
    	if(!"".equals(imgStr))
    		imgStr = imgStr.substring(0,imgStr.lastIndexOf("ue_separate_ue"));
    	
    	response.getWriter().print(imgStr.trim());
    }
    
    
    public void getRemoteImage(HttpServletRequest request,HttpServletResponse response) throws Exception{
    	request.setCharacterEncoding("UTF-8");
    	response.setCharacterEncoding("UTF-8");
    	String url = request.getParameter("upfile");
    	String uploadFolder = request.getParameter("uploadFolder") ;
    	String uploadImagePath = ApplicationContext.getProperty("ueditor.upload.image.path") ;
    	File dir = new File(uploadImagePath);
  	    
  	    if(!dir.isDirectory()){
  	    	FileUtils.forceMkdir(dir) ;
  	    }
 	    String filePath = uploadImagePath  ;
 	   if( null != uploadFolder && !"".equals(uploadFolder) ){
 		  filePath = filePath+"/"+uploadFolder ;
	   	}
 	    
    	String[] arr = url.split("ue_separate_ue");
    	String[] outSrc = new String[arr.length];
    	for(int i=0;i<arr.length;i++){
    		//保存文件路径
    		String savePath = filePath ;//保存路径
    		//格式验证
    		Pattern reg=Pattern.compile("[.]jpg|png|jpeg|gif$");
    		Matcher matcher=reg.matcher(arr[i]);
    		if(!matcher.find()) {
    			return;
    		}
    		String saveName = System.currentTimeMillis() + arr[i].substring(arr[i].lastIndexOf("."));
    		//大小验证
    		URL urla = new URL(arr[i]);
    		URLConnection conn = urla.openConnection();

    		File savetoFile = new File(savePath +"/"+ saveName ); 
    		outSrc[i]= getImageHttpUrl(uploadImagePath , saveName, filePath) ;
    		// filePath.substring(filePath.lastIndexOf("/")+1,filePath.length()) +"/"+ saveName;
    		try {
    			InputStream is = conn.getInputStream();
    			OutputStream os = new FileOutputStream(savetoFile);
    			int b;
    			while ((b = is.read()) != -1) {
    				os.write(b);
    			}
    			os.close();
    			is.close();
    			// 这里处理 inputStream
    		} catch (Exception e) {
    			e.printStackTrace();
    			System.err.println("页面无法访问");
    		}
    	}
    	String outstr = "";
    	for(int i=0;i<outSrc.length;i++){
    		outstr+=outSrc[i]+"ue_separate_ue";
    	}
    	outstr = outstr.substring(0,outstr.lastIndexOf("ue_separate_ue"));
    	response.getWriter().print("{'url':'" + outstr + "','tip':'远程图片抓取成功！','srcUrl':'" + url + "'}" );
    }
    
   	public  void uploadLocalImage(HttpServletRequest request,HttpServletResponse response) throws Exception{

	    String uploadImagePath = ApplicationContext.getProperty("ueditor.upload.image.path") ;
	    String filePath = uploadImagePath  ;
	    //判断路径是否存在，不存在则创建
	    File dir = new File(uploadImagePath);
	    
	    if(!dir.isDirectory()){
	    	FileUtils.forceMkdir(dir) ;
	    }
	    if(ServletFileUpload.isMultipartContent(request)){
	        DiskFileItemFactory dff = new DiskFileItemFactory();
	        dff.setRepository(dir);
	        dff.setSizeThreshold(1024000);
	        ServletFileUpload sfu = new ServletFileUpload(dff);
	        FileItemIterator fii = sfu.getItemIterator(request);
	        String title = "";   //图片标题
	        String url = "";    //图片地址
	        String fileName = "";
	        String originalName = "";
	    	String state="SUCCESS";
	    	String ftype = "";
	    	String uploadFolder = "" ;
	    	
	    	try{
	    	    while(fii.hasNext()){
	    	        FileItemStream fis = fii.next();
	
	    	            if(!fis.isFormField() && fis.getName().length()>0){
	    	            	
	    	            	
	    	                fileName = fis.getName();
	    					Pattern reg=Pattern.compile("[.]jpg|png|jpeg|gif$");
	    					Matcher matcher=reg.matcher(fileName);
	    					if(!matcher.find()) {
	    						state = "文件类型不允许！";
	    						break;
	    					}
	    					ftype = matcher.group();
	    					fileName = new Date().getTime()+ftype;
	    					
	    					url = uploadImagePath+"/"+fileName;
							if( !"".equals(uploadFolder) ){
								 File uFdir = new File(uploadImagePath+"/"+uploadFolder);
							  	 if(!uFdir.isDirectory()){
							  	     FileUtils.forceMkdir(uFdir) ;
							  	  }
								 url = uploadImagePath+"/"+uploadFolder+"/"+fileName;
	    	            	}
	    					
	    	                BufferedInputStream in = new BufferedInputStream(fis.openStream());//获得文件输入流
	    	                FileOutputStream a = new FileOutputStream(new File(url));
	    	                BufferedOutputStream output = new BufferedOutputStream(a);
	    	                Streams.copy(in, output, true);//开始把文件写到你指定的上传文件夹
	    	            }else{
	    	                String fname = fis.getFieldName();
	    					if(fname.indexOf("fileName")!=-1){
	    						BufferedInputStream in = new BufferedInputStream(fis.openStream());
	    	                    byte c [] = new byte[10];
	    	                    int n = 0;
	    	                    while((n=in.read(c))!=-1){
	    	                    	originalName = new String(c,0,n);
	    	                        break;
	    	                    }
	    	                    in.close();
	
	    					}
	    	                if(fname.indexOf("pictitle")!=-1){
	                            BufferedInputStream in = new BufferedInputStream(fis.openStream());
	                            byte c [] = new byte[10];
	                            int n = 0;
	                            while((n=in.read(c))!=-1){
	                                title = new String(c,0,n);
	                                break;
	                            }
	                            in.close();
	                        }
	    	                
	    	                if(fname.indexOf("uploadFolder")!=-1){//uploadFloder
	                            BufferedInputStream in = new BufferedInputStream(fis.openStream());
	                            byte c [] = new byte[10];
	                            int n = 0;
	                            while((n=in.read(c))!=-1){
	                            	uploadFolder = new String(c,0,n);
	                                break;
	                            }
	                            in.close();
	                        }
	    	            }
	    	    }
	    	}catch(Exception e){
	            e.printStackTrace();
	        }
	    	
	    	
	    	title = title.replace("&", "&amp;").replace("'", "&qpos;").replace("\"", "&quot;").replace("<", "&lt;").replace(">", "&gt;");
	        response.getWriter().print("{'original':'"+originalName+"','url':'"+getImageHttpUrl(uploadImagePath,fileName,filePath)+"','title':'"+title+"','state':'"+state+"'}");
	
	    }
   	}
   
   	public String getImageHttpUrl(String uploadImagePath , String fileName,String filePath){
   		return fileName ;
   	}
   	
   	public List getFiles(String realpath, List files) {
    	File realFile = new File(realpath);
    	if (realFile.isDirectory()) {
    		File[] subfiles = realFile.listFiles();
    		for(File file :subfiles ){
    			if(file.isDirectory()){
    				getFiles(file.getAbsolutePath(),files);
    			}else{
    				Pattern reg=Pattern.compile("[.]jpg|png|jpeg|gif$");
    				Matcher matcher=reg.matcher(file.getName());
    				if(matcher.find()) {
    					files.add(file);
    				}
    			}
    		}
    	}
    	return files;
    }
    %>
