import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Subscription } from "rxjs/Subscription";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";

import { resolveInject } from "app/di";
import { DependecyInjectionSetup } from "app/di-setup";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import { ICurrentUserService } from "app/services/login/current-user.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { ILoginService } from "app/services/login/login.service";

interface IComponentState {}

interface IComponentProps extends RouteComponentProps<void> {}

export class LoginPageComponent extends React.Component<IComponentProps, IComponentState> {
  private currentUser = resolveInject(ICurrentUserService);
  private loginService = resolveInject(ILoginService);
  private titleService = resolveInject(TitleService);
  private navService = resolveInject(INavigationService);

  private subscriptions: Subscription[] = [];

  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle(_T("Sign in"));
  }

  async componentDidMount() {
    this.subscriptions.push(
      this.currentUser.loginStatusObservable.subscribe(status => {
        if (status) {
          setTimeout(async () => {
            await DependecyInjectionSetup.reset();
            this.navService.navigate({ route: Routes.root.build({}) });
          }, 400);
        }
      })
    );
    await this.loginService.initLoginUI();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  render(): JSX.Element {
    return (
      <div>
        <MainMenuComponent />
        <div className="container">
          <br />
          <PageHeaderComponent title={_T("Sign in")} />
          <br />
          <br />
          {this.loginService.renderLoginUI()}
        </div>
      </div>
    );
  }
}
