<%@ page language="java" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<%@page import="java.net.URL"%>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
    <title></title>
    <meta http-equiv="pragma" content="no-cache"/>
	<meta http-equiv="cache-control" content="no-cache"/>
  
    <link href='../../themes/default/style.css' rel='stylesheet'></link>
    <link href='../../common/error/style.css' rel='stylesheet'></link>
    <script type="text/javascript" src="../../scripts/jquery.js"></script>
    <script type="text/javascript" src="../../scripts/jquery.utils.js"></script>
    
    <%!
	    static String getRealPath(ServletContext servletContext, String path){
			try {
				String realPath = servletContext.getRealPath(path);
				if (realPath == null) {
					URL u = servletContext.getResource("/");
					realPath = u.getPath()+"/"+path;
				}
				return realPath ;
			} catch (Exception e) {
				e.printStackTrace() ;
			}
			return null ;
		}
    %>
    <%
    	String browser = request.getParameter("browser") ;
    
    	String file = "/widgets/upload/install_flash_player_win_ie.exe" ;
    	if("webkit".equals(browser)){
    		file = "/widgets/upload/install_flash_player_win_chrome.exe" ;
    	}else if("mozilla".equals(browser)){
    		file = "/widgets/upload/install_flash_player_win_firefox.exe" ;
    	}
    
    	String realPath = getRealPath(pageContext.getServletContext(),file) ;
    	realPath = realPath.replaceAll("[\\\\]","/") ;
    %>
    <script type="text/javascript">
    
		Global = {contextPath:'<%=request.getContextPath()%>'} ;
    
    	function download(){
			$.file.download('<%=realPath%>') ;
        }
    </script>
</head>

<body style="overflow-y: hidden;">
<table border="0" cellspacing="0" cellpadding="0" width="100%">
      <tr>
        <td class="err_1">&nbsp;</td>
        <td class="err_2">&nbsp;</td>
        <td class="err_3">&nbsp;</td>
      </tr>
      <tr>
        <td class="err_4">&nbsp;</td>
        <td class="err_5">
        	 <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="left"><font color="red">您好，您的浏览器flash版本过低，上传控件无法使用！</font></td></tr>    
                <tr><td height="10"></td></tr>
            </table>
     <table width="100%" cellpadding="0" cellspacing="0">
	    <tr>
	        <td width="0%"></td>
	        <td width="*">请您按照以下步骤升级浏览器flash：</td>                
	    </tr>
	    <tr>
	        <td colspan="2"></td>
	    </tr>
	</table>
            <table width="100%">
	    <tr>
	        <td align="left" style="padding-left: 20px">
	            <p style="line-height: 150%">1. <a href="javascript:void(0)" onclick="download()">下载浏览器flash插件</a>
	        </td>            
	    </tr>
	    <tr>
	        <td align="left" style="padding-left: 20px">
	           <p style="line-height: 150%">2. 执行安装，然后重启浏览器
	        </td>            
	    </tr>
	    <tr>
	        <td align="left" style="padding-left: 20px">
	            
	        </td>            
	    </tr>
	</table>
	
	
	<table width="100%" cellpadding="0" cellspacing="0">
	    <tr>
	        <td align="right">
	        <table width="*" cellpadding="0" cellspacing="0">
	            <tr>                
	                <td valign="top"><a style="cursor:hand" onClick="javascript:window.close()"><img src="../../common/error/images/icon_DG_toolbar_goback.gif" title="关闭窗口" border="0"></a></td>
	                <td valign="middle"><a style="cursor:hand" onClick="javascript:window.close()" class="OW_btn_LINK">&nbsp;关闭窗口</a></td>
	            </tr>
	        </table>
	        </td>
	    </tr>
	</table>
        </td>
        <td class="err_6">&nbsp;</td>
      </tr>
      <tr>
        <td class="err_7">&nbsp;</td>
        <td class="err_8">&nbsp;</td>
        <td class="err_9">&nbsp;</td>
      </tr>
    </table>
</body>
</html>
