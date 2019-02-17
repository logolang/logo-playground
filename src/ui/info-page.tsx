import * as React from "react";
import * as markdown from "markdown-it";

import { resolve } from "utils/di";
import { APP_INFO } from "app-info";
import {
  EventsTrackingService,
  EventAction
} from "services/infrastructure/events-tracking.service";

import { MainMenuContainer } from "./main-menu.container";

interface State {}

interface Props {}

export class InfoPage extends React.Component<Props, State> {
  private eventsTracking = resolve(EventsTrackingService);
  private thirdPartyCreditsMd: string;

  constructor(props: Props) {
    super(props);
    this.state = {};
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
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <br />
            <h1 className="title">Logo playground</h1>
            <br />
            <h2 className="subtitle">{APP_INFO.description}</h2>
            <br />
            <div className="card">
              <div className="card-content">
                <h2 className="subtitle">Source code</h2>
                <p>
                  Project is hosted on{" "}
                  <a href="https://github.com/logolang/logo-playground">
                    <i className="fab fa-github" aria-hidden="true" /> Github
                  </a>
                </p>
                <p>
                  Deployed on <strong>{APP_INFO.builtOn}</strong>
                </p>
                <p>
                  Code version <strong>{APP_INFO.gitVersion}</strong>
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
