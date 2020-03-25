import React, { Component } from 'react';
import {Layout, Breadcrumb, message, Input, Button, Table, Form, Checkbox } from 'antd';
import { withRouter } from 'react-router-dom';

import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import pattGenService from '../service/PattGenService';
import RESULT from "../../common/constant/Result";
import STATE from '../constant/StateConstant';
import { EditableFormRow, EditableCell } from '../component/Editable';

const { Content } = Layout;
const { TextArea } = Input;

class ViewConfigCreateCard extends Component {

  state = {
    configText: "",
  };

  render() {
    return (
      <div>
        <TextArea
          value={this.state.configText}
          onChange={this.handleConfigTextChange}
          autosize={{ minRows: 25, maxRows: 25 }}
        />
        <div style={{marginTop: '20px', float: 'right'}}>
          <Button onClick={this.createPruningConfig.bind(this, 1 | 2 | 4)} size={'large'}>Next(7)</Button>
          <Button onClick={this.createPruningConfig.bind(this, 1)} size={'large'}>Next(1)</Button>
          <Button onClick={this.createConfig} size={'large'}>Next</Button>
        </div>

      </div>
    )
  }

  handleConfigTextChange = (e) => {
    const { value } = e.target;
    this.setState({configText: value});
  };

  createPruningConfig = async (pruningLevel) => {
    const configText = this.state.configText;
    let config = null;
    try {
      config = JSON.parse(configText);
    }
    catch (e) {
      return message.error("输入格式错误");
    }
    const response = await pattGenService.createPruning(config, pruningLevel);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    this.props.getViewState()
  };

  createConfig = async () => {
    const configText = this.state.configText;
    let config = null;
    try {
      config = JSON.parse(configText);
    }
    catch (e) {
      return message.error("输入格式错误");
    }
    const response = await pattGenService.create(config);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    this.props.getViewState()
  };

}

class ViewConfigInitCard extends Component {

  componentDidMount() {
    this.combine();
  }

  render() {
    return (
      <div>
        init
      </div>
    )
  }

  combine = async () => {
    const response = await pattGenService.combine();
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    this.props.getViewState()
  };
}

class ViewConfigFullCard extends Component {

  state = {
    pattList: [],
    dataSource: [],
  };

  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '关系合成模板',
        dataIndex: 'combine',
        render: (text, record) => {
          return text;
        }
      },
      {
        title: '新关系类型',
        dataIndex: 'type',
        editable: true,
        render: (text, record) => {
          if (text === null) {
            return <Input></Input>;
          }
          else {
            return <Input defaultValue={text}></Input>
          }
        }
      },
      {
        title: '对称性',
        dataIndex: 'symmetrical',
        render: (text, record) => {
          return <Checkbox checked={text} onChange={this.handleCheck.bind(this, record, 'symmetrical')}></Checkbox>
        }
      },
      {
        title: '传递性',
        dataIndex: 'transitive',
        render: (text, record) => {
          return <Checkbox checked={text} onChange={this.handleCheck.bind(this, record, 'transitive')}></Checkbox>
        }
      }
    ]
  }

  componentDidMount() {
    const pattList = this.props.viewState.newRelCombinePatternSet;
    const dataSource = this.parsePattToDataSource(pattList);
    this.setState({pattList, dataSource})
  }

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        <Form>
          <Table
            components={components}
            columns={columns}
            bordered
            dataSource={dataSource}
          ></Table>
        </Form>

        <div style={{marginTop: '20px', float: 'right'}}>
          <Button onClick={this.handleNext} size={'large'}>Next</Button>
        </div>
      </div>
    )
  }

  handleCheck = (record, field, e) => {
    record[field] = e.target.checked;
    this.handleSave(record);
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  parsePattToDataSource = (pattList) => {
    const dataSource = []
    for (let idx in pattList) {
      const patt = pattList[idx];
      const label0 = patt.startSourceRel.startNodeLabel.label;
      const label1 = patt.startSourceRel.endNodeLabel.label;
      const label2 = patt.endSourceRel.startNodeLabel.label;
      const label3 = patt.endSourceRel.endNodeLabel.label;

      const rel0 = patt.startSourceRel.relationType;
      const rel1 = patt.endSourceRel.relationType;
      let combine;
      if (patt.startInverse && patt.endInverse) {
        combine = `(${label1})<-[${rel0}]-(${label0})<-[${rel1}]-(${label2})`;
      }
      else if (patt.startInverse && !patt.endInverse) {
        combine = `(${label1})<-[${rel0}]-(${label0})-[${rel1}]->(${label3})`;
      }
      else if (!patt.startInverse && patt.endInverse) {
        combine = `(${label0})-[${rel0}]->(${label1})<-[${rel1}]-(${label2})`;
      }
      else if (!patt.startInverse && !patt.endInverse) {
        combine = `(${label0})-[${rel0}]->(${label1})-[${rel1}]->(${label3})`;
      }
      dataSource.push({
        key: idx,
        combine,
        type: null,
        symmetrical: false,
        transitive: false,
      })
    }
    return dataSource;
  };

  handleNext = async () => {
    const { dataSource } = this.state;
    const data = [];
    for (let item of dataSource) {
      if (item.type !== null) {
        data.push({
          index: item.key,
          type: item.type,
          symmetrical: item.symmetrical,
          transitive: item.transitive,
        })
      }
    }
    const response = await pattGenService.filterAndLabel(data);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    this.props.getViewState();
  };
}

class ViewConfigFinishCard extends Component {

  state = {
    configText: "",
  };

  componentDidMount() {
    message.success('关系模板生成成功');
    this.getConfigText();
  }

  render() {
    return (
      <div>
        <TextArea
          value={this.state.configText}
          autosize={{ minRows: 25, maxRows: 25 }}
        />
        <div style={{marginTop: '20px', float: 'right'}}>
          <Button onClick={this.props.cleanViewState} size={'large'}>New</Button>
        </div>
      </div>
    )
  }

  getConfigText = async () => {
    const response = await pattGenService.getCurrPattConfig();
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    const configText = JSON.stringify(results.data, null, 4);
    this.setState({ configText });
  }
}

class ViewConfigPage extends Component {

  state = {
    viewState: null,
  };

  componentDidMount() {
    this.getViewState();
  }

  render() {
    let contentCard = null;
    let title = null;
    const viewState = this.state.viewState;
    if (viewState === null) {
      contentCard = <ViewConfigCreateCard getViewState={this.getViewState}></ViewConfigCreateCard>;
      title = 'Step0';
    }
    else if (viewState.state.currState === STATE.INIT) {
      contentCard = <ViewConfigInitCard getViewState={this.getViewState}></ViewConfigInitCard>
      title = 'Step1';
    }
    else if (viewState.state.currState === STATE.FULL) {
      contentCard = <ViewConfigFullCard viewState={this.state.viewState} getViewState={this.getViewState}></ViewConfigFullCard>
      title = 'Step2';
    }
    // else if (viewState.state.currState === STATE.UNIQUE) {
    //   contentCard = <ViewConfigUniqueCard getViewState={this.getViewState}></ViewConfigUniqueCard>
    // }
    else if (viewState.state.currState === STATE.FINISH) {
      contentCard = <ViewConfigFinishCard getViewState={this.getViewState} cleanViewState={this.cleanViewState}></ViewConfigFinishCard>
      title = 'Finish';
    }
    else {
      message.error(`viewState not defined: ${viewState.state.currState}`);
    }
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>模板</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <div className={commonStyles.cardTitle}>{title}</div>
                  <div style={{marginBottom: '10px'}}>Step0->Step1->Step2->Finish</div>
                  {contentCard}
                </div>
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }

  getViewState = async () => {
    const response = await pattGenService.getState();
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    if (results.data !== null) {
      this.setState({ viewState: results.data })
    }
  };

  cleanViewState = async () => {
    await pattGenService.clean();
    this.setState({viewState: null});
  }
}

export default withRouter(ViewConfigPage);