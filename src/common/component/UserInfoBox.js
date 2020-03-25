import React, { Component } from 'react';
import { Layout, Breadcrumb, message, Table, Spin, Modal } from 'antd';

import userService from "../../user/service/userService";
import RESULT from "../constant/Result";
import CODES from "../constant/Codes";
import APP_CONFIG from '../../appconfig';


class UserInfoBox extends Component {

  state = {
    username: "",
    perms: [],
    roles: [],
    isLoggedIn: false,
  };

  componentWillMount = async () => {
    const isLoggedIn = await this.isLoggedIn();
    this.setState({ isLoggedIn })
  };

  render() {
    const { isLoggedIn, username } = this.state;

    if (!isLoggedIn) {
      return (
        <div style={{color: 'white'}}>
          <a href={`/user/login`}>登录</a>
          /
          <a href={'/user/register'}>注册</a>
        </div>
      )
    }
    else {
      return (
        <div style={{color: 'white'}}>
          您以 <a onClick={this.handleUserInfo}>{username}</a> 登录
          (<a onClick={this.logout}>退出</a>)
        </div>
      )
    }
  }

  handleUserInfo = () => {
    const adminRole = 'admin';
    const roles = this.state.roles;
    if (roles.includes(adminRole)) {
      // 跳转管理员界面
      window.location = '/schema/admin';
    }
    else {
      // TODO 跳转用户界面
    }
  };

  logout = async () => {
    userService.logout()
    window.location = '/main/home';
  };

  /**
   * 判断是否登录
   * 若已登录设置state {username, roles, perms}
   * @returns {Promise<boolean>}
   */
  isLoggedIn = async () => {
    const response = await userService.getUserInfo();
    if (!response.ok) {
      message.error(JSON.stringify(response));
      return false;
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      if (results.code === CODES.UNAUTHEN) {
        console.info('用户未登录');
        window.location.href = '/user/login';
      }
      else {
        message.error(JSON.stringify(results));
      }
      return false;
    }
    this.setState({
      username: results.username,
      roles: results.roles,
      perms: results.perms,
    });
    return true;
  };
}

export default UserInfoBox