/**
 * This file created at 2011-12-8.
 *
 * Copyright (c) 2002-2011 Bingosoft, Inc. All rights reserved.
 */
package bingo.demo.profile.model;

import bingo.dao.orm.annotations.UUID;

/**
 * <code>{@link SysProfile}</code>
 *
 * 系统配置实体类
 *
 * @author zhongtao
 */
public class SysProfile {
	@UUID
	private String	id;
	private String	name;
	private String	description;
	private Integer	activate = 0;
	private Integer	global = 0;

	/**
	 * @return the id
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the activate
	 */
	public Integer getActivate() {
		return activate;
	}

	/**
	 * @param activate the activate to set
	 */
	public void setActivate(Integer activate) {
		this.activate = activate;
	}

	/**
	 * @return the global
	 */
	public Integer getGlobal() {
		return global;
	}

	/**
	 * @param global the global to set
	 */
	public void setGlobal(Integer global) {
		this.global = global;
	}
}