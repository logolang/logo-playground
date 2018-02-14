import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import * as cn from "classnames";

import { resolveInject } from "app/di";
import { DependecyInjectionSetup } from "app/di-setup";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ILoginService } from "app/services/login/login.service";

interface IComponentState {
  isMenuToggled?: boolean;
}

interface IComponentProps {
  pullRightChildren?: JSX.Element;
}

export class MainMenuComponent extends React.Component<IComponentProps, IComponentState> {
  private loginService = resolveInject(ILoginService);
  private currentUser = resolveInject(ICurrentUserService);

  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  menuLogOutClick = async () => {
    await this.loginService.signOut();
    await DependecyInjectionSetup.reset();
    // refresh browser window
    window.location.reload(true);
  };

  render(): JSX.Element {
    const loginStatus = this.currentUser.getLoginStatus();
    const userPic = loginStatus.userInfo.attributes.imageUrl;
    return (
      <nav className="navbar navbar-mobile-fix">
        <div className="navbar-brand">
          <Link className="navbar-item" to={Routes.galleryRoot.build({})}>
            <span className="ex-app-logo" />
          </Link>

          <div
            className={cn("navbar-burger burger", { "is-active": this.state.isMenuToggled })}
            onClick={() => {
              this.setState({ isMenuToggled: !this.state.isMenuToggled });
            }}
          >
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className={cn("navbar-menu", { "is-active": this.state.isMenuToggled })}>
          <div className="navbar-start">
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.galleryRoot.build({})}>
              {_T("Gallery")}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.tutorialsRoot.build({})}>
              {_T("Tutorials")}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.cheatSheetRoot.build({})}>
              {_T("Cheat sheet")}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.playground.build({})}>
              {_T("Playground")}
            </NavLink>
          </div>
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <span className="navbar-link is-active">
                {userPic ? (
                  <img src={userPic} />
                ) : (
                  <span>
                    <i className="fa fa-user-o" aria-hidden="true" />
                  </span>
                )}
              </span>
              <div className="navbar-dropdown is-right">
                <NavLink className="navbar-item" activeClassName="is-active" to={Routes.settingsRoot.build({})}>
                  <i className="fa fa-wrench icon-fixed-width" aria-hidden="true" />
                  {_T("Settings")}
                </NavLink>
                <NavLink className="navbar-item" activeClassName="is-active" to={Routes.infoRoot.build({})}>
                  <i className="fa fa-info icon-fixed-width" aria-hidden="true" />
                  {_T("About")}
                </NavLink>
                <hr className="navbar-divider" />
                {!loginStatus.isLoggedIn && (
                  <NavLink className="navbar-item" activeClassName="is-active" to={Routes.loginRoot.build({})}>
                    <i className="fa fa-sign-in icon-fixed-width" aria-hidden="true" />
                    {_T("Sign in")}
                  </NavLink>
                )}
                {loginStatus.isLoggedIn && (
                  <a href="#" className="navbar-item" onClick={this.menuLogOutClick}>
                    <i className="fa fa-sign-out icon-fixed-width" aria-hidden="true" />
                    {_T("Sign out")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
