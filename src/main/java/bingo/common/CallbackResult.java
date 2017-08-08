/**
 * This file created at 2010-12-23.
 *
 * Copyright (c) 2002-2010 Bingosoft, Inc. All rights reserved.
 */
package bingo.common;

/**
 * <code>{@link CallbackResult}</code>
 *
 * 服务方法调用返回值消息格式
 *
 * @author zhongt
 */
public class CallbackResult {
	//是否成功
	private boolean	success;
	//返回消息
	private String	message;
	//出错处理所需的附属对象
	private Object	details;

	public CallbackResult() {
	}

	public CallbackResult(boolean success) {
		this.success = success;
	}

	public CallbackResult(boolean success, String message) {
		this.success = success;
		this.message = message;
	}

	public CallbackResult(boolean success, String message, Object details) {
		this.success = success;
		this.message = message;
		this.details = details;
	}

	public Object getDetails() {
		return details;
	}

	public void setDetails(Object details) {
		this.details = details;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}