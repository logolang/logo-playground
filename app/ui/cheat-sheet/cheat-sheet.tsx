import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as markdown from "markdown-it";

import { callActionSafe } from "app/utils/error";

import { resolveInject } from "app/di";
import { LocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { EventAction, EventsTrackingService } from "app/services/env/events-tracking.service";
import { ErrorService } from "app/services/env/error.service";
import { Loading } from "app/ui/_generic/loading";
import { MainMenuContainer } from "../main-menu.container";

import "./cheat-sheet.less";

interface State {
  isLoading: boolean;
  content: string[];
}

interface Props extends RouteComponentProps<void> {}

export class CheatSheet extends React.Component<Props, State> {
  private contentLoader = resolveInject(LocalizedContentLoader);
  private eventsTracking = resolveInject(EventsTrackingService);
  private errorService = resolveInject(ErrorService);

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      content: []
    };
  }

  async componentDidMount() {
    this.eventsTracking.sendEvent(EventAction.openCheatsheet);
    await this.loadData();
  }

  private async loadData() {
    const contentMd = await callActionSafe(this.errorService.handleError, async () =>
      this.contentLoader.getFileContent("cheat-sheet.md")
    );
    if (contentMd) {
      const md = new markdown({
        html: true // Enable HTML tags in source;
      });

      const content = contentMd
        .split(/\n#\s/g)
        .map(p => p.trim())
        .filter(p => !!p)
        .map(p => md.render(p));

      this.setState({ content: content });
    }
    this.setState({ isLoading: false });
  }

  render(): JSX.Element {
    return (
      <div className="ex-page-container">
        <MainMenuContainer />
        <div className="ex-page-content">
          <div className="container">
            <Loading fullPage isLoading={this.state.isLoading} />
            <br />
            <div className="columns is-desktop">
              {this.state.content.map((content, index) => (
                <div className="column is-one-third-desktop" key={index}>
                  <div
                    className="doc-section content"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              ))}
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}
