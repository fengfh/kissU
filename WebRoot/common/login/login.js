//不让该页面嵌入其他框架页面
window.onload = function initForm(){//登录界面不嵌入到任何子页面
	var loginName = getCookie('username');
	if(loginName && loginName != ''){
		document.getElementById('username').value = loginName;
	}
	
	//初始化焦点
	if(document.getElementById('username').value == ''){
		document.getElementById('username').focus();
	}else{
		document.getElementById('password').focus();
	}
};

//记录登录信息
function saveLoginInfo(){
	setCookie('username',document.getElementById('username').value,30);
}

function doSubmit(){
	saveLoginInfo();
	document.forms[0].submit();
	return true;
}

//回车提交事件
function keyFunction(){	
	if( event.keyCode == 13 ){
		doSubmit();
	}
}

function setCookie(objName,objValue,objDays){//添加cookie 
  var str = objName + "=" + objValue; 
  if(objDays> 0){//为0时不设定过期时间，浏览器关闭时cookie自动消失 
    var date = new Date(); 
    var ms = objDays*24*3600*1000; 
    date.setTime(date.getTime() + ms); 
    str += "; expires=" + date.toGMTString(); 
  } 
  document.cookie = str; 
}

function getCookie(cookieName){//自定义函数    	
    var cookieString = document.cookie;    //获取cookie
    var start = cookieString.indexOf(cookieName + '=');//截取cookie的名
    if (start == -1)                         //若不存在该名字的 cookie
    return null;                            //返回空值
    start += cookieName.length + 1;                    
    var end = cookieString.indexOf(';', start);
    if (end == -1)                    //防止最后没有加“;”冒号的情况
    return cookieString.substring(start);//返回cookie值
    return cookieString.substring(start, end);//返回cookie值
}