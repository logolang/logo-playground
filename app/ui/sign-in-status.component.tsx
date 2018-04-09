import * as React from "react";
import { Subscription } from "rxjs/Subscription";

import { resolveInject } from "app/di";
import { DependecyInjectionSetupService } from "app/di-setup";
import { _T } from "app/services/customizations/localization.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { ILoginService } from "app/services/login/login.service";
import { AuthProvider } from "app/services/login/user-info";

interface IComponentState {}

interface IComponentProps {
  onSignIn?(): void;
}

export class SignInStatusComponent extends React.Component<IComponentProps, IComponentState> {
  private currentUser = resolveInject(ICurrentUserService);
  private loginService = resolveInject(ILoginService);
  private diService = resolveInject(DependecyInjectionSetupService);

  private subscriptions: Subscription[] = [];
  private loginStatus = this.currentUser.getLoginStatus();

  constructor(props: IComponentProps) {
    super(props);
  }

  async componentDidMount() {
    this.subscriptions.push(
      this.currentUser.loginStatusObservable.subscribe(async status => {
        if (this.loginStatus.userInfo.id != status.userInfo.id) {
          if (status.isLoggedIn) {
            this.props.onSignIn && this.props.onSignIn();
            await this.diService.reset();
          }
        }
      })
    );
    await this.loginService.initLoginUI();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getAuthProviderIcon(provider: AuthProvider) {
    switch (provider) {
      case AuthProvider.google:
        return (
          <>
            <i className="fa fa-google" aria-hidden="true" />&nbsp;
          </>
        );
    }
    return null;
  }

  render(): JSX.Element {
    const userInfo = this.loginStatus.userInfo;
    return (
      <div>
        <div className="media">
          {userInfo.attributes.imageUrl && (
            <div className="media-left">
              <figure className="image is-48x48">
                <img src={userInfo.attributes.imageUrl} alt="User image" />
              </figure>
            </div>
          )}

          <div className="media-content">
            <p className="title is-4">{userInfo.attributes.name || _T("Guest")}</p>
            <p className="subtitle is-6">{userInfo.attributes.email}</p>
          </div>
        </div>

        <div className="content">
          {this.currentUser.getLoginStatus().isLoggedIn ? (
            <>
              <div className="level is-mobile">
                <div className="level-left">
                  <div className="level-item">{_T("You are signed in via")}</div>
                  <div className="level-item">
                    <span className="tag is-primary is-medium">
                      {this.getAuthProviderIcon(userInfo.attributes.authProvider)} {userInfo.attributes.authProvider}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p>{_T("NOT_LOGGED_IN_TEXT_BLOCK")}</p>
              {this.loginService.renderLoginUI()}
            </>
          )}
        </div>
      </div>
    );
  }
}
