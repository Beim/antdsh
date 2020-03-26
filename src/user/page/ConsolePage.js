import React, { Component } from 'react';
import {Layout, Breadcrumb, message, Modal, Input, Table, Button } from 'antd';
import commonStyles from '../../common/css/common.module.scss'
import MenuHeader from '../../common/component/MenuHeader';
import commonUtil from "../../common/utils/commonUtil";
import mainPageService from "../../common/service/mainPageService";
import consolePageService from "../service/consolePageService";

const { Content } = Layout;


class DataUsageTable extends Component {

  render() {
    const { data } = this.props;
    const columns = [
      {
        title: '图空间名',
        dataIndex: 'name',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: 'ID',
        dataIndex: 'id',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: '节点数量',
        dataIndex: 'nodeCount',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (text, record) => {
          return (
            <a>删除图空间</a>
          )
        }
      }
    ];
    return (
      <div>
        <Table columns={columns} dataSource={data}/>
      </div>
    )
  }

}


class CalcUsageTable extends Component {
  render() {
    const { data } = this.props;
    const dataList = [];
    for (let serviceName in data) {
      dataList.push({
        serviceName,
        count: data[serviceName]['count'],
        duration: data[serviceName]['duration']
      });
    }
    const columns = [
      {
        title: '服务名',
        dataIndex: 'serviceName',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: '调用次数',
        dataIndex: 'count',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: '调用时间(s)',
        dataIndex: 'duration',
        render: (text, record) => {
          return text;
        }
      }
    ];


    return (
      <div>
        <Table columns={columns} dataSource={dataList}/>
      </div>
    )
  }
}


class UserConsolePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gid: null,
      gspaceInfoList: [],  // [ {id, name, ... } ]
      gspaceInfoMap: {}, // list to map, append nodeCount  { gid: gspaceInfo }
      serviceMonitorInfo: {},  // { serviceName: {count, duration} }
    }
  }
  async componentDidMount() {
    const {gid} = commonUtil.getQuery();
    this.setState({
      gid,
    });
    this.fetchDataAndSetState();
  }

  render() {
    const { gid, gspaceInfoList, gspaceInfoMap, serviceMonitorInfo } = this.state;

    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey={'console'}></MenuHeader>

        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={"/main/home"}>首页</a></Breadcrumb.Item>
            <Breadcrumb.Item>控制台</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>

                <div className={commonStyles.card}>
                  <div>
                    <div className={commonStyles.cardTitle}>图空间列表</div>
                    <DataUsageTable data={gspaceInfoList}></DataUsageTable>
                  </div>
                </div>

                <div className={commonStyles.card}>
                  <div>
                    <div className={commonStyles.cardTitle}>服务统计</div>
                    <div>
                      <CalcUsageTable data={serviceMonitorInfo}></CalcUsageTable>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }

  async fetchDataAndSetState() {
    let response = await mainPageService.getGspaceInfo();
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return;
    }
    const gspaceInfoList = response.data;

    const gspaceInfoMap = {};
    for (let idx in gspaceInfoList) {
      let gspaceInfo = gspaceInfoList[idx];
      gspaceInfoMap[gspaceInfo['id']] = gspaceInfo;
    }


    for (let idx in gspaceInfoList) {
      let gspaceInfo = gspaceInfoList[idx];
      let gid = gspaceInfo['id'];
      response = await consolePageService.getNodeCount(gid);
      if (response === null || !response.succ) {
        gspaceInfoMap[gid]['nodeCount'] = 0;
      }
      else {
        gspaceInfoMap[gid]['nodeCount'] = response.data;
      }
    }

    response = await consolePageService.getServiceMonitorLogs();
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return;
    }
    const serviceMonitorInfo = {};
    let resData = response.data;
    for (let idx in resData) {
      let item = resData[idx];
      if (!(item['service'] in serviceMonitorInfo)) {
        serviceMonitorInfo[item['service']] = {
          count: 0,
          duration: 0.0
        }
      }
      serviceMonitorInfo[item['service']]['count'] += 1;
      serviceMonitorInfo[item['service']]['duration'] += parseFloat(item['duration']);
    }

    this.setState({gspaceInfoList, gspaceInfoMap, serviceMonitorInfo});
  }


}

export default UserConsolePage;