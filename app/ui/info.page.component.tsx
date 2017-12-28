import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";

import { _T } from "app/services/customizations/localization.service";
import { resolveInject } from "app/di";
import { TitleService } from "app/services/infrastructure/title.service";
import { IAppInfo } from "app/services/infrastructure/app-info";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

interface IComponentState {}

interface IComponentProps extends RouteComponentProps<void> {}

export class InfoPageComponent extends React.Component<IComponentProps, IComponentState> {
  private titleService = resolveInject(TitleService);
  private appInfo = resolveInject(IAppInfo);
  private eventsTracking = resolveInject(IEventsTrackingService);

  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle(_T("About"));
    this.eventsTracking.sendEvent(EventAction.openAbout);
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <PageHeaderComponent title={_T("About")} />
            <br />
            <div className="card">
              <div className="card-content">
                <div className="content">
                  <p>{this.appInfo.description}</p>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
