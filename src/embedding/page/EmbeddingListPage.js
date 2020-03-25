import React, { Component } from 'react';
import {Layout, Breadcrumb, message, Table, Spin, Modal} from 'antd';

import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import commonUtil from "../../common/utils/commonUtil";
import embeddingService from "../service/EmbeddingService";
import { STATUS } from '../constant/EmbeddingConstant';
import appconfig from '../../appconfig';


const { Content } = Layout;
const defaultUrlPrefix = appconfig['defaultServer']['host'];


class EmbeddingListTable extends Component {

  state = {
    apiModalVisible: false,
    apiGid: null,
    apiModelname: null,

    serviceInfo: {},
    selectedTrainGid: null,
    selectedTrainModelName: null,
    serviceModalVisible: false,
  };

  render() {
    const columns = [
      {
        title: '图空间',
        dataIndex: 'gid',
      },
      {
        title: '模型',
        dataIndex: 'modelname',
      },
      {
        title: '状态',
        dataIndex: 'status',
      },
      {
        title: '更新时间',
        dataIndex: 'updated',
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: this.renderAction,
      }
    ];
    const { data } = this.props;
    return (
      <div>
        <Table columns={columns} dataSource={data} />
        {this.renderApiModal()}
        {this.renderServiceModal()}
      </div>

    )
  }

  renderAction = (text, record) => {
    const { gid, modelname, status } = record;
    if (status === STATUS.trained) {
      return (
        <span>
          <a onClick={this.showApiModal.bind(this, gid, modelname)}>查看接口</a>
          <span> | </span>
          {/*TODO 重新训练也需要选择服务节点 */}
          <a onClick={this.postTrainJob.bind(this, gid, modelname)}>重新训练</a>
          <span> | </span>
          <a onClick={this.exportParam.bind(this, gid, modelname)}>导出参数</a>
        </span>
      )
    } else if (status === STATUS.training) {
      return (
        <span>
          <Spin />
        </span>
      )
    } else if (status === STATUS.untrained) {
      return (
        <span>
          <a onClick={this.showServiceModal.bind(this, gid, modelname)}>选择服务</a>
        </span>
      )
    } else if (status === STATUS.queued) {
      // TODO 训练队列中，可取消训练
    }
  };

  exportParam = async (gid, modelname) => {
    const response = await embeddingService.getAvailableModelsParamByGid(gid, modelname);
    if (!response.succ) {
      message.error(JSON.stringify(response));
      return;
    }
    const data = response.data[0];
    let params = data['params'];
    let entity2id = data['entity2id'];
    let relation2id = data['relation2id'];
    let updated = new Date(data['updated']).getTime();
    commonUtil.download(params, `${gid}_${modelname}_${updated}_params.json`);
    commonUtil.download(entity2id, `${gid}_${modelname}_${updated}_entity2id.txt`);
    commonUtil.download(relation2id, `${gid}_${modelname}_${updated}_relation2id.txt`);
  };

  postTrainJob = async (gid, modelname, serviceId) => {
    const response = await embeddingService.postTrain(gid, modelname, serviceId);
    if (!response.succ) {
      message.error(JSON.stringify(response));
    }
    message.success('已提交训练任务');
    this.setState({
      'serviceModalVisible': false,
    });
    this.props.updateData();
  };

  setServiceInfo = async () => {
    let response = await embeddingService.getTrainServiceInfo();
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return;
    }
    let serviceInfo = response.data;
    this.setState({ serviceInfo })
  };

  showApiModal = (gid, modelname) => {
    this.setState({
      apiModalVisible: true,
      apiGid: gid,
      apiModelname: modelname,
    })
  };

  showServiceModal = (gid, modelname) => {
    this.setServiceInfo();
    this.setState({
      serviceModalVisible: true,
      selectedTrainGid: gid,
      selectedTrainModelName: modelname,
    })
  };

  handleApiModalCancle = () => {
    this.setState({
      apiModalVisible: false,
      apiGid: null,
      apiModelname: null,
    })
  };

  handleServiceModalCancle = () => {
    this.setState({
      serviceModalVisible: false,
      selectedTrainGid: null,
      selectedTrainModelName: null,
    })
  };

  renderApiModal = () => {
    const { apiGid, apiModelname } = this.state;
    return (
      <Modal
        title={"查看接口"}
        visible={this.state.apiModalVisible}
        onOk={this.handleApiModalCancle}
        onCancel={this.handleApiModalCancle}
      >
        <div>{`预测头实体 [GET] ${defaultUrlPrefix}/embed/predict/head?gid=&modelName=&tailId=&relType=&topk=`}</div>
        <br/>
        <div>{`预测尾实体 [GET] ${defaultUrlPrefix}/embed/predict/tail?gid=&modelName=&headId=&relType=&topk=`}</div>
        <br/>
        <div>{`预测关系 [GET] ${defaultUrlPrefix}/embed/predict/relation?gid=&modelName=&headId=&tailId=&topk=`}</div>
        <br/>
        <div>{`预测三元组 [GET] ${defaultUrlPrefix}/embed/predict/triple?gid=&modelName=&headId=&tailId=&relation=&thresh=`}</div>
        <br/>
        <div>{`获取实体嵌入 [GET] ${defaultUrlPrefix}/embed/entity/embedding?gid=&modelName=&entId=`}</div>
        <br/>
        <div>{`获取关系嵌入 [GET] ${defaultUrlPrefix}/embed/relation/embedding?gid=&modelName=&relType=`}</div>
      </Modal>
    )
  };

  renderServiceModal = () => {
    const { serviceInfo, selectedTrainGid, selectedTrainModelName } = this.state;
    const columns = [
      {
        title: 'id',
        dataIndex: 'serviceId',
        render: (text, record) => {
          return <span>{text.split('/')[3]}</span>
        }
      },
      {
        title: 'gpu',
        dataIndex: 'gpu',
        render: (text, record) => {
          return <span>{text == true ? '是' : '否'}</span>
        }
      },
      {
        title: '可用',
        dataIndex: 'available',
        render: (text, record) => {
          return <span>{text == true ? '是' : '否'}</span>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, record) => {
          return <a onClick={this.postTrainJob.bind(this, selectedTrainGid, selectedTrainModelName, record['serviceId'])}>训练</a>
        }
      }
    ];
    let data = [];
    for (let key in serviceInfo) {
      let val = serviceInfo[key]
      data.push({
        'serviceId': key,
        'available': val['available'],
        'gpu': val['gpu'],
      });
    }
    return (
      <Modal
        title={"选择服务"}
        visible={this.state.serviceModalVisible}
        onOk={this.handleServiceModalCancle}
        onCancel={this.handleServiceModalCancle}
      >
        <Table columns={columns} dataSource={data}/>
      </Modal>
    )
  };

}


class EmbeddingListPage extends Component {

  state = {
    gid: "",
    modelsInfo: [], // { gid: 0, modelname: '', status: STATUS.trained, updated: '' }
  };

  componentWillMount() {
    const {gid} = commonUtil.getQuery();
    this.setState({
      gid,
    });
    this.setModelsInfo(gid);
  }

  render() {
    const { gid, modelsInfo, serviceInfo } = this.state;

    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={`/`}>首页</a></Breadcrumb.Item>
            <Breadcrumb.Item>图嵌入</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <span style={{fontSize: "18px"}}>{`图嵌入`}</span>
                </div>
                <div className={commonStyles.card}>
                  <EmbeddingListTable data={modelsInfo} updateData={this.setModelsInfo.bind(this, gid)} />
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    )
  }

  setModelsInfo = async (gid) => {
    let response = await embeddingService.getAvailabelMethods();
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return;
    }
    let methods = response.data;
    response = await embeddingService.getAvailableModelsByGid(gid);
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return;
    }
    const availableModels = response.data;

    let availableMethods = new Set();
    let modelsInfo = [];
    availableModels.forEach((val) => {
      modelsInfo.push({
        gid,
        modelname: val['modelname'],
        status: val['available'] ? STATUS.trained : STATUS.training,
        updated: new Date(val['updated']).toLocaleString(),
      });
      availableMethods.add(val['modelname'])
    });
    methods.forEach((val) => {
      if (!availableMethods.has(val)) {
        modelsInfo.push({
          gid,
          modelname: val,
          status: STATUS.untrained,
          updated: "",
        })
      }
    });
    this.setState({ modelsInfo })
  }
}

export default EmbeddingListPage;