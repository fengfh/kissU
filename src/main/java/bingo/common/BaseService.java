/**
 * This file created at 2010-10-22.
 *
 * Copyright (c) 2002-2010 Bingosoft, Inc. All rights reserved.
 */
package bingo.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bingo.dao.IDao;

/**
 * <code>{@link BaseService}</code>
 *
 * 服务类基础类
 *
 * @author zhongt
 */
public class BaseService {
	protected final Logger	log	= LoggerFactory.getLogger(this.getClass());

	protected IDao			dao;

	/**
	 * @param dao the dao to set
	 */
	public void setDao(IDao dao) {
		this.dao = dao;
	}
}