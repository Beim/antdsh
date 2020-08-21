import React, { Component } from 'react';
import { Form, Icon, Input, Button } from 'antd';

const FormItem = Form.Item;

/**
 * props: {
 *   handleSubmit: function
 * }
 */
class NormalRegisterForm extends Component {

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="login-form" style={{ background: "#fff", padding: "20px 24px 10px 24px", boxShadow: "0 4px 12px 0 rgba(0,0,0,0.2)" }} >
        <FormItem>
          {
            getFieldDecorator('username', {
              rules: [{ required: true, message: 'Please input your username!' }],
            })(<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your Password!' },
              ],
            })(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('confirmPassword', {
              rules: [
                { required: true, message: 'Please confirm your Password!' },
                { validator: this.checkPassword }
              ],
            })(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Confirm Password" />)
          }
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Sign up
          </Button>
        </FormItem>
      </Form>
    )
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const username = values.username;
        const password = values.password;
        this.props.handleSubmit(username, password);
      }
    });
  };

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Password not same!');
    } else {
      callback();
    }
  };
}

const wrappedNormalRegisterForm = Form.create()(NormalRegisterForm);

export default wrappedNormalRegisterForm;