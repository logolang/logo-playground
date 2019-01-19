import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import * as cn from "classnames";

import { resolveInject } from "app/di";
import { DependecyInjectionSetupService } from "app/di-setup";
import { Routes } from "app/routes";
import { $T } from "app/i18n/strings";
import { CurrentUserService } from "app/services/login/current-user.service";
import { LoginService } from "app/services/login/login.service";

interface State {
  isMenuToggled?: boolean;
}

interface Props {
  pullRightChildren?: JSX.Element;
}

export class MainMenu extends React.Component<Props, State> {
  private loginService = resolveInject(LoginService);
  private currentUser = resolveInject(CurrentUserService);
  private diService = resolveInject(DependecyInjectionSetupService);

  constructor(props: Props) {
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
          <Link className="navbar-item" to={Routes.gallery.build({})}>
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
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.gallery.build({})}>
              {$T.gallery.galleryTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.tutorials.build({})}>
              {$T.tutorial.tutorialsTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.cheatSheet.build({})}>
              {$T.cheatSheet.cheatSheetTitle}
            </NavLink>
            <NavLink className="navbar-item" activeClassName="is-active" to={Routes.playgroundDefault.build({})}>
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
                <NavLink className="navbar-item" activeClassName="is-active" to={Routes.settings.build({})}>
                  <i className="fa fa-wrench icon-fixed-width" aria-hidden="true" />
                  {$T.settings.settingsTitle}
                </NavLink>
                <NavLink className="navbar-item" activeClassName="is-active" to={Routes.infoPage.build({})}>
                  <i className="fa fa-info icon-fixed-width" aria-hidden="true" />
                  {$T.about.aboutTitle}
                </NavLink>
                <hr className="navbar-divider" />
                {!loginStatus.isLoggedIn && (
                  <NavLink className="navbar-item" activeClassName="is-active" to={Routes.loginPage.build({})}>
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
