import React, { Component } from 'react';
import { Layout, Menu, Row, Col } from 'antd';

import UserInfoBox from './UserInfoBox';
import APP_CONFIG from '../../appconfig';

const { Header } = Layout;

/**
 * props: {
 *   defaultSelectedKey: String // required 1, 2  默认选择的菜单
 * }
 */
class MenuHeader extends Component {

  render() {
    // const defaultSelectedKey = this.props.defaultSelectedKey || '1';
    const defaultSelectedKey = '1';
    return (
      <Header>
        <Row>
          <Col span={20}>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={[defaultSelectedKey]}
              style={{ lineHeight: '64px' }}
              onClick={this.handleClickMenu}
            >
              <Menu.Item key="1">Sh V1.1</Menu.Item>
              <Menu.Item key="2">API</Menu.Item>
            </Menu>
          </Col>
          <Col span={4}>
            <UserInfoBox></UserInfoBox>
          </Col>
        </Row>


      </Header>
    )
  }

  handleClickMenu = (e) => {
    const key = e.key;
    if (key === '1') {
      window.location = '/main/home';
    }
    else if (key === '2') {
      window.location = 'https://github.com/Beim/Beim.github.io/issues/10';
    }
  };
}

export default MenuHeader