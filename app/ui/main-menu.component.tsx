import * as React from "react";
import { Link } from "react-router-dom";
import * as cn from "classnames";

import { lazyInject } from "app/di";
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
  @lazyInject(ILoginService) private loginService: ILoginService;
  @lazyInject(ICurrentUserService) private currentUser: ICurrentUserService;

  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  menuLogOutClick = async () => {
    await this.loginService.signOut();
    // refresh browser window
    window.location.reload(true);
  };

  render(): JSX.Element {
    const loginStatus = this.currentUser.getLoginStatus();
    const userPic = loginStatus.userInfo.attributes.imageUrl || require("./images/user-32-pic.png");
    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="navbar-item">
            <span className="ex-app-logo" />
          </span>

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
            <Link className="navbar-item" to={Routes.galleryRoot.build({})}>
              {_T("Gallery")}
            </Link>
            <Link className="navbar-item" to={Routes.documentationRoot.build({})}>
              {_T("Documentation")}
            </Link>
            <Link className="navbar-item" to={Routes.tutorialsRoot.build({})}>
              {_T("Tutorials")}
            </Link>
            <Link
              className="navbar-item"
              to={Routes.playgroundRoot.build({ storageType: "playground", programId: "0" })}
            >
              {_T("Playground")}
            </Link>
          </div>
          <div className="navbar-end">
            <div className="navbar-item has-dropdown is-hoverable">
              <span className="navbar-link is-active">
                <img src={userPic} />
              </span>
              <div className="navbar-dropdown is-right">
                <Link className="navbar-item" to={Routes.settingsRoot.build({})}>
                  {_T("User profile")}
                </Link>
                <Link className="navbar-item" to={Routes.aboutRoot.build({})}>
                  {_T("About...")}
                </Link>
                <hr className="navbar-divider" />
                {!loginStatus.isLoggedIn && (
                  <Link className="navbar-item" to={Routes.loginRoot.build({})}>
                    {_T("Log in")}
                  </Link>
                )}
                {loginStatus.isLoggedIn && (
                  <a href="#" className="navbar-item" onClick={this.menuLogOutClick}>
                    {_T("Log out")}
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
