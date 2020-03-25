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
      title: "列表",
      desc: "查看模板列表",
    };
    const newSchemaCardData = {
      href: SCHEMA_CONST.HREF.NEW + search,
      imgSrc: "/images/plus.png",
      title: "新建",
      desc: "新建模板",
    };
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
                  <div className={commonStyles.cardTitle}>模板</div>
                  <div>
                    <CommonProductCard data={listSchemaCardData} />
                    <CommonProductCard data={newSchemaCardData} />
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