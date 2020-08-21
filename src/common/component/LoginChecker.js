import React, { Component } from 'react';
import { message} from 'antd';

import userService from '../../user/service/userService';
import RESULT from "../constant/Result";
import CODES from '../constant/Codes';

class LoginChecker extends Component {

  componentWillMount = async () => {
    const isLoggedIn = await this.isLoggedIn();
    if (!isLoggedIn) window.location = '/user/login';
  };

  render() {
    return (
      <div></div>
    )
  }

  isLoggedIn = async () => {
    const response = await userService.getUserInfo();
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      if (results.code === CODES.UNAUTHEN) {
        message.info('Needs login');
      }
      else {
        message.error(JSON.stringify(results));
      }
      return false
    }
    return true
  };

}

export default LoginChecker