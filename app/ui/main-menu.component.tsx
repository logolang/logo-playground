import * as React from "react";
import * as Color from "color";

import { NavbarUsercardComponent } from "app/ui/_generic/navbar-usercard.component";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ILoginService } from "app/services/login/login.service";
import { Link } from "react-router-dom";

interface IComponentState {}

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

    return (
      <div>
        <Link to={Routes.galleryRoot.build({})}>
          {_T("Gallery")}
        </Link>
        <Link to={Routes.documentationRoot.build({})}>
          {_T("Documentation")}
        </Link>
        <Link to={Routes.tutorialsRoot.build({})}>
          {_T("Tutorials")}
        </Link>
        <Link to={Routes.playgroundRoot.build({ storageType: "playground", programId: "0" })}>
          {_T("Playground")}
        </Link>

        {this.props.children}

        <div>
          {loginStatus.userInfo.attributes.name}
          <img src={loginStatus.userInfo.attributes.imageUrl} />
        </div>

        <Link to={Routes.settingsRoot.build({})}>
          {_T("User profile")}
        </Link>
        <Link to={Routes.aboutRoot.build({})}>
          {_T("About...")}
        </Link>
        {!loginStatus.isLoggedIn &&
          <Link to={Routes.loginRoot.build({})}>
            {_T("Log in")}
          </Link>}
        {loginStatus.isLoggedIn &&
          <a href="#" onClick={this.menuLogOutClick}>
            {_T("Log out")}
          </a>}
      </div>
    );
  }
}
