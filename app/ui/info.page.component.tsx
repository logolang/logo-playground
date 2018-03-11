import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as markdown from "markdown-it";

import { MainMenuComponent } from "app/ui/main-menu.component";

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
  private thirdPartyCreditsMd: string;

  constructor(props: IComponentProps) {
    super(props);
    this.state = {};
    this.titleService.setDocumentTitle(_T("About"));
    this.eventsTracking.sendEvent(EventAction.openAbout);

    const contentMd = require("CREDITS.md") as string;
    const md = new markdown({
      html: true // Enable HTML tags in source;
    });

    this.thirdPartyCreditsMd = md.render(contentMd);
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <h1 className="title">Logo playground</h1>
            <br />
            <h2 className="subtitle">{this.appInfo.description}</h2>
            <br />
            <div className="card">
              <div className="card-content">
                <h2 className="subtitle">Source code</h2>
                <p>
                  Project is hosted on{" "}
                  <a href="https://github.com/logolang/logo-playground">
                    <i className="fa fa-github" aria-hidden="true" /> Github
                  </a>
                </p>
                <p>
                  Deployed on <strong>{this.appInfo.builtOn}</strong>
                </p>
                <p>
                  Code version <strong>{this.appInfo.gitVersion}</strong>
                </p>
              </div>
            </div>
            <div className="card">
              <div className="card-content">
                <h2 className="subtitle">Third-party assets</h2>
                <div className="content">
                  <div dangerouslySetInnerHTML={{ __html: this.thirdPartyCreditsMd }} />
                </div>
              </div>
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}
