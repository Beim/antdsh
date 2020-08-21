import React, { Component } from 'react';
import {Layout, Row, Col, message, Breadcrumb} from 'antd';

import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from "../../common/css/common.module.scss";
import AppSearch from '../component/AppSearch';
import AppIncDecTable from "../component/AppIncDecTable";
import mainDetailStyles from "../../common/css/mainDetail.module.scss";
import AppRecommendCard from '../component/AppRecommendCard';
import userService from "../../user/service/userService";
import RESULTS from "../../common/constant/Result";
import TractFileCard from '../component/TrackFileCard';

const { Content } = Layout;


class SearchPage extends Component {

  state = {
    username: null,
  };

  componentWillMount = async () => {
    const username = await this.getUsername();
    this.setState({ username });
  };

  render() {
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="1" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={"/main/home"}>Main</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href={"/app/search"}>外部服务变化感知器</a></Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ background: '#f0f2f5', padding: 24, height: '100%' }}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <Row gutter={16}>
                  <Col md={24} xl={16}>
                    <div className={commonStyles.card + ' ' + mainDetailStyles.card}>
                      <AppSearch></AppSearch>
                    </div>
                    <div className={commonStyles.card + ' ' + mainDetailStyles.card}>
                      <AppIncDecTable></AppIncDecTable>
                    </div>
                  </Col>
                  <Col md={24} xl={8}>
                    <AppRecommendCard username={this.state.username}></AppRecommendCard>
                    <TractFileCard username={this.state.username} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    )
  }

  getUsername = async () => {
    const response = await userService.getUserInfo();
    if (!response.ok) {
      message.error(JSON.stringify(response));
      return null;
    }
    const results = await response.json();
    if (results.code !== RESULTS.DEFAULT_SUCC_CODE) {
      message.info(JSON.stringify(results));
      return null;
    }
    return results.username;
  };
}

export default SearchPage