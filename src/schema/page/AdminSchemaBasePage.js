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
        title: 'Schema name',
        dataIndex: 'sname',
        key: 'sname',
        sorter: (a, b) => {
          if (a.sname > b.sname) return 1;
          else if (a.sname < b.sname) return -1;
          else return 0;
        }
      },
      {
        title: 'Updated',
        dataIndex: 'updated',
        key: 'updated',
        sorter: (a, b) => b.updated - a.updated,
        render: (text, record) => text.toLocaleDateString(),
      },
      {
        title: 'Action',
        dataIndex: 'sid',
        key: 'action',
        render: (text, record) => {
          const { sid, owl } = record;
          console.log(record);
          console.log(owl);
          return (
            <span>
              <a onClick={this.viewSchemaBase.bind(this, owl)}>View</a>
              <span> | </span>
              <a onClick={this.deleteSchemaBase.bind(this, sid)}>Delete</a>
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
      title: 'View schema',
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
      title: 'Delete schema',
      content: 'Delete schema?',
      onOk: async () => {
        const result = await adminSchemaService.deleteSchemaBase(sid);
        if (result.succ) {
          message.success("Succeed");
          this.props.updateData();
        }
        else {
          message.error(`Failed: ${JSON.stringify(result)}`);
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
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_MAIN}>Schema manage</a></Breadcrumb.Item>
            <Breadcrumb.Item>Schema base</Breadcrumb.Item>
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