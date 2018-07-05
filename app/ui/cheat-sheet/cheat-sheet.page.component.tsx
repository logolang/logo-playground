import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as markdown from "markdown-it";

import { callActionSafe } from "app/utils/error-helpers";

import { resolveInject } from "app/di";
import { $T } from "app/i18n/strings";
import { TitleService } from "app/services/infrastructure/title.service";
import { LocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";
import { EventAction, EventsTrackingService } from "app/services/infrastructure/events-tracking.service";
import { ErrorService } from "app/services/infrastructure/error.service";
import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import "./cheat-sheet.page.component.less";

interface IComponentState {
  isLoading: boolean;
  content: string[];
}

interface IComponentProps extends RouteComponentProps<void> {}

export class CheatSheetPageComponent extends React.Component<IComponentProps, IComponentState> {
  private titleService = resolveInject(TitleService);
  private contentLoader = resolveInject(LocalizedContentLoader);
  private eventsTracking = resolveInject(EventsTrackingService);
  private errorService = resolveInject(ErrorService);

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      isLoading: true,
      content: []
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle($T.cheatSheet.cheatSheetTitle);
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
        <MainMenuComponent />
        <div className="ex-page-content">
          <div className="container">
            <LoadingComponent fullPage isLoading={this.state.isLoading} />
            <br />
            <div className="columns is-desktop">
              {this.state.content.map((content, index) => (
                <div className="column is-one-third-desktop" key={index}>
                  <div className="doc-section content" dangerouslySetInnerHTML={{ __html: content }} />
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
