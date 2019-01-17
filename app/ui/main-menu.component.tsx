import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import * as cn from "classnames";

import { resolveInject } from "app/di";
import { DependecyInjectionSetupService } from "app/di-setup";
import { Routes } from "app/routes";
import { $T } from "app/i18n/strings";
import { CurrentUserService } from "app/services/login/current-user.service";
import { LoginService } from "app/services/login/login.service";

interface IComponentState {
  isMenuToggled?: boolean;
}

interface IComponentProps {
  pullRightChildren?: JSX.Element;
}

export class MainMenuComponent extends React.Component<IComponentProps, IComponentState> {
  private loginService = resolveInject(LoginService);
  private currentUser = resolveInject(CurrentUserService);
  private diService = resolveInject(DependecyInjectionSetupService);

  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  menuLogOutClick = async () => {
    await this.loginService.signOut();
    await this.diService.reset();
  };

  render(): JSX.Element {
    const loginStatus = this.currentUser.getLoginStatus();
    const userPic = loginStatus.userInfo.attributes.imageUrl;
    return (
      <nav className="navbar navbar-mobile-fix" role="navigation" aria-label="main navigation">
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
              {$T.gallery.galleryTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.tutorialsRoot.build({})}>
              {$T.tutorial.tutorialsTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.cheatSheetRoot.build({})}>
              {$T.cheatSheet.cheatSheetTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.playgroundV2Default.build({})}>
              {$T.program.playgroundTitle}
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
                  {$T.settings.settingsTitle}
                </NavLink>
                <NavLink className="navbar-item" activeClassName="is-active" to={Routes.infoRoot.build({})}>
                  <i className="fa fa-info icon-fixed-width" aria-hidden="true" />
                  {$T.about.aboutTitle}
                </NavLink>
                <hr className="navbar-divider" />
                {!loginStatus.isLoggedIn && (
                  <NavLink className="navbar-item" activeClassName="is-active" to={Routes.loginRoot.build({})}>
                    <i className="fa fa-sign-in icon-fixed-width" aria-hidden="true" />
                    {$T.common.signIn}
                  </NavLink>
                )}
                {loginStatus.isLoggedIn && (
                  <a href="javascript:void(0)" className="navbar-item" onClick={this.menuLogOutClick}>
                    <i className="fa fa-sign-out icon-fixed-width" aria-hidden="true" />
                    {$T.common.signOut}
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
