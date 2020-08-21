import React, { Component } from 'react';
import {Input, Tree, Button, Modal, message} from 'antd';
import OWL_CONST from '../constant/OwlConstant';
import editSchemaStyles from '../css/schemaTree.module.scss'

const TreeNode = Tree.TreeNode;
const KEYS = OWL_CONST.KEYS;
const TYPES = OWL_CONST.TYPE;

class SchemaTree extends Component {

  /**
   * props: {
   *   schemaOwl: {}, // not required
   *   expandAll: boolean, // not required 是否默认展开
   *   editable: boolean, // not required 编辑按钮是否可见
   *   submitOwl: function(owl) // required
   *   submitSchemaJson: function(schemaJson) // not required
   * }
   * @param props
   */
  constructor(props) {
    super(props);
    let schemaJson = this.transOwlToJson(props['schemaOwl']);
    let relativeUris = this.parseUriFromOwl(props['schemaOwl']);
    this.state = {
      schemaJson,  // json 格式的schema，用于UI CRUD
      relativeUris,  // 记录class/objectproperty/datatypeproperty 的relativeUri 集合，用于检查重名（如类和关系的uri 重复）
      expandAll: props['expandAll'] !== undefined ? props['expandAll'] : false,
      editBtnVisible: props['editable'] !== undefined ? props['editable'] : false,

      newClassModalVisible: false,
      newClassUri: "#",

      newSuperClassModalVisible: false,
      newSuperClassUri: '#',
      newSuperClassOfClassUri: "#",

      newDatatypePropertyModalVisible: false,
      newDatatypePropertyUri: '#',
      newDatatypePropertyDomainUri: '#',

      newObjectPropertyModalVisible: false,
      newObjectPropertyUri: '#',
      newObjectPropertyDomainUri: '#',

      newDRangeModalVisible: false,
      newDRangeUri: 'xsd:', // datatypeProperty range uri
      newDPropertyUri: '#', // datatypeProperty uri
      newDRangeDomainUri: '#', // datatypeProperty domain uri

      newORangeModalVisible: false,
      newORangeUri: '#', // objectProperty range uri
      newOPropertyUri: '#', // objectProperty uri
      newODomainuri: '#', // objectProperty domain uri

      deleteItemModalVisible: false,
      deleteItemType: '', // one of (class datatypeProperty objectProperty)
      deleteClass: '', // class name
      deleteDatatypeProperty: '', // datatypeProperty name
      deleteObjectProperty: '', // objectProperty name
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let nextState = {};
    if (this.props['schemaOwl'] === undefined && nextProps['schemaOwl'] !== undefined) {
      const schemaJson = this.transOwlToJson(nextProps['schemaOwl']);
      if (this.props.submitSchemaJson !== undefined) {
        this.props.submitSchemaJson(schemaJson);
      }
      nextState['schemaJson'] = schemaJson;
    }
    if (nextProps['schemaOwl'] !== undefined) {
      const relativeUris = this.parseUriFromOwl(nextProps['schemaOwl']);
      nextState['relativeUris'] = relativeUris;
    }
    this.setState(nextState);
  }

  render() {
    const classTreeNodes = [];
    for (let classUri in this.state.schemaJson) {
      let classObj = this.state.schemaJson[classUri];
      classTreeNodes.push(this.renderClassTreeNode(classUri, classObj));
    }
    return (
      <div>
        <Tree
          defaultExpandAll={this.state.expandAll}
          showLine={true}
        >
          {classTreeNodes}
          {(() => this.state.editBtnVisible ? <TreeNode title={<Button onClick={this.showNewClassModal}>Add class</Button>}></TreeNode> : <div />)()}

        </Tree>
        {this.renderNewClassModal()}
        {this.renderSuperClassModal()}
        {this.renderNewDataPropertyModal()}
        {this.renderNewObjectPropertyModal()}
        {this.renderNewDRangeModal()}
        {this.renderNewORangeModal()}
        {this.renderDeleteItemModal()}
      </div>
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

  showNewORangeModal = (newORangeDomainUri, newOPropertyUri) => {
    this.setState({
      newORangeDomainUri,
      newOPropertyUri,
      newORangeModalVisible: true,
      newORangeUri: '#',
    })
  };
  handleNewORangeModalOk = (e) => {
    const schemaJson = this.state.schemaJson;
    const newORangeDomainUri = this.state.newORangeDomainUri ? this.state.newORangeDomainUri.trim() : '#';
    const newOPropertyUri = this.state.newOPropertyUri ? this.state.newOPropertyUri.trim() : '#';
    const newORangeUri = this.state.newORangeUri ? this.state.newORangeUri.trim() : '#';
    if (newORangeDomainUri === '#' || newOPropertyUri === '#' || newORangeUri === '#') {
      return message.info('Value can\'t be empty')
    }
    if (!this.addPropRangeToSchemaJson(newORangeDomainUri, newOPropertyUri, newORangeUri, KEYS.OBJECT_PROPERTY, schemaJson))
      return;
    this.setState({
      schemaJson,
      newORangeModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewORangeModalCancle = (e) => {
    this.setState({
      newORangeModalVisible: false,
    })
  };
  /**
   * 
   * @param domainUri
   * @param propUri
   * @param rangeUri
   * @param propType "ObjectProperty" or "DatatypeProperty"
   * @param schemaJson
   * @returns {boolean}
   */
  addPropRangeToSchemaJson = (domainUri, propUri, rangeUri, propType, schemaJson) => {
    if (propType === KEYS.OBJECT_PROPERTY && !(rangeUri in schemaJson)) {
      message.info(`Please add class ${rangeUri} first`);
      return false
    }
    const propObj = schemaJson[domainUri][propType][propUri];
    if (!('range' in propObj)) {
      propObj['range'] = [rangeUri];
    }
    else {
      if (propObj['range'].includes(rangeUri)) {
        message.info(`Range ${rangeUri} exists`)
        return false;
      }
      propObj['range'].push(rangeUri);
    }
    return true;
  };
  
  showNewDRangeModal = (newDRangeDomainUri, newDPropertyUri) => {
    this.setState({
      newDRangeDomainUri,
      newDPropertyUri,
      newDRangeModalVisible: true,
      newDRangeUri: 'xsd:',
    })
  };
  handleNewDRangeModalOk = (e) => {
    const schemaJson = this.state.schemaJson;
    const newDRangeDomainUri = this.state.newDRangeDomainUri ? this.state.newDRangeDomainUri.trim() : '#';
    const newDPropertyUri = this.state.newDPropertyUri ? this.state.newDPropertyUri.trim() : '#';
    const newDRangeUri = this.state.newDRangeUri ? this.state.newDRangeUri.trim() : 'xsd:';
    if (newDRangeDomainUri === '#' || newDPropertyUri === '#' || newDRangeUri === 'xsd:') {
      return message.info('Value can\'t be empty')
    }
    if (!this.addPropRangeToSchemaJson(newDRangeDomainUri, newDPropertyUri, newDRangeUri, KEYS.DATATYPE_PROPERTY, schemaJson))
      return;
    this.setState({
      schemaJson,
      newDRangeModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewDRangeModalCancle = (e) => {
    this.setState({
      newDRangeModalVisible: false,
    })
  };

  showNewObjectPropertyModal = (newObjectPropertyDomainUri) => {
    this.setState({
      newObjectPropertyDomainUri,
      newObjectPropertyModalVisible: true,
      newObjectPropertyUri: '#',
      newORangeUri: '#',
    });
  };
  handleNewObjectPropertyModalOk = (e) => {
    const newObjectPropertyUri = this.state.newObjectPropertyUri ? this.state.newObjectPropertyUri.trim() : '#';
    const newObjectPropertyDomainUri = this.state.newObjectPropertyDomainUri ? this.state.newObjectPropertyDomainUri.trim() : '#';
    const newORangeUri = this.state.newORangeUri ? this.state.newORangeUri.trim() : '#';
    const schemaJson = JSON.parse(JSON.stringify(this.state.schemaJson));
    const relativeUris = this.state.relativeUris;
    if (newObjectPropertyUri === '#' || newObjectPropertyDomainUri === '#' || newORangeUri === '#') {
      return message.info('Value can\'t be empty')
    }
    if (relativeUris[TYPES.CLASS].has(newObjectPropertyUri.toLowerCase())
      || relativeUris[TYPES.DATATYPE_PROPERTY].has(newObjectPropertyUri.toLowerCase())) {
      return message.info(`${newObjectPropertyUri} exists`);
    }
    if (!this.addPropertyToSchemaJson(newObjectPropertyUri, newObjectPropertyDomainUri, KEYS.OBJECT_PROPERTY, schemaJson))
      return;
    if (!this.addPropRangeToSchemaJson(newObjectPropertyDomainUri, newObjectPropertyUri, newORangeUri, KEYS.OBJECT_PROPERTY, schemaJson))
      return;
    this.setState({
      schemaJson,
      newObjectPropertyModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewObjectPropertyModalCancle = (e) => {
    this.setState({
      newObjectPropertyModalVisible: false,
    })
  };

  showNewDatatypePropertyModal = (newDatatypePropertyDomainUri) => {
    this.setState({
      newDatatypePropertyModalVisible: true,
      newDatatypePropertyDomainUri,
      newDatatypePropertyUri: '#',
      newDRangeUri: 'xsd:',
    });
  };
  handleNewDatatypePropertyModalOk = (e) => {
    const newDatatypePropertyUri = this.state.newDatatypePropertyUri ? this.state.newDatatypePropertyUri.trim() : "#";
    const newDatatypePropertyDomainUri = this.state.newDatatypePropertyDomainUri ? this.state.newDatatypePropertyDomainUri.trim() : "#";
    const newDRangeUri = this.state.newDRangeUri ? this.state.newDRangeUri.trim() : 'xsd:';
    const schemaJson = JSON.parse(JSON.stringify(this.state.schemaJson));
    const relativeUris = this.state.relativeUris;
    if (newDatatypePropertyUri === '#' || newDatatypePropertyDomainUri === '#' || newDRangeUri === 'xsd:') {
      return message.info('Value can\'t be empty')
    }
    if (relativeUris[TYPES.OBJECT_PROPERTY].has(newDatatypePropertyUri.toLowerCase())
      || relativeUris[TYPES.CLASS].has(newDatatypePropertyUri.toLowerCase())) {
      return message.info(`${newDatatypePropertyUri} exists`);
    }
    if (!this.addPropertyToSchemaJson(newDatatypePropertyUri, newDatatypePropertyDomainUri, KEYS.DATATYPE_PROPERTY, schemaJson))
      return;
    if (!this.addPropRangeToSchemaJson(newDatatypePropertyDomainUri, newDatatypePropertyUri, newDRangeUri, KEYS.DATATYPE_PROPERTY, schemaJson))
      return;
    this.setState({
      schemaJson,
      newDatatypePropertyModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewDatatypePropertyModalCancle = (e) => {
    this.setState({
      newDatatypePropertyModalVisible: false,
    })
  };
  /**
   *
   * @param propUri datatypePropertyUri or objectPropertyUri
   * @param domainUri classUri
   * @param propType "DatatypeProperty" or "ObjectProperty",
   * @param schemaJson this.state.schemaJson
   * @returns {boolean}
   */
  addPropertyToSchemaJson = (propUri, domainUri, propType, schemaJson) => {
    if (!(propType in schemaJson[domainUri])) {
      schemaJson[domainUri][propType] = {
        [propUri]: {},
      };
    }
    else {
      if (propUri in schemaJson[domainUri][propType]) {
        message.info(`Property ${propUri} exists`);
        return false;
      }
      schemaJson[domainUri][propType][propUri] = {};
    }
    return true
  };

  showNewClassModal = () => {
    this.setState({
      newClassModalVisible: true,
      newClassUri: "#",
    });
  };
  handleNewClassModalOk = (e) => {
    const schemaJson = this.state.schemaJson;
    const newClassUri = this.state.newClassUri ? this.state.newClassUri.trim() : '#';
    const relativeUris = this.state.relativeUris;
    if (newClassUri === '#') {
      return message.info('Value can\'t be empty')
    }
    if (newClassUri in schemaJson) {
      return message.info(`${newClassUri} exists`);
    }
    if (relativeUris[TYPES.OBJECT_PROPERTY].has(newClassUri.toLowerCase())
      || relativeUris[TYPES.DATATYPE_PROPERTY].has(newClassUri.toLowerCase())) {
      return message.info(`${newClassUri} exists`);
    }
    schemaJson[newClassUri] = {};
    // 默认带有name: string 属性
    this.addPropertyToSchemaJson("#name", newClassUri, KEYS.DATATYPE_PROPERTY, schemaJson);
    this.addPropRangeToSchemaJson(newClassUri, "#name", "xsd:string", KEYS.DATATYPE_PROPERTY, schemaJson);
    this.setState({
      schemaJson,
      newClassModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewClassModalCancle = (e) => {
    this.setState({
      newClassModalVisible: false,
    });
  };

  showNewSuperClassModal = (newSuperClassOfClassUri) => {
    this.setState({
      newSuperClassModalVisible: true,
      newSuperClassUri: "#",
      newSuperClassOfClassUri,
    })
  };
  handleNewSuperClassModalOk = (e) => {
    const newSuperClassUri = this.state.newSuperClassUri;
    const newSuperClassOfClassUri = this.state.newSuperClassOfClassUri;
    if (newSuperClassUri === newSuperClassOfClassUri) {
      return message.info(`父类不能与子类相同`)
    }
    const schemaJson = this.state.schemaJson;
    if (!(newSuperClassUri in schemaJson)) {
      return message.info(`请先添加类${newSuperClassUri}`)
    }
    if (!('subClassOf' in schemaJson[newSuperClassOfClassUri])) {
      schemaJson[newSuperClassOfClassUri]['subClassOf'] = [newSuperClassUri];
    }
    else {
      if (schemaJson[newSuperClassOfClassUri]['subClassOf'].includes(newSuperClassUri)) {
        return message.info(`类${newSuperClassUri} 已存在`)
      }
      schemaJson[newSuperClassOfClassUri]['subClassOf'].push(newSuperClassUri);
    }
    this.setState({
      schemaJson,
      newSuperClassModalVisible: false,
    });
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleNewSuperClassModalCancle = (e) => {
    this.setState({
      newSuperClassModalVisible: false,
    });
  };

  /*
  args: {
    type: '',
    classUri: '',
    datatypeProperty: '',
    objectProperty: '',
  }
   */
  showDeleteItemModal = (args) => {
    this.setState({
      deleteItemModalVisible: true,
      deleteItemType: args['type'] || '',
      deleteClass: args['classUri'] || '',
      deleteDatatypeProperty: args['datatypeProperty'] || '',
      deleteObjectProperty: args['objectProperty'] || '',
    })
  };
  handleDeleteItemModalOk = (e) => {
    let {schemaJson, deleteItemType, deleteClass, deleteDatatypeProperty, deleteObjectProperty} = this.state;
    if (deleteItemType === 'class') {
      delete schemaJson[deleteClass]
    } else if (deleteItemType === 'datatypeProperty') {
      delete schemaJson[deleteClass][KEYS.DATATYPE_PROPERTY][deleteDatatypeProperty]
    } else if (deleteItemType === "objectProperty") {
      delete schemaJson[deleteClass][KEYS.OBJECT_PROPERTY][deleteObjectProperty]
    }
    this.setState({
      deleteItemModalVisible: false,
      schemaJson,
      deleteItemType: '',
      deleteClass: '',
      deleteDatatypeProperty: '',
      deleteObjectProperty: '',
    })
    this.props.submitOwl(this.transJsonToOwl(schemaJson));
  };
  handleDeleteItemModalCancle = (e) => {
    this.setState({
      deleteItemModalVisible: false,
      deleteItemType: '',
      deleteClass: '',
      deleteDatatypeProperty: '',
      deleteObjectProperty: '',
    })
  };

  /**
   * 从owl 中获取relativeUri
   * 返回 { 'owl:Class': (#abc, ...), 'owl:DatatypeProperty': (#def, ...), 'owl:ObjectProperty': (#ghi, ...) }
   * @param owl
   */
  parseUriFromOwl(owl) {
    const retrieveRelativeUri = (uri) => {
      const re = new RegExp(`.*(#.*)`);
      const result = uri.match(re);
      return result[1];
    };
    let uris = {};
    uris[TYPES.CLASS] = new Set();
    uris[TYPES.DATATYPE_PROPERTY] = new Set();
    uris[TYPES.OBJECT_PROPERTY] = new Set();
    if (owl === undefined) {
      return uris;
    }
    owl[KEYS.GRAPH].forEach((item, idx) => {
      const relativeUri = retrieveRelativeUri(item[KEYS.ID]);
      uris[item[KEYS.TYPE]].add(relativeUri.toLowerCase());
    });
    return uris;
  }

  transOwlToJson(owl) {
    if (owl === undefined) {
      return {};
    }
    const retrieveRelativeUri = (uri) => {
      const re = new RegExp(`.*(#.*)`);
      const result = uri.match(re);
      return result[1];
    };
    const retrieveValuesFromStrOrArr = (item, key, needRelativeUri) => {
      if (!(key in item)) return [];
      const values = [];
      if (typeof item[key] === "string") {
        if (needRelativeUri) {
          values.push(retrieveRelativeUri(item[key]));
        }
        else {
          values.push(item[key]);
        }
      }
      /** array */
      else {
        item[key].forEach((val, idx) => {
          if (needRelativeUri) {
            values.push(retrieveRelativeUri(val));
          }
          else {
            values.push(val);
          }
        });
      }
      return values;
    };

    let schemaJson = {};
    owl[KEYS.GRAPH].forEach((item, idx) => {
      if (item[KEYS.TYPE] === TYPES.CLASS) {
        const relativeUri = retrieveRelativeUri(item[KEYS.ID]);
        if (!(relativeUri in schemaJson)) {
          schemaJson[relativeUri] = {};
        }
        if (KEYS.SUB_CLASS_OF in item) {
          schemaJson[relativeUri][KEYS.SUB_CLASS_OF] = retrieveValuesFromStrOrArr(item, KEYS.SUB_CLASS_OF, true);
        }
      }
      else if (item[KEYS.TYPE] === TYPES.DATATYPE_PROPERTY) {
        const propRelativeUri = retrieveRelativeUri(item[KEYS.ID]);
        const ranges = retrieveValuesFromStrOrArr(item, KEYS.RANGE, false);
        const domains = retrieveValuesFromStrOrArr(item, KEYS.DOMAIN, true);
        domains.forEach((domain, idx) => {
          if (!(domain in schemaJson)) {
            schemaJson[domain] = {};
          }
          if (!(KEYS.DATATYPE_PROPERTY in schemaJson[domain])) {
            schemaJson[domain][KEYS.DATATYPE_PROPERTY] = {};
          }
          schemaJson[domain][KEYS.DATATYPE_PROPERTY][propRelativeUri] = {
            [KEYS.RANGE]: ranges,
          };
        })
      }
      else if (item[KEYS.TYPE] === TYPES.OBJECT_PROPERTY) {
        const propRelativeUri = retrieveRelativeUri(item[KEYS.ID]);
        const ranges = retrieveValuesFromStrOrArr(item, KEYS.RANGE, true);
        const domains = retrieveValuesFromStrOrArr(item, KEYS.DOMAIN, true);
        domains.forEach((domain, idx) => {
          if (!(domain in schemaJson)) {
            schemaJson[domain] = {};
          }
          if (!(KEYS.OBJECT_PROPERTY in schemaJson[domain])) {
            schemaJson[domain][KEYS.OBJECT_PROPERTY] = {};
          }
          schemaJson[domain][KEYS.OBJECT_PROPERTY][propRelativeUri] = {
            [KEYS.RANGE]: ranges,
          };
        })
      }
    });
    return JSON.parse(JSON.stringify(schemaJson));
  }

  transJsonToOwl(schemaJson) {
    const retrieveLabelFromUri = (uri) => {
      const re = new RegExp(`.*#(.*)`);
      const result = uri.match(re);
      return result[1];
    };
    const transValuestoStrOrArr = (values) => {
      if (values.length === 1) {
        return values[0];
      }
      else {
        return values;
      }
    };
    const addProperty = (propType, datatypeProperties, propUri, domainUri, rangeUriArr) => {
      if (!(propUri in datatypeProperties)) {
        datatypeProperties[propUri] = {
          [KEYS.ID]: propUri,
          [KEYS.TYPE]: propType,
          [KEYS.LABEL]: retrieveLabelFromUri(propUri),
        }
      }
      let datatypeProperty = datatypeProperties[propUri];
      /** 添加domain */
      if (!(KEYS.DOMAIN in datatypeProperty)) {
        datatypeProperty[KEYS.DOMAIN] = domainUri;
      }
      else if (typeof datatypeProperty[KEYS.DOMAIN] === "string") {
        if (datatypeProperty[KEYS.DOMAIN] !== domainUri) {
          datatypeProperty[KEYS.DOMAIN] = [datatypeProperty[KEYS.DOMAIN], domainUri];
        }
      }
      /** prop['domain'] = [...] */
      else {
        if (!datatypeProperty[KEYS.DOMAIN].includes(domainUri)) {
          datatypeProperty[KEYS.DOMAIN].push(domainUri);
        }
      }
      /** 添加range */
      if (rangeUriArr === undefined) {
        // schemaJson 中未设置range
      }
      else if (!(KEYS.RANGE in datatypeProperty)) {
        datatypeProperty[KEYS.RANGE] = transValuestoStrOrArr(rangeUriArr);
      }
      else if (typeof datatypeProperty[KEYS.RANGE] === "string") {
        if (rangeUriArr.includes(datatypeProperty[KEYS.RANGE])) {
          datatypeProperty[KEYS.RANGE] = transValuestoStrOrArr(rangeUriArr);
        }
        else {
          datatypeProperty[KEYS.RANGE] = rangeUriArr.concat(datatypeProperty[KEYS.RANGE]);
        }
      }
      /** prop['range'] = [...] */
      else {
        let newRanges = datatypeProperty[KEYS.RANGE].concat(rangeUriArr);
        datatypeProperty[KEYS.RANGE] = Array.from(new Set(newRanges));
      }
    };
    const owl = {
      [KEYS.GRAPH]: [],
      [KEYS.CONTEXT]: JSON.parse(JSON.stringify(OWL_CONST.CONTEXT))
    };
    const classes = {};
    const datatypeProperties = {};
    const objectProperties = {};
    for (let classUri in schemaJson) {
      let item = schemaJson[classUri];
      classes[classUri] = {
        [KEYS.ID]: classUri,
        [KEYS.TYPE]: TYPES.CLASS,
        [KEYS.LABEL]: retrieveLabelFromUri(classUri),
      };
      if (KEYS.SUB_CLASS_OF in item) {
        classes[classUri][KEYS.SUB_CLASS_OF] = transValuestoStrOrArr(item[KEYS.SUB_CLASS_OF]);
      }
      if (KEYS.DATATYPE_PROPERTY in item) {
        const domainUri = classUri;
        for (let propUri in item[KEYS.DATATYPE_PROPERTY]) {
          const rangeUriArr = item[KEYS.DATATYPE_PROPERTY][propUri][KEYS.RANGE];
          addProperty(TYPES.DATATYPE_PROPERTY, datatypeProperties, propUri, domainUri, rangeUriArr);
        }
      }
      if (KEYS.OBJECT_PROPERTY in item) {
        const domainUri = classUri;
        for (let propUri in item[KEYS.OBJECT_PROPERTY]) {
          const rangeUriArr = item[KEYS.OBJECT_PROPERTY][propUri][KEYS.RANGE];
          addProperty(TYPES.OBJECT_PROPERTY, objectProperties, propUri, domainUri, rangeUriArr);
        }
      }
    }
    for (let key in classes) {
      owl[KEYS.GRAPH].push(classes[key]);
    }
    for (let key in datatypeProperties) {
      owl[KEYS.GRAPH].push(datatypeProperties[key]);
    }
    for (let key in objectProperties) {
      owl[KEYS.GRAPH].push(objectProperties[key]);
    }
    return JSON.parse(JSON.stringify(owl));
  }

  handleSubmitOwl = () => {
    this.props.submitOwl(this.transJsonToOwl(this.state.schemaJson));
  };

  renderClassTreeNode = (classUri, classItem) => {
    const getSpan = (spanVal, deleteItemArgs=null) => {
      if (this.state.editBtnVisible && deleteItemArgs !== null) {
        return (
          <span onClick={this.showDeleteItemModal.bind(this, deleteItemArgs)}>{spanVal}</span>
        )
      }
      return (
        <span>{spanVal}</span>
      )
    };
    const getNewSuperClassBtn = (btnVal, classUri) => {
      return (
        <div>
          <Button onClick={this.showNewSuperClassModal.bind(this, classUri)}>{btnVal}</Button>
        </div>
      )
    };
    const getNewDatatypePropertyBtn = (btnVal, domainUri) => {
      return (
        <div>
          <Button onClick={this.showNewDatatypePropertyModal.bind(this, domainUri)}>{btnVal}</Button>
        </div>
      )
    };
    const getNewObjectPropertyBtn = (btnVal, domainUri) => {
      return (
        <div>
          <Button onClick={this.showNewObjectPropertyModal.bind(this, domainUri)}>{btnVal}</Button>
        </div>
      )
    };
    const getDRangeBtn = (btnVal, domainUri, propUri) => {
      return (
        <div>
          <Button onClick={this.showNewDRangeModal.bind(this, domainUri, propUri)}>{btnVal}</Button>
        </div>
      )
    };
    const getORangeBtn = (btnVal, domainUri, propUri) => {
      return (
        <div>
          <Button onClick={this.showNewORangeModal.bind(this, domainUri, propUri)}>{btnVal}</Button>
        </div>
      )
    };
    const renderParentClasses = (superClassList) => {
      if (superClassList === undefined) return;
      const superClassStr = `父类: ${superClassList.join(', ')}`;
      return <TreeNode title={getSpan(superClassStr)}></TreeNode>;
    };
    const renderPropRanges = (ranges) => {
      if (ranges === undefined) return;
      const rangeStr = `Range: ${ranges.join(', ')}`;
      return <TreeNode title={getSpan(rangeStr)}></TreeNode>;
    };
    const renderDatatypeProperty = (propertyObj, classUri) => {
      if (propertyObj === undefined) return;
      const propNodes = [];
      for (let propUri in propertyObj) {
        let propValues = propertyObj[propUri];
        propNodes.push(
          <TreeNode
            title={
              getSpan(
                `Property: ${propUri}`,
                {'type': 'datatypeProperty', 'classUri': classUri, 'datatypeProperty': propUri})
            }
            key={`datatypeProperty${propUri}${classUri}`}>
            {renderPropRanges(propValues['range'])}
            {(() => this.state.editBtnVisible ? <TreeNode title={getDRangeBtn('Add range', classUri, propUri)}></TreeNode> : null)()}
          </TreeNode>
        )
      }
      return propNodes;
    };
    const renderObjectProperty = (propertyObj, classUri) => {
      if (propertyObj === undefined) return;
      const propNodes = [];
      for (let propUri in propertyObj) {
        let propValues = propertyObj[propUri];
        propNodes.push(
          <TreeNode
            title={
              getSpan(
                `Relationship: ${propUri}`,
                {'type': 'objectProperty', 'classUri': classUri, 'objectProperty': propUri}
              )
            }
            key={`objectProperty${propUri}${classUri}`}>
            {renderPropRanges(propValues['range'])}
            {(() => this.state.editBtnVisible ? <TreeNode title={getORangeBtn('Range', classUri, propUri)}></TreeNode> : null)()}
          </TreeNode>
        )
      }
      return propNodes;
    };
    return (
      <TreeNode title={getSpan(classUri, {'type': 'class', 'classUri': classUri})} key={`classTreeNode${classUri}`}>
        {/*{renderParentClasses(classItem['subClassOf'])}*/}
        {/*{(() => this.state.editBtnVisible ? <TreeNode title={getNewSuperClassBtn('添加父类', classUri)}></TreeNode> : null)()}*/}

        {renderDatatypeProperty(classItem['DatatypeProperty'], classUri)}
        {(() => this.state.editBtnVisible ? <TreeNode title={getNewDatatypePropertyBtn('Add property', classUri)}></TreeNode> : null)()}

        {renderObjectProperty(classItem['ObjectProperty'], classUri)}
        {(() => this.state.editBtnVisible ? <TreeNode title={getNewObjectPropertyBtn('Add relationship', classUri)}></TreeNode> : null)()}

      </TreeNode>
    )
  };

  renderDeleteItemModal = () => {
    return (
      <Modal
        title={"Delete node"}
        visible={this.state.deleteItemModalVisible}
        onOk={this.handleDeleteItemModalOk}
        onCancel={this.handleDeleteItemModalCancle}
      >
        <span>Delete node?</span>
      </Modal>
    )
  };

  renderNewClassModal = () => {
    return (
      <Modal
        title={"Add class"}
        visible={this.state.newClassModalVisible}
        onOk={this.handleNewClassModalOk}
        onCancel={this.handleNewClassModalCancle}
      >
        <span>Class name：</span>
        <Input value={this.state.newClassUri} name={"newClassUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };
  renderSuperClassModal = () => {
    return (
      <Modal
        title={"添加父类"}
        visible={this.state.newSuperClassModalVisible}
        onOk={this.handleNewSuperClassModalOk}
        onCancel={this.handleNewSuperClassModalCancle}
      >
        <span>父类名: </span>
        <Input value={this.state.newSuperClassUri} name={"newSuperClassUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };
  renderNewDataPropertyModal = () => {
    return (
      <Modal
        title={"Add property"}
        visible={this.state.newDatatypePropertyModalVisible}
        onOk={this.handleNewDatatypePropertyModalOk}
        onCancel={this.handleNewDatatypePropertyModalCancle}
      >
        <label className={editSchemaStyles.modalLabel}>Property</label>
        <Input value={this.state.newDatatypePropertyUri} name={"newDatatypePropertyUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
        <br/><br/>
        <label className={editSchemaStyles.modalLabel}>Range</label>
        <Input value={this.state.newDRangeUri} name={"newDRangeUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };
  renderNewObjectPropertyModal = () => {
    return (
      <Modal
        title={"Add relationship"}
        visible={this.state.newObjectPropertyModalVisible}
        onOk={this.handleNewObjectPropertyModalOk}
        onCancel={this.handleNewObjectPropertyModalCancle}
      >
        <label className={editSchemaStyles.modalLabel}>Relationship</label>
        <Input value={this.state.newObjectPropertyUri} name={"newObjectPropertyUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
        <br/><br/>
        <label className={editSchemaStyles.modalLabel}>Range</label>
        <Input value={this.state.newORangeUri} name={"newORangeUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };
  renderNewDRangeModal = () => {
    return (
      <Modal
        title={"Add range"}
        visible={this.state.newDRangeModalVisible}
        onOk={this.handleNewDRangeModalOk}
        onCancel={this.handleNewDRangeModalCancle}
      >
        <span>Range: </span>
        <Input value={this.state.newDRangeUri} name={"newDRangeUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };
  renderNewORangeModal = () => {
    return (
      <Modal
        title={"Add range"}
        visible={this.state.newORangeModalVisible}
        onOk={this.handleNewORangeModalOk}
        onCancel={this.handleNewORangeModalCancle}
      >
        <span>Range: </span>
        <Input value={this.state.newORangeUri} name={"newORangeUri"} onChange={this.handleInputChange} style={{width: '60%'}}></Input>
      </Modal>
    )
  };


}

export default SchemaTree;