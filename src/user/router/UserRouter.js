import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import LoginPage from '../page/LoginPage';
import RegisterPage from '../page/RegisterPage';
import ConsolePage from '../page/ConsolePage';
import { withRouter } from 'react-router-dom';

class UserRouter extends Component {
  render() {
    const match = this.props.match
    return (
      <div style={{ height: "100%" }}>
        <Switch>
          <Route path={`${match.path}/login`} component={LoginPage} ></Route>
          <Route path={`${match.path}/register`} component={RegisterPage} ></Route>
          <Route path={`${match.path}/console`} component={ConsolePage} ></Route>
        </Switch>
      </div>
    )
  }
}

export default withRouter(UserRouter)