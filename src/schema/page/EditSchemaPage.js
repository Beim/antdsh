import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, message } from 'antd';

import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import SchemaTree from '../component/SchemaTree';
import schemaService from '../service/SchemaService';
import RESULT from '../../common/constant/Result';
import SCHEMA_CONST from "../constant/SchemaConstant";
import commonUtil from "../../common/utils/commonUtil";

const { Content } = Layout;

class EditSchemaPage extends Component {

  state = {
    sname: "",
    sid: "",
    gid: "",
    owl: undefined,
  };

  componentWillMount() {
    const {sname, sid, gid} = commonUtil.getQuery();
    this.setState({
      sname,
      sid,
      gid,
    });
    this.setOwlState(sid, gid);
  }

  setOwlState = async (sid, gid) => {
    const response = await schemaService.getSchemaInOwl(sid, gid);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    const owl = JSON.parse(results.data);
    this.setState({ owl });
  };

  handleOwlChange = (owl) => {
    this.setState({owl});
  };

  handleSave = async () => {
    const {owl, sname, gid} = this.state;
    console.log('owl: ', owl);
    if (owl === undefined) {
      return message.info('请添加类');
    };
    const response = await schemaService.editSchema(gid, owl, "JSON-LD", sname);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    message.success('已保存');
    // 跳转list 页面
    // setTimeout(() => {
    //   window.location = SCHEMA_CONST.HREF.LIST + window.location.search;
    // }, 1000);
  };

  render() {
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.MAIN + `?gid=${this.state.gid}`}>模板</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.LIST + `?gid=${this.state.gid}`}>列表</a></Breadcrumb.Item>
            <Breadcrumb.Item>编辑</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <span style={{fontSize: "18px"}}>{`模板名:  ${this.state.sname}`}</span>
                  <Button onClick={this.handleSave} style={{marginLeft: '10px'}}>保存</Button>
                </div>
                <div className={commonStyles.card}>
                  <SchemaTree schemaOwl={this.state.owl} editable={true} submitOwl={this.handleOwlChange} ></SchemaTree>
                </div>
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }
}

export default EditSchemaPage;