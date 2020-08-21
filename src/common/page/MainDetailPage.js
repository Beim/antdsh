import React, { Component } from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Button } from 'antd';
import commonStyles from '../css/common.module.scss'
import mainDetailStyles from '../css/mainDetail.module.scss';
import MenuHeader from '../component/MenuHeader'
import mainPageService from '../service/mainPageService'
import { HashLink } from 'react-router-hash-link';

const { Content } = Layout;


class MainDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      productDetailData: null,
      relatedProductsData: null,
    }
  }
  componentDidMount() {
    this.fetchProductDetailData();  
    this.fetchRelatedProductsData();
  }
  render() {
    return (
      <Layout className="layout" style={{ height: "auto" }}>
        <MenuHeader></MenuHeader>
        <Content style={{ padding: '0 50px' }}>
          {this.renderBreadcrumb()}
          <div style={{ background: '#f0f2f5', padding: 24, height: 'auto' }}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                <div className={mainDetailStyles.content}>
                  <div className={commonStyles.card + ' ' + mainDetailStyles.card}>
                    {this.renderHeader(this.state.productDetailData)}
                  </div>
                  <div className={commonStyles.card + ' ' + mainDetailStyles.card}>
                    <Menu
                      theme="light"
                      mode="horizontal"
                      defaultSelectedKeys={['0']}
                      style={{ lineHeight: '64px' }}
                    >
                      <Menu.Item key="0">
                        <HashLink to={`${this.props.match.url}#productIntroduceAnchor0`}>产品参数</HashLink>
                      </Menu.Item>
                      <Menu.Item key="1">
                        <HashLink to={`${this.props.match.url}#productIntroduceAnchor1`}>产品详情</HashLink>
                      </Menu.Item>
                      <Menu.Item key="2">
                        <HashLink to={`${this.props.match.url}#productIntroduceAnchor2`}>使用须知</HashLink>
                      </Menu.Item>
                    </Menu>
                    {this.renderProductIntroduce()}
                  </div>
                </div>
                <div className={mainDetailStyles.sidebar}>
                  <div className={mainDetailStyles.card}>
                    <div className={mainDetailStyles.detailRelated}>
                      <h2>相关推荐</h2>
                      {this.renderRelatedProducts()}
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

  async fetchRelatedProductsData() {
    const pid = this.props.match.params.id;
    const res = await mainPageService.relatedProductsData(pid)
    if (!res.ok) {
      console.log(res);
      return;
    }
    const relatedProductsData = await res.json();
    this.setState({relatedProductsData})
  }
  async fetchProductDetailData() {
    const pid = this.props.match.params.id;
    const res = await mainPageService.productDetailData(pid);
    if (!res.ok) {
      console.log(res);
      return;
    }
    const productDetailData = await res.json()
    this.setState({productDetailData})
  }
  renderBreadcrumb() {
    const productDetailData = this.state.productDetailData;
    if (productDetailData) {
      return (
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Main</Breadcrumb.Item>
          <Breadcrumb.Item>Detail</Breadcrumb.Item>
          <Breadcrumb.Item>{productDetailData.title}</Breadcrumb.Item>
        </Breadcrumb>
      )
    }
  }
  renderHeader(detailData) {
    if (detailData) {
      return (
        <div className={mainDetailStyles.detailHeader}>
          <div className={mainDetailStyles.detailHeaderImg}>
            <img src={detailData.headImgSrc} alt={detailData.title}></img>
          </div>
          <div className={mainDetailStyles.detailHeaderText}>
            <h1>{detailData.title}</h1>
            <p>{detailData.desc}</p>
            <Button onClick={() => {window.location=detailData.demoHref}}>试用</Button>
          </div>
        </div>
      )
    }
  }
  renderProductIntroduce() {
    const productDetailData = this.state.productDetailData;
    if (productDetailData) {
      const productParamsUl = [];
      const productDetail = productDetailData.productDetail;
      const productNotice = productDetailData.productNotice;
      for (let key in productDetailData.productParams) {
        let val = productDetailData.productParams[key]
        productParamsUl.push(
          <ul key={`productParams-${Math.random()}`}>
            <li>
              <label>{`${key}: `}</label>
              <span>{val}</span>
            </li>
          </ul>
        )
      }
      return (
        <div className={mainDetailStyles.detailIntroduce}>
          <section>
            <h2 id={`productIntroduceAnchor0`}>产品参数</h2>
            <div className={mainDetailStyles.detailIntroduceBox}>
              {productParamsUl}
            </div>
          </section>
          <section>
            <h2 id={`productIntroduceAnchor1`}>产品详情</h2>
            <div className={mainDetailStyles.detailIntroduceBox}>
              <img src={productDetail.imgSrc} alt="产品详情图片"></img>
            </div>
          </section>
          <section>
            <h2 id={`productIntroduceAnchor2`}>使用须知</h2>
            <p>{productNotice.text}</p>
          </section>
        </div>
      )
    }
  }
  renderRelatedProducts() {
    const relatedProductsData = this.state.relatedProductsData;
    if (relatedProductsData) {
      return relatedProductsData.map((val, idx) => {
        return (
          <div key={`relatedProduct-${idx}`}>
            <div className={mainDetailStyles.detailRelatedItem}>
              <div className={mainDetailStyles.detailRelatedImg}>
                <img src={val.imgSrc} alt={val.title}></img>
              </div>
              <div className={mainDetailStyles.detailRelatedText}>
                <h3>
                  <a href={val.href}>{val.title}</a>
                </h3>
                <p>{val.desc}</p>
              </div>
            </div>
          </div>
        )
      })
    }
  }

}

export default MainDetailPage