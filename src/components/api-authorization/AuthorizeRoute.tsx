import React from "react";
import { Route, Redirect } from "react-router-dom";
import {
  ApplicationPaths,
  QueryParameterNames
} from "./ApiAuthorizationConstants";
import authService from "./AuthorizeService";
import { RouteProps } from "react-router";

export default class AuthorizeRoute extends React.PureComponent<
  RouteProps,
  { ready: boolean; authenticated: boolean }
> {
  public state = {
    ready: false,
    authenticated: false
  };
  private _subscription: number | undefined = undefined;

  componentDidMount() {
    this._subscription = authService.subscribe(() =>
      this.authenticationChanged()
    );
    this.populateAuthenticationState();
  }

  componentWillUnmount() {
    authService.unsubscribe(this._subscription);
  }

  render() {
    const { ready, authenticated } = this.state;
    const redirectUrl = `${ApplicationPaths.Login}?${
      QueryParameterNames.ReturnUrl
    }=${encodeURI(window.location.href)}`;
    if (!ready) {
      return <div></div>;
    } else {
      const { component: Component, ...rest } = this.props;
      return (
        <Route
          {...rest}
          render={props => {
            if (authenticated) {
              return <React.Component {...props} />;
            } else {
              return <Redirect to={redirectUrl} />;
            }
          }}
        />
      );
    }
  }

  async populateAuthenticationState() {
    const authenticated = await authService.isAuthenticated();
    this.setState({ ready: true, authenticated });
  }

  async authenticationChanged() {
    this.setState({ ready: false, authenticated: false });
    await this.populateAuthenticationState();
  }
}
