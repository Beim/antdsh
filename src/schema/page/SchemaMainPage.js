import React, { Component } from 'react';
import { Layout, Breadcrumb } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import SCHEMA_CONST from '../constant/SchemaConstant';
import CommonProductCard from '../../common/component/ProductCard';
import { withRouter } from 'react-router-dom';
import commonUtil from "../../common/utils/commonUtil";
import querystring from "querystring";

const { Content } = Layout;

class SchemaMainPage extends Component {

  render() {
    let search = window.location.search;
    const listSchemaCardData = {
      href: SCHEMA_CONST.HREF.LIST + search,
      imgSrc: "/images/menu.png",
      title: "Schema list",
      desc: "View schema list",
    };
    const newSchemaCardData = {
      href: SCHEMA_CONST.HREF.NEW + search,
      imgSrc: "/images/plus.png",
      title: "New schema",
      desc: "Create new schema",
    };
    const schemaBaseCardData = {
      href: SCHEMA_CONST.HREF.BASE + search,
      imgSrc: '/images/menu.png',
      title: 'Schema base',
      desc: 'View schema base',
    };
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Schema</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <div className={commonStyles.cardTitle}>Schema</div>
                  <div>
                    <CommonProductCard data={listSchemaCardData} />
                    <CommonProductCard data={newSchemaCardData} />
                    <CommonProductCard data={schemaBaseCardData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }
}

export default withRouter(SchemaMainPage);