import React, { Component } from 'react';
import { Layout, Breadcrumb, Table, message } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import schemaService from '../service/SchemaService';
import RESULT from "../../common/constant/Result";
import adminSchemaService from '../service/AdminSchemaService';
import SCHEMA_CONST from '../constant/SchemaConstant';

const { Content } = Layout;

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
        title: 'User id',
        dataIndex: 'uid',
        key: 'uid',
      },
      {
        title: 'Updated',
        dataIndex: 'updated',
        key: 'updated',
        sorter: (a, b) => b.updated - a.updated,
        render: (text, record) => text.toLocaleDateString(),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          if (['0'].includes(record.status)) {
            return 'To be matched'
          }
          else if (['2'].includes(record.status)) {
            return 'To be audited'
          }
          else if (['1', '3'].includes(record.status)) {
            return 'Matching'
          }
          else if (['4'].includes(record.status)) {
            return 'Merged'
          }
          else if (['5'].includes(record.status)) {
            return 'To be confirmed'
          }
          else {
            return 'Unknown'
          }
        },
        filters: [
          {
            text: 'To be matched',
            value: '待匹配',
          },
          {
            text: 'To be audited',
            value: '待审核',
          },
          {
            text: 'Matching',
            value: '匹配中',
          },
          {
            text: 'Merged',
            value: '已融合',
          },
          {
            text: 'To be confirmed',
            value: '待确认',
          },
          {
            text: 'Unknown',
            value: '未知状态',
          },
        ],
        onFilter: (value, record) => {
          if (value === '待匹配') {
            return ['0'].includes(record.status);
          }
          else if (value === '待审核') {
            return ['2'].includes(record.status);
          }
          else if (value === '匹配中') {
            return ['1', '3'].includes(record.status);
          }
          else if (value === '已融合') {
            return ['4'].includes(record.status);
          }
          else if (value === '待确认') {
            return ['5'].includes(record.status);
          }
          else if (value === '未知状态') {
            return !['0', '1', '2', '3', '4', '5'].includes(record.status);
          }
        },
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: this.renderAction,
      },
    ];
    const data = this.props.data;
    return (
      <Table columns={columns} dataSource={data} onChange={this.onChange} />
    )

  }

  onChange = (pagination, filters, sorter) => {

  };

  confirmMatch = async (sid) => {
    const response = await schemaService.confirmMatch(sid);
    if (!response.ok) {
      message.error(JSON.stringify(response))
      return;
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      message.error(JSON.stringify(results));
      return;
    }
    setTimeout(() => {
      this.props.updateData();
    }, 3000);
  };

  renderAction = (text, record) => {
    const { sname, sid, gid, status, owl } = record;
    if (['0', '1', '3', '4'].includes(status)) {
      return (
        <span>
          <a href={`/schema/view?sname=${sname}&sid=${sid}&gid=${gid}`}>View</a>
          {this.renderSaveSchemaBaseALabel(sid, owl)}
        </span>
      )
    }
    else if (['2'].includes(status)) {
      return (
        <span>
          <a href={`/schema/admin/verify?sname=${sname}&sid=${sid}&gid=${gid}`}>Audit</a>
          {this.renderSaveSchemaBaseALabel(sid, owl)}
        </span>
      )
    }
    else if (['5'].includes(status)) {
      return (
        <span>
          <a href={`/schema/view?sname=${sname}&sid=${sid}&gid=${gid}`}>View</a>
          {this.renderSaveSchemaBaseALabel(sid, owl)}
        </span>
      )
    }
    else {
      message.error(`status = ${status}`);
    }
  };

  renderSaveSchemaBaseALabel = (sid, owl) => {
    if (!owl) return;
    return (
      <span>
        <span> | </span>
        <a onClick={this.addSchemaBase.bind(this, sid)}>Save</a>
      </span>
    )
  };

  addSchemaBase = async (sid) => {
    const response = await adminSchemaService.postSchemaBase(sid);
    if (response.succ) {
      message.success("Succeed");
    }
    else {
      message.error(`Failed: ${JSON.stringify(response)}`);
    }
  }

}

class AdminSchemaListPage extends Component {

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
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_LIST}>List</a></Breadcrumb.Item>
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
    const response = await adminSchemaService.getSchemaInfo();
    if (!response.ok) {
      message.error(JSON.stringify(response));
      return;
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      message.error(JSON.stringify(results));
      return;
    }
    const schemaInfoData = results.data.map((val, idx) => {
      return {
        key: `schemaInfoTableDataKey${idx}`,
        uid: val.uid,
        gid: val.gid,
        sid: val.sid,
        owl: val.owl,
        sname: val.sname,
        status: val.status + '',
        updated: new Date(val.updated),
        action: val.status,
      }
    });
    this.setState({ schemaInfoData });
  };
}

export default AdminSchemaListPage;