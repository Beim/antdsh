import React, { Component } from 'react';
import { Layout, Breadcrumb, Button, message, Table } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import SchemaTree from '../component/SchemaTree';
import schemaService from '../service/SchemaService';
import adminSchemaService from '../service/AdminSchemaService';
import RESULT from '../../common/constant/Result';
import querystring from 'querystring';
import SCHEMA_CONST from "../constant/SchemaConstant";
import commonUtil from "../../common/utils/commonUtil";

const { Content } = Layout;

/**
 * props: {
 *   dataSource: [] // required
 *   handleSelectedRows: function(selectedRows) // required
 * }
 */
class MatchTable extends Component {

  retrieveRelativeUri = (uri) => {
    if (uri === null) return "null";
    const re = new RegExp(`.*(#.*)`);
    const result = uri.match(re);
    return result[1];
  };

  render() {
    const columns = [
      {
        title: 'User entityUri',
        dataIndex: 'entity1Uri',
        key: 'entity1Uri',
        render: (text, record) => this.retrieveRelativeUri(text),
      },
      {
        title: 'System entityUri',
        dataIndex: 'entity2Uri',
        key: 'entity2Uri',
        render: (text, record) => this.retrieveRelativeUri(text),
      },
      {
        title: 'Confidence',
        dataIndex: 'confidence',
        key: 'confidence',
      },
    ];
    const dataSource = this.props.dataSource;
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.props.handleSelectedRows(selectedRows);
      }
    };
    return (
      <Table
        rowSelection={rowSelection}
        dataSource={dataSource}
        columns={columns}
      >
      </Table>
    )
  }
}

class AdminSchemaVerifyPage extends Component {

  state = {
    sname: "",
    sid: "",
    owl: undefined,
    matchTableData: [],
    selectedRows: [],
  };

  componentWillMount() {
    const {sname, sid, gid} = commonUtil.getQuery();
    this.setState({
      sname,
      sid,
      gid,
    });
    this.setOwlState(sid, gid);
    this.setMatchTableData(sid);
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

  setMatchTableData = async (sid) => {
    const response = await adminSchemaService.getMatchTable(sid);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    const matchTableData = results.data;
    this.setState({ matchTableData });
  };


  getQuery = () => {
    let search = this.props.location.search;
    if (search === "") {
      message.info('Schema name unspecified');
      return;
    }
    search = search.split('?')[1];
    return querystring.parse(search);
  };

  handleOwlChange = (owl) => {
    this.setState({owl});
  };

  handleSelectedRows = (selectedRows) => {
    this.setState({ selectedRows });
  };

  handleMerge = async () => {
    const response = await adminSchemaService.confirmMerge(this.state.sid);
    if (!response.ok) {
      return message.info(response)
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.info(results);
    }
    message.success('succeed');
    setTimeout(() => {
      window.location = SCHEMA_CONST.HREF.ADMIN_LIST;
    }, 1000);
  };

  handleChangeMatchTable = async () => {
    const matchTableData = JSON.parse(JSON.stringify(this.state.matchTableData));
    const selectedRows = this.state.selectedRows;
    const selectedRowMapById = {};
    for (let row of selectedRows) {
      selectedRowMapById[row.id] = row;
    }
    for (let item of matchTableData) {
      if (!(item.id in selectedRowMapById)) {
        item.entity2Uri = null;
      }
    }
    const response = await adminSchemaService.updateMatchTable(matchTableData);
    if (!response.ok) {
      return message.info(JSON.stringify(response))
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.info(JSON.stringify(results));
    }
    message.success('Succeed');
    setTimeout(() => {
      this.setMatchTableData(this.state.sid);
    }, 1000)
  };

  render() {
    const dataSource = this.state.matchTableData.map((val, idx) => {
      return {
        key: `matchTableDataSource${idx}`,
        entity1Uri: val.entity1Uri,
        entity2Uri: val.entity2Uri,
        confidence: val.confidence,
        id: val.id,
        sid: val.sid,
        updated: val.updated,
      }
    });
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_MAIN}>Schema</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_LIST}>Management</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.ADMIN_VERIFY}>Audit</a></Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <span style={{fontSize: "18px"}}>{`Schema name:  ${this.state.sname}`}</span>
                  <Button onClick={this.handleMerge} style={{marginLeft: '10px'}}>Confirm merge</Button>
                  <Button onClick={this.handleChangeMatchTable} style={{marginLeft: '10px'}}>Save</Button>
                </div>
                <div className={commonStyles.card}>
                  <div className={commonStyles.cardTitle}>Match table</div>
                  <MatchTable  handleSelectedRows={this.handleSelectedRows} dataSource={dataSource}></MatchTable>
                </div>
                <div className={commonStyles.card}>
                  <div className={commonStyles.cardTitle}>User schema</div>
                  <SchemaTree schemaOwl={this.state.owl} editable={false} submitOwl={this.handleOwlChange} ></SchemaTree>
                </div>
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }
}

export default AdminSchemaVerifyPage;