import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";

import { _T } from "app/services/customizations/localization.service";
import { lazyInject } from "app/di";
import { TitleService } from "app/services/infrastructure/title.service";
import { IAppInfo } from "app/services/infrastructure/app-info";

interface IComponentState {}

interface IComponentProps extends RouteComponentProps<void> {}

export class AboutComponent extends React.Component<IComponentProps, IComponentState> {
  @lazyInject(TitleService) private titleService: TitleService;
  @lazyInject(IAppInfo) private appInfo: IAppInfo;

  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle(_T("About"));
  }

  render(): JSX.Element {
    return (
      <div>
        <MainMenuComponent />
        <div className="container">
          <br />
          <PageHeaderComponent title={_T("About")} />
          <p>
            {this.appInfo.description}
          </p>
          <p>
            <strong>{_T("Package name")}:</strong> {this.appInfo.name}
          </p>
          <p>
            <strong>{_T("App version")}:</strong> {this.appInfo.version}
          </p>
          <p>
            <strong>{_T("Code version")}:</strong> {this.appInfo.gitVersion}
          </p>
        </div>
      </div>
    );
  }
}
