/**
 * This file created at 2011-12-8.
 *
 * Copyright (c) 2002-2011 Bingosoft, Inc. All rights reserved.
 */
package bingo.demo.profile;

import org.lightframework.mvc.Result;
import org.springframework.stereotype.Controller;

import bingo.demo.profile.service.ProfileService;


/**
 * <code>{@link ProfileController}</code>
 *
 * 系统配置控制类
 *
 * @author zhongtao
 */
@Controller(value="demo.profile")
public class ProfileController {
	private ProfileService	profileService;

	/**
	 * @return the profileService
	 */
	public ProfileService getProfileService() {
		return profileService;
	}

	/**
	 * @param profileService the profileService to set
	 */
	public void setProfileService(ProfileService profileService) {
		this.profileService = profileService;
	}
	
	public void createProfile() {
		Result.setAttribute("title", "新增环境信息");
		Result.forward("/modules/demo/profile/edit_sys_profile.jsp");
	}
	
	public void editProfile(String profileId) {
		Result.setAttribute("title", "修改环境信息");
		Result.setAttribute("profile", profileService.getProfile(profileId));
		Result.forward("/modules/demo/profile/edit_sys_profile.jsp");
	}
	
	public void createProfileParameter(String profileId) {
		Result.setAttribute("title", "新增环境参数信息");
		Result.forward("/modules/demo/profile/edit_sys_profile_param.jsp");
	}
	
	public void editProfileParameter(String profileParameterId) {
		Result.setAttribute("title", "修改环境参数信息");
		Result.setAttribute("profile", profileService.getProfileParameter(profileParameterId));
		Result.forward("/modules/demo/profile/edit_sys_profile_param.jsp");
	}
	
	public void copyProfile(String profileId) {
		Result.setAttribute("title", "复制其他环境的参数到本环境");
		Result.setAttribute("destinationProfileId", profileId);
		Result.forward("/modules/demo/profile/select_sys_profile.jsp");
	}
}