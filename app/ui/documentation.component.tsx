import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

import { callActionSafe } from "app/utils/async-helpers";

import { resolveInject } from "app/di";
import { _T } from "app/services/customizations/localization.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { LoadingComponent } from "app/ui/_generic/loading.component";

import "./documentation.component.scss";

interface IComponentState {
  isLoading: boolean;
  content: string;
}

interface IComponentProps extends RouteComponentProps<void> {}

export class DocumentationComponent extends React.Component<IComponentProps, IComponentState> {
  private notificationService = resolveInject(INotificationService);
  private titleService = resolveInject(TitleService);
  private contentLoader = resolveInject(ILocalizedContentLoader);

  private errorHandler = (err: string) => {
    this.notificationService.push({ message: err, type: "danger" });
    this.setState({ isLoading: false });
  };

  constructor(props: IComponentProps) {
    super(props);

    this.state = {
      isLoading: true,
      content: ""
    };
  }

  async componentDidMount() {
    this.titleService.setDocumentTitle(_T("Documentation"));
    await this.loadData();
  }

  private async loadData() {
    const content = await callActionSafe(this.errorHandler, async () =>
      this.contentLoader.getFileContent("reference.html")
    );
    if (content) {
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
            <div className="doc-section" dangerouslySetInnerHTML={{ __html: this.state.content }} />
            <br />
          </div>
        </div>
      </div>
    );
  }
}
