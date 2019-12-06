import React, { Component } from 'react';
import {Layout, Breadcrumb, message, Modal, Input} from 'antd';
import { Row } from 'antd';
import commonStyles from '../css/common.module.scss'
import MenuHeader from '../component/MenuHeader';
import mainPageService from '../service/mainPageService';
import CommonProductCard from '../component/ProductCard';


const { Content } = Layout;

class ProductCard extends Component {
  renderProducts() {
    const productsData = this.props.data.products;
    const products = productsData.map((val, idx) => {
      return (
        <CommonProductCard data={val} key={`productCard-${idx}`} />
      )
    });
    return (
      <Row>
        {products}
      </Row>
    )
  }

  /**
   * this.props.data: {
   *   label: String,
   *   products: Array
   * }
   * @returns {*}
   */
  render() {
    return (
      <div className={commonStyles.card}>
        <div>
          <div className={commonStyles.cardTitle}>{this.props.data.label}</div>
          <div>
            {this.renderProducts()}
          </div>
        </div>
      </div>
    )
  }
}

class MainHomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      homeData: [],
      newGspaceName: "",
      newGspaceModalVisible: false,
    }
  }
  async componentDidMount() {
    const homeData = await this.renderHomeData();
    this.setState({homeData});
  }

  render() {
    return (
      <Layout className="layout" style={{ height: "100%" }}>
        <MenuHeader></MenuHeader>
        
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
          </Breadcrumb>
          <div className={commonStyles.pageBackground}>
            <div className={commonStyles.page}>
              <div className={commonStyles.content}>
                {this.renderProductCards()}
                {this.renderNewGspaceModal()}
              </div>
            </div>
          </div>
        </Content>

      </Layout>
    )
  }

  renderProductCards = () => {
    const homeData = this.state.homeData;
    return homeData.map((val, idx) => <ProductCard data={val} key={`productCard-${idx}`}></ProductCard>);
  };

  /**
   * 获取gspace 信息，需要登录, 返回首页渲染卡片需要的数据
   * @returns {Promise<[]|Array>}
   */
  renderHomeData = async () => {
    let response = await mainPageService.getGspaceInfo();
    if (!response.succ) {
      message.info(JSON.stringify(response));
      return [];
    }
    const gspaceInfoList = response.data;
    const homeData = [];
    for (let idx in gspaceInfoList) {
      let gspaceInfo = gspaceInfoList[idx];
      let gspaceId = gspaceInfo['id'];
      let gspaceName = gspaceInfo['name'];
      response = await mainPageService.getGspaceNeoInfo(gspaceId);
      if (!response.succ) {
        message.info(JSON.stringify(response));
        return [];
      }
      let gspaceNeoInfo = response.data;
      let neoBrowserUrl = `http://${gspaceNeoInfo['host']}:${gspaceNeoInfo['httpPort']}/browser/`;
      let item = {
        cid: idx + 1,
        label: `图空间/${gspaceName}`,
        products: [
          {
            pid: 1,
            href: `/schema?gid=${gspaceId}`,
            imgSrc: "/images/R.png",
            title: '模式',
            desc: '模式',
          },
          {
            pid: 2,
            href: neoBrowserUrl,
            imgSrc: "/images/M.png",
            title: '资源',
            desc: '资源浏览',
          },
          {
            pid: 3,
            href: '/main/detail/1',
            imgSrc: "/images/T.png",
            title: '训练',
            desc: '训练embedding',
          },
          {
            pid: 4,
            href: null,
            onClick: null,
            imgSrc: "/images/T.png",
            title: '待定',
            desc: '该模块将在后续扩展',
          },
        ]
      };
      homeData.push(item);
    }
    homeData.push({
      cid: 0,
      label: '图空间',
      products: [
        {
          pid: 1,
          href: null,
          onClick: this.showNewGspaceModal,
          imgSrc: "/images/R.png",
          title: '申请图空间',
          desc: '申请图空间',
        }
      ]
    });
    return homeData;
  }

  showNewGspaceModal = () => {
    this.setState({ newGspaceModalVisible: true });
  };

  renderNewGspaceModal = () => {
    return (
      <Modal
        title={"申请图空间"}
        visible={this.state.newGspaceModalVisible}
        onOk={this.handleNewGspaceModalOk}
        onCancel={this.handleNewGspaceModalCancle}
      >
        <span>图空间名：</span>
        <Input value={this.state.newGspaceName} name={"newGspaceName"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };

  handleNewGspaceModalOk = async () => {
    const { newGspaceName } = this.state;
    const response = await mainPageService.applyGspace(newGspaceName);
    if (response !== null && !response.succ) {
      message.info(JSON.stringify(response));
    }
    this.setState({
      homeData: await this.renderHomeData(),
      newGspaceModalVisible: false,
    });
  };

  handleNewGspaceModalCancle = () => {
    this.setState({ newGspaceModalVisible: false });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

}

export default MainHomePage