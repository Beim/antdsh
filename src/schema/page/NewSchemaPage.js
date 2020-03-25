import React, { Component } from 'react';
import { Layout, Breadcrumb, Input, Button, message } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import SchemaTree from '../component/SchemaTree';
import schemaService from '../service/SchemaService';
import RESULT from '../../common/constant/Result';
import SCHEMA_CONST from "../constant/SchemaConstant";
import commonUtil from "../../common/utils/commonUtil";

const { Content } = Layout;

// const owlTemp = {
//   "@graph": [
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Action",
//       "@type": "owl:Class",
//       "label": "action",
//       "subClassOf": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Documentary",
//       "@type": "owl:Class",
//       "label": "documentary",
//       "subClassOf": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie",
//       "@type": "owl:Class",
//       "label": "movie"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#hasActor",
//       "@type": "owl:DatatypeProperty",
//       "domain": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie",
//       "label": "hasActor",
//       "range": "xsd:string"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#hasDirector",
//       "@type": "owl:DatatypeProperty",
//       "domain": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie",
//       "label": "hasDirector",
//       "range": "xsd:string"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#name",
//       "@type": "owl:DatatypeProperty",
//       "domain": [
//         "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Movie",
//         "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Documentary",
//         "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Action"
//       ],
//       "label": "name",
//       "range": "xsd:string"
//     },
//     {
//       "@id": "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#similar",
//       "@type": "owl:ObjectProperty",
//       "domain": [
//         "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Documentary",
//       ],
//       "label": "name",
//       "range": [
//         "http://ont.beim.site/a5108a13-b9db-4f2a-81d2-7610c1bfdf47#Action",
//       ]
//     },
//   ],
//   "@context": {
//     "label": {
//       "@id": "http://www.w3.org/2000/01/rdf-schema#label"
//     },
//     "subClassOf": {
//       "@id": "http://www.w3.org/2000/01/rdf-schema#subClassOf",
//       "@type": "@id"
//     },
//     "domain": {
//       "@id": "http://www.w3.org/2000/01/rdf-schema#domain",
//       "@type": "@id"
//     },
//     "range": {
//       "@id": "http://www.w3.org/2000/01/rdf-schema#range",
//       "@type": "@id"
//     },
//     "owl": "http://www.w3.org/2002/07/owl#",
//     "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
//     "xsd": "http://www.w3.org/2001/XMLSchema#",
//     "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
//   }
// };


class NewSchemaPage extends Component {

  state = {
    sname: "",
    owl: undefined,
    gid: "",
  };

  componentDidMount() {
    const {gid} = commonUtil.getQuery();
    this.setState({
      gid,
    });
  }


  render() {
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href={SCHEMA_CONST.HREF.MAIN + `?gid=${this.state.gid}`}>模板</a></Breadcrumb.Item>
            <Breadcrumb.Item>添加</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <span style={{fontSize: "18px"}}>模板名:&nbsp;</span>
                  <Input placeholder={"请输入模板名"}
                         name={"sname"}
                         value={this.state.sname}
                         style={{
                           width: '240px',
                         }}
                         onChange={this.handleInputChange} >
                  </Input>
                  <Button onClick={this.handleSave} style={{marginLeft: '10px'}}>保存</Button>
                </div>
                {/* json -> view, json -> JSON-LD */}
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

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleOwlChange = (owl) => {
    this.setState({owl});
  };

  handleSave = async () => {
    const { owl, sname, gid } = this.state;
    if (owl === undefined) {
      return message.info('请添加类');
    };
    if (sname === "") {
      return message.info("请输入模板名");
    }
    const response = await schemaService.newSchema(gid, owl, "JSON-LD", sname);
    if (!response.ok) {
      return message.error(JSON.stringify(response));
    }
    const results = await response.json();
    if (results.code !== RESULT.DEFAULT_SUCC_CODE) {
      return message.error(JSON.stringify(results));
    }
    message.success('已保存');
    setTimeout(() => {
      window.location = SCHEMA_CONST.HREF.LIST + window.location.search;
    }, 1000);
  };
}

export default NewSchemaPage;