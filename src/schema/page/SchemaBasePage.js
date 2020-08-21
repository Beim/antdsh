import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, message, Modal } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import schemaService from '../service/SchemaService';
import RESULT from "../../common/constant/Result";
import SCHEMA_CONST from '../constant/SchemaConstant';
import SchemaTree from "../component/SchemaTree";
import commonUtil from "../../common/utils/commonUtil";

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
          const { sid, sname, owl } = record;
          console.log(record);
          console.log(owl);
          return (
            <span>
              <a onClick={this.viewSchemaBase.bind(this, owl)}>View</a>
              <span> | </span>
              <a onClick={this.copySchemaBase.bind(this, sname, owl)}>Copy</a>
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

  copySchemaBase = (sname, owl) => {
    let {gid} = commonUtil.getQuery();
    return confirm({
      title: 'Copy schema',
      content: 'Do copy schema as your own schema?',
      onOk: async () => {
        const response = await schemaService.newSchema(gid, owl, "JSON-LD", sname);
        if (!response.ok) {
          return message.error(JSON.stringify(response));
        }
        const result = await response.json();
        if (result.succ) {
          message.success("succeed!");
          let { sid, sname } = result.data;
          window.location = SCHEMA_CONST.HREF.EDIT + `?sname=${sname}&sid=${sid}&gid=${gid}`;
        }
        else {
          message.error(`failed: ${JSON.stringify(result)}`);
        }
      },
      onCancel() {},
    })
  };

}

class SchemaBasePage extends Component {

  state = {
    gid: "",
    schemaInfoData: [],
  };

  componentWillMount = () => {
    const {gid} = commonUtil.getQuery();
    this.setState({
      gid,
    });
    this.setSchemaInfoData();
  };


  render() {

    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.MAIN + `?gid=${this.state.gid}`}>Schema</a></Breadcrumb.Item>
            <Breadcrumb.Item>Base</Breadcrumb.Item>
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

export default SchemaBasePage;