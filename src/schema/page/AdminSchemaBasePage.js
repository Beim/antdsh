import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, message, Modal } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import schemaService from '../service/SchemaService';
import RESULT from "../../common/constant/Result";
import adminSchemaService from '../service/AdminSchemaService';
import SCHEMA_CONST from '../constant/SchemaConstant';
import SchemaTree from "../component/SchemaTree";

const { Content } = Layout;
const { confirm } = Modal;

class SchemaInfoTabel extends Component {

  render() {
    const columns = [
      {
        title: '模板名',
        dataIndex: 'sname',
        key: 'sname',
        sorter: (a, b) => {
          if (a.sname > b.sname) return 1;
          else if (a.sname < b.sname) return -1;
          else return 0;
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updated',
        key: 'updated',
        sorter: (a, b) => b.updated - a.updated,
        render: (text, record) => text.toLocaleDateString(),
      },
      {
        title: '操作',
        dataIndex: 'sid',
        key: 'action',
        render: (text, record) => {
          const { sid, owl } = record;
          console.log(record);
          console.log(owl);
          return (
            <span>
              <a onClick={this.viewSchemaBase.bind(this, owl)}>查看</a>
              <span> | </span>
              <a onClick={this.deleteSchemaBase.bind(this, sid)}>删除</a>
            </span>
          )
        },
      },
    ];
    const data = this.props.data;
    return (
      <Table columns={columns} dataSource={data} onChange={this.onChange} />
    )
  }

  viewSchemaBase = async (owl) => {
    return confirm({
      title: '查看模板',
      content: <SchemaTree
        schemaOwl={owl}
        editable={false}
        expandAll={true}
      ></SchemaTree>,
      onOk() {},
      onCancel() {},
    })
  };

  onChange = (pagination, filters, sorter) => {

  };

  deleteSchemaBase = (sid) => {
    return confirm({
      title: '删除模板',
      content: '是否确认删除模板',
      onOk: async () => {
        const result = await adminSchemaService.deleteSchemaBase(sid);
        if (result.succ) {
          message.success("删除成功");
          this.props.updateData();
        }
        else {
          message.error(`删除失败: ${JSON.stringify(result)}`);
        }
      },
      onCancel() {},
    })
  };


}

class AdminSchemaBasePage extends Component {

  state = {
    schemaInfoData: [],
  };

  componentWillMount = () => {
    this.setSchemaInfoData();
  };


  render() {

    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_MAIN}>模板管理</a></Breadcrumb.Item>
            <Breadcrumb.Item>模板库</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <SchemaInfoTabel data={this.state.schemaInfoData} updateData={this.setSchemaInfoData}/>
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }

  setSchemaInfoData = async () => {
    const results = await schemaService.getSchemaBases();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      message.error(JSON.stringify(results));
      return;
    }
    const schemaInfoData = results.data.map((val, idx) => {
      return {
        key: `schemaInfoTableDataKey${idx}`,
        sid: val.sid,
        sname: val.sname,
        owl: JSON.parse(val.owl),
        updated: new Date(val.updated),
      }
    });
    this.setState({ schemaInfoData });
  };
}

export default AdminSchemaBasePage;