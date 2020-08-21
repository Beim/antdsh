import React, { Component } from 'react';
import { Layout, Breadcrumb } from 'antd';
import MenuHeader from '../../common/component/MenuHeader';
import commonStyles from '../../common/css/common.module.scss';
import SCHEMA_CONST from '../constant/SchemaConstant';
import CommonProductCard from '../../common/component/ProductCard';
import { withRouter } from 'react-router-dom';

const { Content } = Layout;

class AdminSchemaMainPage extends Component {

  render() {
    const listSchemaCardData = {
      href: SCHEMA_CONST.HREF.ADMIN_LIST,
      imgSrc: "/images/menu.png",
      title: "List",
      desc: "Schema list",
    };
    const schemaBaseCardData = {
      href: SCHEMA_CONST.HREF.ADMIN_BASE,
      imgSrc: "/images/menu.png",
      title: "Base",
      desc: "Schema base",
    };
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader defaultSelectedKey="2" />
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Schema manage</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={commonStyles.card}>
                  <div className={commonStyles.cardTitle}>Schema manage</div>
                  <div>
                    <CommonProductCard data={listSchemaCardData} />
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

export default withRouter(AdminSchemaMainPage);