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
        title: '用户ID',
        dataIndex: 'uid',
        key: 'uid',
      },
      {
        title: '更新时间',
        dataIndex: 'updated',
        key: 'updated',
        sorter: (a, b) => b.updated - a.updated,
        render: (text, record) => text.toLocaleDateString(),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          if (['0'].includes(record.status)) {
            return '待匹配'
          }
          else if (['2'].includes(record.status)) {
            return '待审核'
          }
          else if (['1', '3'].includes(record.status)) {
            return '匹配中'
          }
          else if (['4'].includes(record.status)) {
            return '已融合'
          }
          else if (['5'].includes(record.status)) {
            return '待确认'
          }
          else {
            return '未知状态'
          }
        },
        filters: [
          {
            text: '待匹配',
            value: '待匹配',
          },
          {
            text: '待审核',
            value: '待审核',
          },
          {
            text: '匹配中',
            value: '匹配中',
          },
          {
            text: '已融合',
            value: '已融合',
          },
          {
            text: '待确认',
            value: '待确认',
          },
          {
            text: '未知状态',
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
        title: '操作',
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
          <a href={`/schema/view?sname=${sname}&sid=${sid}&gid=${gid}`}>查看</a>
          {this.renderSaveSchemaBaseALabel(sid, owl)}
        </span>
      )
    }
    else if (['2'].includes(status)) {
      return (
        <span>
          <a href={`/schema/admin/verify?sname=${sname}&sid=${sid}&gid=${gid}`}>审核</a>
          {this.renderSaveSchemaBaseALabel(sid, owl)}
        </span>
      )
    }
    else if (['5'].includes(status)) {
      return (
        <span>
          <a href={`/schema/view?sname=${sname}&sid=${sid}&gid=${gid}`}>查看</a>
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
        <a onClick={this.addSchemaBase.bind(this, sid)}>保存至模板库</a>
      </span>
    )
  };

  addSchemaBase = async (sid) => {
    const response = await adminSchemaService.postSchemaBase(sid);
    if (response.succ) {
      message.success("保存成功");
    }
    else {
      message.error(`保存失败: ${JSON.stringify(response)}`);
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
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_MAIN}>模板管理</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_LIST}>列表</a></Breadcrumb.Item>
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